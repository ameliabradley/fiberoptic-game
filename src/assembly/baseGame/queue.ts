import { World } from "./game";
import * as Shape from "./shape";
import { randomInt } from "../util";

export const MAX: u8 = 5;
const SHAPE_OFFSET = 0;
export const SIZE: usize = MAX * sizeof<u8>();

const getStartOffset = (index: usize): usize => World.OFFSET_QUEUE_ARRAY + index * SIZE;

let id: u8 = 0;

export function fill(): void {
  for (let i: u8 = 0; i < MAX; i++) {
    fillWithRandomShape(i);
  }
}

function fillWithRandomShape(index: i32): void {
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

  let randomAttribute: u8 = randomInt(0, 12) as u8;
  switch (randomAttribute) {
    case 0:
      shape = shape | Shape.PIPE_BLOCKED;
      break;
  }

  storeShape(index, shape);
}

export function storeShape(index: i32, shape: u8): void {
  store<u8>(getStartOffset(index) + SHAPE_OFFSET, shape);
  id++;
}

export function getShape(index: i32): u8 {
  return load<u8>(getStartOffset(index) + SHAPE_OFFSET);
}

export function pop(): u8 {
  let shape = getShape(0);
  for (let i = 1; i < (MAX as i32); i++) {
    let oldShape = getShape(i);
    storeShape(i - 1, oldShape);
  }
  fillWithRandomShape(MAX - 1);
  return shape;
}

export function getQueueId(): i32 {
  return id;
}
