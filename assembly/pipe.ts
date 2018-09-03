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

/*
    pipe.modifierFlags = load<u8>(offset + Pipe.MODIFIER_FLAGS_OFFSET);
    pipe.flowPositions = load<u8>(offset + Pipe.FLOW_POSITIONS_OFFSET);
    pipe.flow1 = load<u8>(offset + Pipe.FLOW_1_OFFSET);
    pipe.flow2 = load<u8>(offset + Pipe.FLOW_2_OFFSET);
  }

  static getIndex(x: i32, y: i32): i32 {
    return y * World.gridSizeX + x;
  }

  save(index: i32): void {
    let offset = offsetPipeArray + index * Pipe.SIZE;
    // safeSetMem<u8>(offset + Pipe.SHAPE_OFFSET, this.shape);
    // store<u8>(offset + Pipe.SHAPE_OFFSET, load<u8>(offset + Pipe.SHAPE_OFFSET)); // this.shape);

    store<u8>(offset + Pipe.SHAPE_OFFSET, this.shape);
    //store<u8>(offset + Pipe.MODIFIER_FLAGS_OFFSET, this.modifierFlags);
    //store<u8>(offset + Pipe.FLOW_POSITIONS_OFFSET, this.flowPositions);
    //store<u8>(offset + Pipe.FLOW_1_OFFSET, this.flow1);
    //store<u8>(offset + Pipe.FLOW_2_OFFSET, this.flow2);
  }

  isShape(shape: Shape): bool {
    return (shape as u8) === this.shape;
  }

  setShape(shape: Shape): void {
    this.shape = shape as u8;
  }
}
*/
