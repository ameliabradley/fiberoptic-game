import { randomInt, getRandomSetBit, getRandomSide } from "./util";
import * as Pipe from "./pipe";
import * as Shape from "./shape";

export type Time = i32;

@unmanaged
export class World {
  static gridSizeX: i32 = 0;
  static gridSizeY: i32 = 0;
  static nextPipeTime: Time = 0;
}

let offsetPipeArray = HEAP_BASE;

declare namespace console {
  function logi(val: i32, boolean?: bool): void;
}

export function setupWorld(sizeX: i32, sizeY: i32): void {
  World.gridSizeX = sizeX;
  World.gridSizeY = sizeY;

  for (let i = 0; i < sizeX * sizeY; i++) {
    Pipe.saveShape(i, Shape.PIPE_OUTLET_CROSS);
  }

  let maxX = sizeX - 1;
  let maxY = sizeY - 1;

  let sideIndex = getRandomSide(sizeX, sizeY);
  // let startIndex = (sideIndex < maxX) ? sideIndex : (sideIndex < (maxSide - maxX)) ? ... : sideIndex +

  let startX = sideIndex % sizeX;
  let startY = (sideIndex - startX) / sizeX;
  let startOptions = getValidOutlets(startX, startY, maxX, maxY);
  let startDirection = getRandomSetBit(startOptions);
  let start: u8 = startDirection | Shape.PIPE_START;
  Pipe.saveShape(sideIndex, start);
  console.logi(sideIndex);

  /*
  let badSpaceX: i32 = 0;
  let badSpaceY: i32 = 0;

  // prettier-ignore
  switch (startDirection) {
    case Shape.PIPE_OUTLET_BOTTOM: badSpaceY = startY + 1; badSpaceX = startX; break;
    case Shape.PIPE_OUTLET_TOP: badSpaceY = startY - 1; badSpaceX = startX; break;
    case Shape.PIPE_OUTLET_LEFT: badSpaceX = startX - 1; badSpaceY = startY; break;
    case Shape.PIPE_OUTLET_RIGHT: badSpaceX = startX + 1; badSpaceY = startY; break;
  }

  // Testing
  let endIndex = randomInt(0, maxX * maxY - 1);
  if (endIndex >= Pipe.getIndex(badSpaceX, badSpaceY, sizeX)) {
    endIndex++;
  }

  let endX = endIndex % sizeX;
  let endY = (endIndex - endX) / sizeX;
  let endOptions = getValidOutlets(startX, startY, maxX, maxY);
  let endDirection = getRandomSetBit(endOptions);
  Pipe.saveShape(endX + endY * sizeX, endDirection);
  */
}

function getValidOutlets(startX: i32, startY: i32, maxX: i32, maxY: i32): u8 {
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
