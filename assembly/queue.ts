import { World } from "./game";
import * as Pipe from "./pipe";
import * as Shape from "./shape";
import { randomInt } from "./util";

export const MAX: u8 = 5;
let index: u8 = 0;
// let length: u8 = 0;

const SHAPE_OFFSET = 0;
const SIZE = MAX * sizeof<u8>();

const getStartOffset = (index: usize): usize => World.OFFSET_QUEUE_ARRAY + index * SIZE;

declare namespace console {
  function logi(val: i32, boolean?: bool): void;
}

export function fill(): void {
  for (let i: u8 = 0; i < MAX; i++) {
    let option: u8 = randomInt(0, 6) as u8;
    let shape: u8 = 0;

    // prettier-ignore
    switch (option) {
      case 0: shape = Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_TOP; break;
      case 1: shape = Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_OUTLET_TOP; break;
      case 2: shape = Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_BOTTOM; break;
      case 3: shape = Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_OUTLET_BOTTOM; break;
      case 4: shape = Shape.PIPE_OUTLET_CROSS; break;
      case 5: shape = Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_OUTLET_LEFT; break;
      case 6: shape = Shape.PIPE_OUTLET_TOP | Shape.PIPE_OUTLET_BOTTOM; break;
    }

    store<u8>(getStartOffset(i) + SHAPE_OFFSET, shape);
  }
}

export function getShape(index: i32): u8 {
  return load<u8>(getStartOffset(index) + SHAPE_OFFSET);
}

export function pop(x: u8, y: u8): void {
  // store<u8>(World.OFFSET_QUEUE_ARRAY, shape);
}
