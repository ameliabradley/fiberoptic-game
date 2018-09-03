import { randomInt, getRandomSetBit, getRandomSide } from "./util";
import * as Pipe from "./pipe";
import * as Shape from "./shape";
import * as Queue from "./queue";

export type Time = i32;

@unmanaged
export class World {
  static gridSizeX: i32 = 0;
  static gridSizeY: i32 = 0;
  static nextPipeTime: Time = 0;

  static OFFSET_PIPE_ARRAY: usize = HEAP_BASE;
  static OFFSET_QUEUE_ARRAY: usize;
}

export function setupWorld(sizeX: i32, sizeY: i32): void {
  World.gridSizeX = sizeX;
  World.gridSizeY = sizeY;

  // Setup array offset
  World.OFFSET_QUEUE_ARRAY = HEAP_BASE + World.gridSizeX * World.gridSizeY * Pipe.SIZE;

  Queue.fill();

  for (let i = 0; i < sizeX * sizeY; i++) {
    Pipe.saveShape(i, Shape.PIPE_OUTLET_NONE);
  }

  let maxX = sizeX - 1;
  let maxY = sizeY - 1;

  let sideIndex = getRandomSide(sizeX, sizeY);

  let startX = sideIndex % sizeX;
  let startY = (sideIndex - startX) / sizeX;
  let startOptions = getValidOutlets(startX, startY, maxX, maxY);
  let startDirection = getRandomSetBit(startOptions);
  Pipe.saveShape(sideIndex, startDirection | Shape.PIPE_START);

  let endX = maxX - startX;
  let endY = maxY - startY;
  let endOptions = getValidOutlets(endX, endY, maxX, maxY);
  let endDirection = getRandomSetBit(endOptions);
  Pipe.saveShape(endX + endY * sizeX, endDirection | Shape.PIPE_END);
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