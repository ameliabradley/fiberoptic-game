import { randomInt, safeSetMem, getRandomSetBit } from "./util";
import * as Pipe from "./pipe";
import * as Shape from "./shape";

// See: https://stackoverflow.com/questions/39359740/what-are-enum-flags-in-typescript
export const enum ModifierFlags {
  NONE,
  PERMANENT = 1 << 1
}

export const enum PositionFlag {
  NONE = 0,
  TOP = 1,
  BOTTOM = 1 << 1,
  LEFT = 1 << 2,
  RIGHT = 1 << 3
}

export type Time = i32;

@unmanaged
export class World {
  static gridSizeX: i32 = 0;
  static gridSizeY: i32 = 0;
  static nextPipeTime: Time = 0;
  // content: Pipe[];
  // queue: Pipe[];

  /*
  save (offset: i32): void {
    store<i32>(offset, this.gridSizeX);
    store<i32>(offset + sizeof<i32>(), this.gridSizeY);
    store<Time>(offset + (sizeof<i32>() * 2), this.nextPipeTime);
  }

  load (offset: i32): void {
    this.gridSizeX = load<i32>(offset);
    this.gridSizeY = load<i32>(offset + sizeof<i32>());
    this.nextPipeTime = load<Time>(offset + (sizeof<i32>() * 2));
  }
  */
}

let offsetPipeArray = HEAP_BASE;

declare namespace console {
  function logi(val: i32): void;
}

export function setupWorld(sizeX: i32, sizeY: i32): void {
  World.gridSizeX = sizeX;
  World.gridSizeY = sizeY;

  for (let i = 0; i < sizeX * sizeY; i++) {
    Pipe.saveShape(i, Shape.CROSS);
  }

  let maxX = sizeX - 1;
  let maxY = sizeY - 1;
  let x = randomInt(0, maxX);
  let y = randomInt(0, maxY);

  let options: u8 = 0b1111; // TBLR
  options &= x === 0 ? 0b1101 : x === maxX ? 0b1110 : 0b1111;
  options &= y === 0 ? 0b0111 : y === maxY ? 0b1011 : 0b1111;
  console.logi(options);

  let shape: u8;
  // prettier-ignore
  switch (getRandomSetBit(options)) {
      case 0b1000: shape = Shape.START_T; break;
      case 0b0100: shape = Shape.START_B; break;
      case 0b0010: shape = Shape.START_L; break;

      default:
      case 0b0001: shape = Shape.START_R; break;
  }

  Pipe.saveShape(x + y * sizeX, shape);
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
