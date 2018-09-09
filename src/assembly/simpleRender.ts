import { World } from "./game";
import * as Shape from "./shape";
import * as Pipe from "./pipe";
import * as Queue from "./queue";
import { getTime, logi, logf } from "./imports";

const ORIENTATION_NORMAL: i8 = 0b000;
const ORIENTATION_REVERSE_X: i8 = 0b001;
const ORIENTATION_REVERSE_Y: i8 = 0b010;
const ORIENTATION_ROTATE: i8 = 0b100;

const PIPE_SIZE = 20;
const PIPE_RADIUS = 4;
const PIPE_ENDPOINT = 14;

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

const OFFSET_GRID_X = PIPE_SIZE;

function getPixelOffset(x: i32, y: i32, width: i32): i32 {
  return (x + y * width) * PIXEL_SIZE;
}

const COLOR_START = 0xff57c35e; // 5ec357; // 0xff00ff00;
const COLOR_END = 0xff5757c3; //c35757; // 0xff0000ff;

const PIPE_COLOR = 0xff0f84bf; //bf840f; // 0xff808080;
const PIPE_INSIDE_COLOR = 0xff3d4e57;
const BACKGROUND_COLOR = 0xff4b4b4d; // 4d4b4b; // 0xff000000;

const PIPE_CONTENTS_COLOR = 0xff00f7ff; // fff700

const PIPE_BLOCKED_BORDER = 0xffa3b0b0;
const PIPE_BLOCKED_BACKGROUND = 0xff787878;

function renderPipe(offset: i32, width: i32, pipeShape: i32): void {
  let onlyShape: i8 = (pipeShape as u8) & 0b1111;

  if (pipeShape & Shape.PIPE_BLOCKED) {
    drawRectOffset(width, offset, PIPE_SIZE, PIPE_SIZE, PIPE_BLOCKED_BORDER);

    drawRectOffset(
      width,
      offset + getPixelOffset(1, 1, width),
      PIPE_SIZE - 2,
      PIPE_SIZE - 2,
      PIPE_BLOCKED_BACKGROUND
    );
  }

  if (onlyShape & Shape.PIPE_OUTLET_TOP) {
    drawRectOffset(
      width,
      offset + getPixelOffset(6, 0, width),
      PIPE_RADIUS * 2,
      PIPE_ENDPOINT,
      PIPE_COLOR
    );
  }

  if (onlyShape & Shape.PIPE_OUTLET_BOTTOM) {
    drawRectOffset(
      width,
      offset + getPixelOffset(6, 6, width),
      PIPE_RADIUS * 2,
      PIPE_ENDPOINT,
      PIPE_COLOR
    );
  }

  if (onlyShape & Shape.PIPE_OUTLET_LEFT) {
    drawRectOffset(
      width,
      offset + getPixelOffset(0, 6, width),
      PIPE_ENDPOINT,
      PIPE_RADIUS * 2,
      PIPE_COLOR
    );
  }

  if (onlyShape & Shape.PIPE_OUTLET_RIGHT) {
    drawRectOffset(
      width,
      offset + getPixelOffset(6, 6, width),
      PIPE_ENDPOINT,
      PIPE_RADIUS * 2,
      PIPE_COLOR
    );
  }

  //
  if (onlyShape & Shape.PIPE_OUTLET_TOP) {
    drawRectOffset(
      width,
      offset + getPixelOffset(7, 0, width),
      6,
      PIPE_ENDPOINT - 1,
      PIPE_INSIDE_COLOR
    );
  }

  if (onlyShape & Shape.PIPE_OUTLET_BOTTOM) {
    drawRectOffset(
      width,
      offset + getPixelOffset(7, 7, width),
      6,
      PIPE_ENDPOINT - 1,
      PIPE_INSIDE_COLOR
    );
  }

  if (onlyShape & Shape.PIPE_OUTLET_LEFT) {
    drawRectOffset(
      width,
      offset + getPixelOffset(0, 7, width),
      PIPE_ENDPOINT - 1,
      6,
      PIPE_INSIDE_COLOR
    );
  }

  if (onlyShape & Shape.PIPE_OUTLET_RIGHT) {
    drawRectOffset(
      width,
      offset + getPixelOffset(7, 7, width),
      PIPE_ENDPOINT - 1,
      6,
      PIPE_INSIDE_COLOR
    );
  }

  if (pipeShape & (Shape.PIPE_START | Shape.PIPE_END)) {
    let color = pipeShape & Shape.PIPE_START ? COLOR_START : COLOR_END;
    drawRectOffset(width, offset + getPixelOffset(8, 8, width), 4, 4, color);
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
  let offset = World.OFFSET_CANVAS + getPixelOffset(offsetX, offsetY, width);
  drawRectOffset(width, offset, sizeX, sizeY, color);
}

function drawRectOffset(width: i32, offset: i32, sizeX: i32, sizeY: i32, color: i32): void {
  let incY = sizeY > 0 ? 1 : -1;
  let incX = sizeX > 0 ? 1 : -1;
  for (let y = 0; y !== sizeY; y += incY) {
    for (let x = 0; x !== sizeX; x += incX) {
      renderPixel(offset + getPixelOffset(x, y, width), color);
    }
  }
}

export function render(width: i32, height: i32, time: i32): void {
  drawRect(width, 0, 0, width, height, BACKGROUND_COLOR);

  let sizeX = World.gridSizeX;
  let sizeY = World.gridSizeY;
  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      let index = Pipe.getIndex(x, y, World.gridSizeX);
      let pipeShape = Pipe.getShape(index);

      renderPipe(
        World.OFFSET_CANVAS + getPixelOffset(x * PIPE_SIZE + OFFSET_GRID_X, y * PIPE_SIZE, width),
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
              let flowHeight = 6;
              let flowWidth = 6;
              switch (flowFrom) {
                case Shape.PIPE_OUTLET_TOP:
                  startX = 7;
                  flowHeight = pixelWidth > 13 ? 13 : pixelWidth;
                  break;
                case Shape.PIPE_OUTLET_BOTTOM:
                  startX = 7;
                  startY = PIPE_SIZE - 1;
                  flowHeight = pixelWidth > 13 ? -13 : -pixelWidth;
                  break;
                case Shape.PIPE_OUTLET_LEFT:
                  startY = 7;
                  flowWidth = pixelWidth > 13 ? 13 : pixelWidth;
                  break;
                case Shape.PIPE_OUTLET_RIGHT:
                  startY = 7;
                  startX = PIPE_SIZE - 1;
                  flowWidth = pixelWidth > 13 ? -13 : -pixelWidth;
                  break;
              }
              drawRect(
                width,
                x * PIPE_SIZE + startX + OFFSET_GRID_X,
                y * PIPE_SIZE + startY,
                flowWidth,
                flowHeight,
                PIPE_CONTENTS_COLOR
              );
            }

            if (pixelWidth > 6) {
              let remaining = pixelWidth - 7;
              let startX = 7;
              let startY = 7;
              let flowHeight = 6;
              let flowWidth = 6;
              let outlet: u8 = Pipe.getOutlet(pipeShape, flowFrom);
              switch (outlet) {
                case Shape.PIPE_OUTLET_TOP:
                  startY = 12;
                  flowHeight = -remaining;
                  break;
                case Shape.PIPE_OUTLET_BOTTOM:
                  flowHeight = remaining;
                  break;
                case Shape.PIPE_OUTLET_LEFT:
                  startX = 12;
                  flowWidth = -remaining;
                  break;
                case Shape.PIPE_OUTLET_RIGHT:
                  flowWidth = remaining;
                  break;
              }

              if (outlet) {
                drawRect(
                  width,
                  x * PIPE_SIZE + startX + OFFSET_GRID_X,
                  y * PIPE_SIZE + startY,
                  flowWidth,
                  flowHeight,
                  PIPE_CONTENTS_COLOR
                );
              }
            }
          }
        }
      }
    }
  }

  drawQueue(width);
  drawCursor(width, height, time);
  drawProgressBar(width, height, time);
}

function drawCursor(width: i32, height: i32, time: i32): void {
  let index = Pipe.getIndex(World.cursorPositionX, World.cursorPositionY, World.gridSizeX);
  let validPlacement = Pipe.validPlacementLocation(index);
  let color = validPlacement ? 0xffff00ff : 0xff0000ff;
  let startX = World.cursorPositionX * PIPE_SIZE;
  let startY = World.cursorPositionY * PIPE_SIZE;
  let end = PIPE_SIZE - 1;
  drawRect(width, startX + OFFSET_GRID_X, startY, 1, 1, color);
  drawRect(width, startX + OFFSET_GRID_X + end, startY, 1, 1, color);
  drawRect(width, startX + OFFSET_GRID_X, startY + end, 1, 1, color);
  drawRect(width, startX + OFFSET_GRID_X + end, startY + end, 1, 1, color);

  if (validPlacement) {
    let shape = Queue.getShape(0);
    renderPipe(
      World.OFFSET_CANVAS + getPixelOffset(startX + OFFSET_GRID_X, startY, width),
      width,
      shape
    );
  }
}

function drawQueue(width: i32): void {
  for (let i: u8 = 0; i < Queue.MAX; i++) {
    let shape = Queue.getShape(i);
    renderPipe(World.OFFSET_CANVAS + getPixelOffset(0, i * PIPE_SIZE, width), width, shape);
  }
}

const PROGRESSBAR_COLOR_GOOD = 0xff00ff00;
const PROGRESSBAR_COLOR_GAME_OVER = 0xff0000ff;
const PROGRESSBAR_HEIGHT = 10;
function drawProgressBar(width: i32, height: i32, time: i32): void {
  let fullProgressWidth: i32 = width;
  let y = height - PROGRESSBAR_HEIGHT;
  let x = 0;

  if (World.countdownEnd > time) {
    let percentage: f32 =
      <f32>1 - (<f32>World.countdownEnd - <f32>time) / <f32>World.countdownTotal;
    let pixelWidth: i32 = <i32>(percentage * <f32>fullProgressWidth);
    drawRect(width, x, y, fullProgressWidth, PROGRESSBAR_HEIGHT, 0xff000000);
    drawRect(width, x, y, pixelWidth, PROGRESSBAR_HEIGHT, PROGRESSBAR_COLOR_GOOD);
  } else {
    drawRect(
      width,
      x,
      y,
      fullProgressWidth,
      PROGRESSBAR_HEIGHT,
      World.gameOver ? PROGRESSBAR_COLOR_GAME_OVER : PROGRESSBAR_COLOR_GOOD
    );
  }
}
