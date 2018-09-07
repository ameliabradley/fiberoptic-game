import { World } from "./game";
import * as Shape from "./shape";
import * as Pipe from "./pipe";
import * as Queue from "./queue";
import { getTime, logi, logf } from "./imports";

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
  // if ((color & 0xff000000) === 0xff000000) {
  store<i32>(offset, color);
  /*
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
  */
}

const OFFSET_GRID_X = 6;

function getPixelOffset(x: i32, y: i32, width: i32): i32 {
  return (x + y * width) * PIXEL_SIZE;
}

const COLOR_START = 0xff00ff00;
const COLOR_END = 0xff0000ff;

const PIPE_COLOR = 0xff808080;
const BACKGROUND_COLOR = 0xff000000;

function renderPipe(offset: i32, width: i32, pipeShape: i32): void {
  for (let y = 0; y < PIPE_SIZE; y++) {
    let pipeLine: i8;
    let orientation: i8 = ORIENTATION_NORMAL;
    let color = 0xff808080;
    let onlyShape: i8 = (pipeShape as u8) & 0b1111;

    // What's the most simple way to render sludge going through the pipe?
    // Also, is there a more simple way to render pipe?
    // TBLR...

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
      renderPixel(offset + pixel, pipeLine & FLAG ? PIPE_COLOR : BACKGROUND_COLOR);
    }
  }

  if (pipeShape & (Shape.PIPE_START | Shape.PIPE_END)) {
    let pixel = getPixelOffset(2, 2, width);
    let color = pipeShape & Shape.PIPE_START ? COLOR_START : COLOR_END;
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
  let incY = sizeY > 0 ? 1 : -1;
  let incX = sizeX > 0 ? 1 : -1;
  let offset = World.OFFSET_CANVAS + getPixelOffset(offsetX, offsetY, width);
  for (let y = 0; y !== sizeY; y += incY) {
    for (let x = 0; x !== sizeX; x += incX) {
      renderPixel(offset + getPixelOffset(x + OFFSET_GRID_X, y, width), color);
    }
  }
}

export function render(width: i32, height: i32, time: i32): void {
  let sizeX = World.gridSizeX;
  let sizeY = World.gridSizeY;
  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      let index = Pipe.getIndex(x, y, World.gridSizeX);
      let pipeShape = Pipe.getShape(index);
      renderPipe(
        World.OFFSET_CANVAS + getPixelOffset(x * 5 + OFFSET_GRID_X, y * 5, width),
        width,
        pipeShape
      );

      for (let flowIndex = 0; flowIndex < 2; flowIndex++) {
        let flowFrom = Pipe.getFlowFrom(index, flowIndex);
        if (flowFrom > 0) {
          let flowStart = Pipe.getFlowStart(index, flowFrom);
          if (flowStart < time) {
            let percentage: f32 = (<f32>time - <f32>flowStart) / <f32>Pipe.BURST_TIME;
            if (percentage > 1) percentage = 1;
            let pixelWidth: i32 = <i32>(percentage * <f32>PIPE_SIZE);

            if ((pipeShape & Shape.PIPE_START) === 0) {
              let startX = 0;
              let startY = 0;
              let flowHeight = 1;
              let flowWidth = 1;
              switch (flowFrom) {
                case Shape.PIPE_OUTLET_TOP:
                  startX = 2;
                  flowHeight = pixelWidth > 2 ? 2 : pixelWidth;
                  break;
                case Shape.PIPE_OUTLET_BOTTOM:
                  startX = 2;
                  startY = 4;
                  flowHeight = pixelWidth > 2 ? -2 : -pixelWidth;
                  break;
                case Shape.PIPE_OUTLET_LEFT:
                  startY = 2;
                  flowWidth = pixelWidth > 2 ? 2 : pixelWidth;
                  break;
                case Shape.PIPE_OUTLET_RIGHT:
                  startY = 2;
                  startX = 4;
                  flowWidth = pixelWidth > 2 ? -2 : -pixelWidth;
                  break;
              }
              drawRect(
                width,
                x * PIPE_SIZE + startX,
                y * PIPE_SIZE + startY,
                flowWidth,
                flowHeight,
                0xff00ff00
              );
            }

            if (pixelWidth > 2) {
              let remaining = pixelWidth - 2;
              let flowHeight = 1;
              let flowWidth = 1;
              let outlet: u8 = Pipe.getOutlet(pipeShape, flowFrom);
              switch (outlet) {
                case Shape.PIPE_OUTLET_TOP:
                  flowHeight = -remaining;
                  break;
                case Shape.PIPE_OUTLET_BOTTOM:
                  flowHeight = remaining;
                  break;
                case Shape.PIPE_OUTLET_LEFT:
                  flowWidth = -remaining;
                  break;
                case Shape.PIPE_OUTLET_RIGHT:
                  flowWidth = remaining;
                  break;
              }
              drawRect(
                width,
                x * PIPE_SIZE + 2,
                y * PIPE_SIZE + 2,
                flowWidth,
                flowHeight,
                0xff00ff00
              );
            }
          }
        }
      }
    }
  }

  for (let i: u8 = 0; i < Queue.MAX; i++) {
    let shape = Queue.getShape(i);
    renderPipe(World.OFFSET_CANVAS + getPixelOffset(0, i * 5, width), width, shape);
  }

  let startX = World.cursorPositionX * PIPE_SIZE;
  let startY = World.cursorPositionY * PIPE_SIZE;
  let end = PIPE_SIZE - 1;
  drawRect(width, startX, startY, 1, 1, 0xffff00ff);
  drawRect(width, startX + end, startY, 1, 1, 0xffff00ff);
  drawRect(width, startX, startY + end, 1, 1, 0xffff00ff);
  drawRect(width, startX + end, startY + end, 1, 1, 0xffff00ff);

  let fullProgressWidth: i32 = World.gridSizeX * PIPE_SIZE;
  if (World.countdownEnd > time) {
    let percentage: f32 =
      <f32>1 - (<f32>World.countdownEnd - <f32>time) / <f32>World.countdownTotal;
    let pixelWidth: i32 = <i32>(percentage * <f32>fullProgressWidth);
    drawRect(width, 0, World.gridSizeY * PIPE_SIZE, fullProgressWidth, 1, 0xff000000);
    drawRect(width, 0, World.gridSizeY * PIPE_SIZE, pixelWidth, 1, 0xff00ff00);
  } else {
    if (World.gameOver) {
      drawRect(width, 0, World.gridSizeY * PIPE_SIZE, fullProgressWidth, 1, 0xff0000ff);
    } else {
      drawRect(width, 0, World.gridSizeY * PIPE_SIZE, fullProgressWidth, 1, 0xff00ff00);
    }
  }
}
