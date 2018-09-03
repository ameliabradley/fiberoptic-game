import { World } from "./game";
import * as Shape from "./shape";
import * as Pipe from "./pipe";

const offsetCanvas = 300;

// prettier-ignore
const pipeCross: u8[] = [
  0b00001010,
  0b00011011,
  0b00000000,
  0b00011011,
  0b00001010,
];

// prettier-ignore
const pipeElbow: u8[] = [
  0b00001010,
  0b00011010,
  0b00000010,
  0b00011110,
  0b00000000,
];

// prettier-ignore
const pipeStartTop: u8[] = [
  0b00001010,
  0b00001010,
  0b00001010,
  0b00001110,
  0b00000000,
];

const ORIENTATION_NORMAL: i8 = 0b000;
const ORIENTATION_REVERSE_X: i8 = 0b001;
const ORIENTATION_REVERSE_Y: i8 = 0b010;
const ORIENTATION_ROTATE: i8 = 0b100;

const PIPE_SIZE = 5;

const PIXEL_SIZE = sizeof<i32>();

function renderPixel(offset: i32, off: i32, color: i32): void {
  store<i32>(offset, off ? color : 0);
}

function getPixelOffset(x: i32, y: i32, width: i32): i32 {
  return (x + y * width) * PIXEL_SIZE;
}

const COLOR_START = 0xff00ff00;
const COLOR_END = 0xff0000ff;

function renderPipe(offset: i32, width: i32, pipeShape: i32): void {
  for (let y = 0; y < PIPE_SIZE; y++) {
    let pipeLine: i8;
    let orientation: i8 = ORIENTATION_NORMAL;
    let color = 0xff808080;
    let onlyShape: i8 = (pipeShape as u8) & 0b1111;

    switch (onlyShape) {
      case Shape.PIPE_OUTLET_CROSS: {
        pipeLine = pipeCross[y];
        break;
      }

      case Shape.PIPE_OUTLET_TOP:
        pipeLine = pipeStartTop[y];
        break;

      case Shape.PIPE_OUTLET_BOTTOM:
        orientation |= ORIENTATION_REVERSE_Y;
        pipeLine = pipeStartTop[4 - y];
        break;

      case Shape.PIPE_OUTLET_LEFT:
        orientation |= ORIENTATION_ROTATE;
        pipeLine = pipeStartTop[y];
        break;

      case Shape.PIPE_OUTLET_RIGHT:
        orientation |= ORIENTATION_ROTATE;
        pipeLine = pipeStartTop[4 - y];
        break;

      case Shape.PIPE_OUTLET_NONE:
      default: {
        pipeLine = 0;
      }
    }

    for (let x = 0; x < PIPE_SIZE; x++) {
      let FLAG = orientation & ORIENTATION_REVERSE_X ? 0b1 << (x as u8) : 0b10000 >> (x as u8);
      let pixel =
        orientation & ORIENTATION_ROTATE
          ? getPixelOffset(y, x, width)
          : getPixelOffset(x, y, width);
      renderPixel(offset + pixel, pipeLine & FLAG, color);
    }
  }

  if (pipeShape & (Shape.PIPE_START | Shape.PIPE_END)) {
    let pixel = getPixelOffset(2, 2, width);
    let color = pipeShape & Shape.PIPE_START ? 0xff00ff00 : 0xff0000ff;
    renderPixel(offset + pixel, 1, color);
  }
}

declare namespace console {
  function logi(val: i32, boolean?: bool): void;
}

export function render(width: i32, height: i32): void {
  let sizeX = World.gridSizeX;
  let sizeY = World.gridSizeY;
  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      let index = Pipe.getIndex(x, y, World.gridSizeX);
      let pipeShape = Pipe.getShape(index);
      renderPipe(offsetCanvas + getPixelOffset(x * 5, y * 5, width), width, pipeShape);
    }
  }
}
