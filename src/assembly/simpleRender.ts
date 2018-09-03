import { World } from "./game";
import * as Shape from "./shape";
import * as Pipe from "./pipe";
import * as Queue from "./queue";

const offsetCanvas = 500;

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
const pipeStraight: u8 = 0b00001010;

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

function getPos(color: i32, pos: i32): u8 {
  let offset = 24 - pos * 8;
  return ((color & (0xff << offset)) >> offset) as u8;
}

function renderPixel(offset: i32, color: i32): void {
  if ((color & 0xff000000) === 0xff000000) {
    store<i32>(offset, color);
  } else {
    // FIXME: ... Not working
    let bg: i32 = load<i32>(offset);

    let fg3 = getPos(color, 0);

    let alpha: i32 = fg3 + 1;
    let inv_alpha: i32 = 256 - fg3;

    let b: u8 = ((alpha * getPos(color, 1) + inv_alpha * getPos(bg, 1)) >> 8) as u8;
    let g: u8 = ((alpha * getPos(color, 2) + inv_alpha * getPos(bg, 2)) >> 8) as u8;
    let r: u8 = ((alpha * getPos(color, 3) + inv_alpha * getPos(bg, 3)) >> 8) as u8;

    let result: i32 = 0xff000000 + (b << 16) + (g << 8) + r;

    store<i32>(offset, result);
  }
}

const OFFSET_GRID_X = 6;

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

      case Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_TOP:
        pipeLine = pipeElbow[y];
        break;

      case Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_OUTLET_TOP:
        orientation |= ORIENTATION_REVERSE_X;
        pipeLine = pipeElbow[y];
        break;

      case Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_BOTTOM:
        pipeLine = pipeElbow[4 - y];
        break;

      case Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_OUTLET_BOTTOM:
        orientation |= ORIENTATION_REVERSE_X;
        pipeLine = pipeElbow[4 - y];
        break;

      case Shape.PIPE_OUTLET_TOP | Shape.PIPE_OUTLET_BOTTOM:
        pipeLine = pipeStraight;
        break;

      case Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_RIGHT:
        orientation |= ORIENTATION_ROTATE;
        pipeLine = pipeStraight;
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
      renderPixel(offset + pixel, pipeLine & FLAG ? color : 0xff000000);
    }
  }

  if (pipeShape & (Shape.PIPE_START | Shape.PIPE_END)) {
    let pixel = getPixelOffset(2, 2, width);
    let color = pipeShape & Shape.PIPE_START ? 0xff00ff00 : 0xff0000ff;
    renderPixel(offset + pixel, color);
  }
}

function drawRect(
  width: i32,
  offsetX: i32,
  offsetY: i32,
  sizeX: i32,
  sizeY: i32,
  color: i32
): void {
  let offset = offsetCanvas + getPixelOffset(offsetX, offsetY, width);
  for (let y = 0; y < sizeY; y++) {
    for (let x = 0; x < sizeX; x++) {
      renderPixel(offset + getPixelOffset(x + OFFSET_GRID_X, y, width), color);
    }
  }
}

export function render(width: i32, height: i32): void {
  let sizeX = World.gridSizeX;
  let sizeY = World.gridSizeY;
  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      let index = Pipe.getIndex(x, y, World.gridSizeX);
      let pipeShape = Pipe.getShape(index);
      renderPipe(
        offsetCanvas + getPixelOffset(x * 5 + OFFSET_GRID_X, y * 5, width),
        width,
        pipeShape
      );
    }
  }

  for (let i: u8 = 0; i < Queue.MAX; i++) {
    let shape = Queue.getShape(i);
    renderPipe(offsetCanvas + getPixelOffset(0, i * 5, width), width, shape);
  }

  drawRect(width, World.cursorPositionX * 5, World.cursorPositionY * 5, 1, 1, 0xffff00ff);
  drawRect(width, World.cursorPositionX * 5 + 4, World.cursorPositionY * 5, 1, 1, 0xffff00ff);
  drawRect(width, World.cursorPositionX * 5, World.cursorPositionY * 5 + 4, 1, 1, 0xffff00ff);
  drawRect(width, World.cursorPositionX * 5 + 4, World.cursorPositionY * 5 + 4, 1, 1, 0xffff00ff);
}
