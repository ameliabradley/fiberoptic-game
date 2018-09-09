import { randomInt, getRandomSetBit, getRandomSide } from "./util";
import * as Pipe from "./pipe";
import * as Shape from "./shape";
import * as Queue from "./queue";
import * as Keys from "../shared/keyboard";
import { getTime, logi } from "./imports";
import { render } from "./simpleRender";

export type Time = i32;

@unmanaged
export class World {
  static gridSizeX: i32 = 0;
  static gridSizeY: i32 = 0;
  static nextPipeTime: Time = 0;

  static cursorPositionX: i32 = 0;
  static cursorPositionY: i32 = 0;

  static lastUpdatedTime: i32 = 0;

  static countdownEnd: i32;
  static readonly countdownTotal: i32 = 1000 * 15;
  static gameOver: boolean = false;

  static flowMultiplier: i32 = 1;
  static isWinning: bool = false;

  static OFFSET_PIPE_ARRAY: usize = HEAP_BASE;
  static OFFSET_QUEUE_ARRAY: usize;
  static OFFSET_CANVAS: usize;
}

export function setupWorld(sizeX: i32, sizeY: i32): void {
  World.gridSizeX = sizeX;
  World.gridSizeY = sizeY;

  // Setup array offset
  World.OFFSET_QUEUE_ARRAY =
    World.OFFSET_PIPE_ARRAY + World.gridSizeX * World.gridSizeY * Pipe.SIZE;
  let endQueue = World.OFFSET_QUEUE_ARRAY + Queue.MAX * Queue.SIZE;

  // Javascript's Uint32Array requires the canvas offset to be a multiple of 4
  World.OFFSET_CANVAS = endQueue + (4 - (endQueue % 4));

  Queue.fill();

  for (let i = 0; i < sizeX * sizeY; i++) {
    Pipe.saveShape(i, Shape.PIPE_OUTLET_NONE);
  }

  let maxX = sizeX - 1;
  let maxY = sizeY - 1;

  World.countdownEnd = getTime() + World.countdownTotal;

  let sideIndex = getRandomSide(sizeX, sizeY);
  let startX = sideIndex % sizeX;
  let startY = (sideIndex - startX) / sizeX;
  let startOptions = getValidOutlets(startX, startY, maxX, maxY);
  let startDirection = getRandomSetBit(startOptions);
  Pipe.saveShape(sideIndex, startDirection | Shape.PIPE_START);
  Pipe.startFlowFrom(
    Pipe.getIndex(startX, startY, sizeX),
    Shape.PIPE_OUTLET_LEFT,
    World.countdownEnd
  );

  let endX = maxX - startX;
  let endY = maxY - startY;
  let endOptions = getValidOutlets(endX, endY, maxX, maxY);
  let endDirection = getRandomSetBit(endOptions);
  Pipe.saveShape(endX + endY * sizeX, endDirection | Shape.PIPE_END);

  /*
  Pipe.saveShape(Pipe.getIndex(2, 1, sizeX), Shape.PIPE_OUTLET_TOP);
  Pipe.saveShape(Pipe.getIndex(2, 2, sizeX), Shape.PIPE_OUTLET_BOTTOM);
  Pipe.saveShape(Pipe.getIndex(2, 3, sizeX), Shape.PIPE_OUTLET_LEFT);
  Pipe.saveShape(Pipe.getIndex(2, 4, sizeX), Shape.PIPE_OUTLET_RIGHT);
  Pipe.saveShape(Pipe.getIndex(2, 5, sizeX), Shape.PIPE_OUTLET_TOP | Shape.PIPE_OUTLET_BOTTOM);
  Pipe.saveShape(Pipe.getIndex(2, 6, sizeX), Shape.PIPE_OUTLET_CROSS);
  */

  /*
  Pipe.saveShape(Pipe.getIndex(2, 2, sizeX), Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_END);
  Pipe.saveShape(Pipe.getIndex(3, 2, sizeX), Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_BOTTOM);
  Pipe.saveShape(
    Pipe.getIndex(3, 3, sizeX),
    Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_TOP | Shape.PIPE_BLOCKED
  );
  Pipe.startFlowFrom(Pipe.getIndex(2, 2, sizeX), Shape.PIPE_OUTLET_LEFT, World.countdownEnd);
  */

  /*
  Pipe.saveShape(Pipe.getIndex(2, 2, sizeX), Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_END);
  // Pipe.saveShape(Pipe.getIndex(3, 2, sizeX), Shape.PIPE_OUTLET_CROSS | Shape.PIPE_BLOCKED);
  Pipe.saveShape(Pipe.getIndex(4, 2, sizeX), Shape.PIPE_START | Shape.PIPE_OUTLET_LEFT);
  Pipe.startFlowFrom(Pipe.getIndex(4, 2, sizeX), Shape.PIPE_OUTLET_RIGHT, World.countdownEnd);
  */

  // Testing
  /*
  Pipe.saveShape(sizeX + 0, Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_RIGHT);
  Pipe.startFlowFrom(sizeX + 0, Shape.PIPE_OUTLET_LEFT, World.countdownEnd);
  Pipe.saveShape(sizeX + 1, Shape.PIPE_OUTLET_CROSS);
  Pipe.saveShape(sizeX + 2, Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_BOTTOM);
  Pipe.saveShape(sizeX + sizeX + 2, Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_TOP);
  Pipe.saveShape(sizeX + sizeX + 1, Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_OUTLET_TOP);
  Pipe.saveShape(1, Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_OUTLET_BOTTOM);
  */
}

export function updateTime(time: i32): void {
  World.lastUpdatedTime = time;
}

export function getValidOutlets(startX: i32, startY: i32, maxX: i32, maxY: i32): u8 {
  let options: u8 = 0b1111; // TBLR
  options &= startX === 0 ? 0b1101 : startX === maxX ? 0b1110 : 0b1111;
  options &= startY === 0 ? 0b0111 : startY === maxY ? 0b1011 : 0b1111;
  return options;
}

export function getSizeX(): i32 {
  return World.gridSizeX;
}

export function getSizeY(): i32 {
  return World.gridSizeY;
}

export function getHeapBase(): usize {
  return HEAP_BASE;
}

export function setKeys(char: i8): void {
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

export function getOffsetCanvas(): i32 {
  return World.OFFSET_CANVAS;
}

function showGameOver(): void {
  World.gameOver = true;
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

export function step(width: i32, height: i32, time: i32): void {
  /*
  if (time > World.countdownEnd) {
    for (let x = 0; x < World.gridSizeX; x++) {
      for (let y = 0; y < World.gridSizeY; y++) {
        let index = Pipe.getIndex(x, y, World.gridSizeX);
        let shape = Pipe.getShape(index);
        let inlet = getInletFromOutlet(burst);
        if (shape & Shape.PIPE_START) {
          Pipe.startFlowFrom(index, Shape.PIPE_OUTLET_LEFT, );
        }
      }
    }
  }
  */

  for (let x = 0; x < World.gridSizeX; x++) {
    for (let y = 0; y < World.gridSizeY; y++) {
      let index = Pipe.getIndex(x, y, World.gridSizeX);
      let burst: u8 = Pipe.checkBurst(index, time, World.flowMultiplier);
      if (burst > 0) {
        let burstY = getBurstY(burst, y);
        let burstX = getBurstX(burst, x);

        if (outOfBounds(burstX, burstY)) {
          showGameOver();
        } else {
          let index = Pipe.getIndex(burstX, burstY, World.gridSizeX);
          let shape = Pipe.getShape(index);
          let inlet = getInletFromOutlet(burst);
          if (shape > 0 && (inlet & shape) > 0) {
            Pipe.startFlowFrom(index, inlet, time);
          } else {
            showGameOver();
          }
        }
      }
    }
  }

  render(width, height, time);
}

function getBurstX(burst: u8, x: i32): i32 {
  return x + (burst & Shape.PIPE_OUTLET_LEFT ? -1 : burst & Shape.PIPE_OUTLET_RIGHT ? 1 : 0);
}

function getBurstY(burst: u8, y: i32): i32 {
  return y + (burst & Shape.PIPE_OUTLET_TOP ? -1 : burst & Shape.PIPE_OUTLET_BOTTOM ? 1 : 0);
}
