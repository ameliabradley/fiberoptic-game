const SHAPE_OFFSET: usize = 0;
const MODIFIER_FLAGS_OFFSET: usize = SHAPE_OFFSET + sizeof<u8>();
const FLOW_POSITIONS_OFFSET: usize = MODIFIER_FLAGS_OFFSET + sizeof<u8>();
const FLOW_1_OFFSET: usize = FLOW_POSITIONS_OFFSET + sizeof<u8>();
const FLOW_2_OFFSET: usize = FLOW_1_OFFSET + sizeof<u8>();
const SIZE: usize = FLOW_2_OFFSET + sizeof<u8>();

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
