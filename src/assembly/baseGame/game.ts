import * as Pipe from "./pipe";
import * as Shape from "./shape";
import * as Queue from "./queue";
import * as Keys from "../../shared/keyboard";
import { getTime, logi, saveNumber, fetchSavedNumber } from "../imports";
import { generateRandomMap } from "../map/randomGenerator";

export type Time = i32;

const RESTART_GAME_AFTER = 1000 * 3;
const FLOW_STARTS_AFTER = 1000 * 15;

@unmanaged
export class World {
  static gridSizeX: i32 = 0;
  static gridSizeY: i32 = 0;

  static cursorPositionX: i32 = 0;
  static cursorPositionY: i32 = 0;

  static levelStartTime: i32 = 0;

  static countdownEnd: i32;
  static readonly countdownTotal: i32 = FLOW_STARTS_AFTER;
  static gameOver: boolean = false;
  static gameResetTimeout: i32 = 0;
  static showingStartScreen: bool = true;

  static flowMultiplier: i32 = 1;
  static isWinning: bool = false;

  static OFFSET_PIPE_ARRAY: usize = HEAP_BASE;
  static OFFSET_QUEUE_ARRAY: usize;
  static OFFSET_RENDERER: usize;

  // Game options
  static score: i32 = 0;
}

export function setupWorld(sizeX: i32, sizeY: i32): void {
  World.gridSizeX = sizeX;
  World.gridSizeY = sizeY;

  World.gameOver = false;
  World.gameResetTimeout = 0;
  World.flowMultiplier = 1;
  World.isWinning = false;

  // Setup array offset
  World.OFFSET_QUEUE_ARRAY =
    World.OFFSET_PIPE_ARRAY + World.gridSizeX * World.gridSizeY * Pipe.SIZE;
  let endQueue = World.OFFSET_QUEUE_ARRAY + Queue.MAX * Queue.SIZE;

  // Javascript's Uint32Array requires the canvas offset to be a multiple of 4
  World.OFFSET_RENDERER = endQueue + (4 - (endQueue % 4));

  let time = getTime();
  World.countdownEnd = time + FLOW_STARTS_AFTER;

  generateRandomMap(sizeX, sizeY);

  Queue.fill();
}

export function getHeapBase(): usize {
  return HEAP_BASE;
}

export function setKeys(char: i8): void {
  if (World.showingStartScreen) {
    if ((char & Keys.FLAG_SPACE) > 0) {
      World.showingStartScreen = false;
      restart();
    }
    return;
  }

  let y = World.cursorPositionY + (char & Keys.FLAG_DOWN ? 1 : char & Keys.FLAG_UP ? -1 : 0);
  let x = World.cursorPositionX + (char & Keys.FLAG_RIGHT ? 1 : char & Keys.FLAG_LEFT ? -1 : 0);

  if (!outOfBounds(x, y)) {
    World.cursorPositionX = x;
    World.cursorPositionY = y;
  }

  if (char & Keys.FLAG_SPACE) {
    if (!World.isWinning) {
      let index = World.cursorPositionX + World.cursorPositionY * World.gridSizeX;
      if (Pipe.validPlacementLocation(index)) {
        let newShape = Queue.pop();
        Pipe.saveShape(index, newShape);

        updateScore(World.score - 10);
        let winningMove = areAllStartFlowsConnectedToEndFlows();
        if (winningMove) {
          World.flowMultiplier = 8;
          World.isWinning = true;
        }
      }
    }
  }
}

function areAllStartFlowsConnectedToEndFlows(): bool {
  for (let x = 0; x < World.gridSizeX; x++) {
    for (let y = 0; y < World.gridSizeY; y++) {
      let index = Pipe.getIndex(x, y, World.gridSizeX);
      let shape = Pipe.getShape(index);
      if (shape & Shape.PIPE_START) {
        if (!flowConnected(index, shape)) {
          return false;
        }
      }
    }
  }

  return true;
}

function flowConnected(index: i32, flowFrom: u8): bool {
  let x = Pipe.getXFromIndex(index, World.gridSizeX);
  let y = Pipe.getYFromIndex(index, World.gridSizeX);

  let shape = Pipe.getShape(index);

  let outlet = Pipe.getOutlet(shape, flowFrom);
  let burstY = getBurstY(outlet, y);
  let burstX = getBurstX(outlet, x);
  if (!outOfBounds(burstX, burstY)) {
    let burstIndex = Pipe.getIndex(burstX, burstY, World.gridSizeX);
    let outletShape = Pipe.getShape(burstIndex);
    let inlet = getInletFromOutlet(outlet);
    if (outletShape > 0 && (inlet & outletShape) > 0) {
      if (outletShape & Shape.PIPE_END) {
        return true;
      }

      return flowConnected(burstIndex, inlet);
    }
  }

  return false;
}

function showGameOver(time: i32): void {
  World.gameOver = true;
  World.gameResetTimeout = time + RESTART_GAME_AFTER;
}

function outOfBounds(x: i32, y: i32): bool {
  if (x < 0) return true;
  if (y < 0) return true;
  if (x > World.gridSizeX - 1) return true;
  if (y > World.gridSizeY - 1) return true;
  return false;
}

function getInletFromOutlet(outlet: u8): u8 {
  switch (outlet) {
    case Shape.PIPE_OUTLET_BOTTOM:
      return Shape.PIPE_OUTLET_TOP;
    case Shape.PIPE_OUTLET_TOP:
      return Shape.PIPE_OUTLET_BOTTOM;
    case Shape.PIPE_OUTLET_LEFT:
      return Shape.PIPE_OUTLET_RIGHT;
    default:
    case Shape.PIPE_OUTLET_RIGHT:
      return Shape.PIPE_OUTLET_LEFT;
  }
}

export function step(time: i32): void {
  if (World.showingStartScreen) {
    return;
  }

  for (let x = 0; x < World.gridSizeX; x++) {
    for (let y = 0; y < World.gridSizeY; y++) {
      let index = Pipe.getIndex(x, y, World.gridSizeX);
      let burst: u8 = Pipe.checkBurst(index, time, World.flowMultiplier);
      if (burst > 0) {
        let burstY = getBurstY(burst, y);
        let burstX = getBurstX(burst, x);

        if (outOfBounds(burstX, burstY)) {
          showGameOver(time);
        } else {
          let index = Pipe.getIndex(burstX, burstY, World.gridSizeX);
          let shape = Pipe.getShape(index);
          let inlet = getInletFromOutlet(burst);
          if (shape > 0 && (inlet & shape) > 0) {
            Pipe.startFlowFrom(index, inlet, time);

            updateScore(World.score + 200);

            if (shape & Shape.PIPE_END) {
              World.gameResetTimeout = time + RESTART_GAME_AFTER;
            }
          } else {
            showGameOver(time);
          }
        }
      }
    }
  }

  if (World.gameResetTimeout > 0 && World.gameResetTimeout <= time) {
    if (World.gameOver) {
      updateScore(0);
      World.showingStartScreen = true;
    }
    restart();
  }
}

const SCORE_KEY = 1;
function updateScore(newScore: i32): void {
  World.score = newScore;
  if (fetchSavedNumber(SCORE_KEY) < newScore) {
    saveNumber(SCORE_KEY, newScore);
  }
}

export function getHighScore(): i32 {
  return fetchSavedNumber(SCORE_KEY);
}

function restart(): void {
  setupWorld(World.gridSizeX, World.gridSizeY);
}

function getBurstX(burst: u8, x: i32): i32 {
  return x + (burst & Shape.PIPE_OUTLET_LEFT ? -1 : burst & Shape.PIPE_OUTLET_RIGHT ? 1 : 0);
}

function getBurstY(burst: u8, y: i32): i32 {
  return y + (burst & Shape.PIPE_OUTLET_TOP ? -1 : burst & Shape.PIPE_OUTLET_BOTTOM ? 1 : 0);
}
