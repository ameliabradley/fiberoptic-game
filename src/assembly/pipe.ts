import * as Shape from "./shape";
import { logi } from "./imports";

export const BURST_TIME: i32 = 1000 * 5;

type SHAPE = u8;
type DOUBLESHAPE = u8;
type FLOW_START_TIME = i32;

const SHAPE_OFFSET: usize = 0;
const FLOW1_TYPE_OFFSET: usize = SHAPE_OFFSET + sizeof<SHAPE>();
const FLOW2_TYPE_OFFSET: usize = FLOW1_TYPE_OFFSET + sizeof<DOUBLESHAPE>();
const FLOW1_START_TIME_OFFSET: usize = FLOW2_TYPE_OFFSET + sizeof<DOUBLESHAPE>();
const FLOW2_START_TIME_OFFSET: usize = FLOW1_START_TIME_OFFSET + sizeof<FLOW_START_TIME>();
export const SIZE: usize = FLOW2_START_TIME_OFFSET + sizeof<FLOW_START_TIME>();

let offsetPipeArray = HEAP_BASE;

const getStartOffset = (index: usize): usize => offsetPipeArray + index * SIZE;

export function getShape(index: usize): u8 {
  return load<u8>(getStartOffset(index) + SHAPE_OFFSET);
}
export function saveShape(index: usize, shape: u8): void {
  store<u8>(getStartOffset(index) + SHAPE_OFFSET, shape);
}

export function getIndex(x: i32, y: i32, gridSizeX: i32): i32 {
  return y * gridSizeX + x;
}

export function getFlowFrom(index: usize, flowIndex: i32): u8 {
  return load<u8>(getStartOffset(index) + FLOW1_TYPE_OFFSET + flowIndex * sizeof<DOUBLESHAPE>());
}

export function startFlowFrom(index: usize, direction: u8, time: i32): void {
  let flowIndex = getFlowFrom(index, 0) === 0 ? 0 : 1;
  let offset = getStartOffset(index) + FLOW1_TYPE_OFFSET + flowIndex * sizeof<DOUBLESHAPE>();
  store<u8>(offset, direction);

  let flowStartOffset = getFlowStartOffset(index, direction);
  store<i32>(flowStartOffset, time);
}

function getFlowStartOffset(index: usize, direction: u8): usize {
  let startIndex = getStartOffset(index);
  let flow1Type = load<u8>(startIndex + FLOW1_TYPE_OFFSET);
  if (flow1Type & direction) return startIndex + FLOW1_START_TIME_OFFSET;
  let flow2Type = load<u8>(startIndex + FLOW2_TYPE_OFFSET);
  if (flow2Type & direction) return startIndex + FLOW2_START_TIME_OFFSET;
  return 0;
}

export function getFlowStart(index: i32, direction: u8): i32 {
  let offset = getFlowStartOffset(index, direction);
  return load<i32>(offset);
}

export function getOutlet(shape: u8, flowFrom: u8): u8 {
  if (shape & Shape.PIPE_START) {
    return shape & 0b1111;
  }

  if (shape === Shape.PIPE_OUTLET_CROSS) {
    if (flowFrom === Shape.PIPE_OUTLET_TOP) return Shape.PIPE_OUTLET_BOTTOM;
    if (flowFrom === Shape.PIPE_OUTLET_BOTTOM) return Shape.PIPE_OUTLET_TOP;
    if (flowFrom === Shape.PIPE_OUTLET_LEFT) return Shape.PIPE_OUTLET_RIGHT;
    return Shape.PIPE_OUTLET_LEFT;
  } else {
    return flowFrom ^ (shape & 0b1111);
  }
}

function checkBurstSide(flowTimeOffset: usize, flowTypeOffset: usize, index: usize, time: i32): u8 {
  let offset = getStartOffset(index) + flowTimeOffset;
  let startTime = load<i32>(offset);
  if (startTime > 0) {
    if (startTime + BURST_TIME < time) {
      store<i32>(offset, 0);
      let flowFrom = <u8>load<u8>(getStartOffset(index) + flowTypeOffset);
      let shape = getShape(index);
      return getOutlet(shape, flowFrom);
    }
  }

  return 0;
}

export function checkBurst(index: usize, time: i32): u8 {
  return (
    checkBurstSide(FLOW1_START_TIME_OFFSET, FLOW1_TYPE_OFFSET, index, time) |
    checkBurstSide(FLOW2_START_TIME_OFFSET, FLOW2_TYPE_OFFSET, index, time)
  );
}

export function validPlacementLocation(index: usize): boolean {
  let shape = getShape(index);
  if (shape & Shape.PIPE_BLOCKED) return false;
  if (shape & Shape.PIPE_START) return false;
  if (shape & Shape.PIPE_END) return false;

  let flow1 = getFlowFrom(index, 0);
  if (flow1 > 0) return false;

  let flow2 = getFlowFrom(index, 1);
  if (flow2 > 0) return false;

  return true;
}
