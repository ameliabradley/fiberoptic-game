import { World } from "../baseGame/game";
import * as Shape from "../baseGame/shape";
import * as Pipe from "../baseGame/pipe";
import * as Queue from "../baseGame/queue";
import { getTime, logi, logf } from "../imports";
import { getLetterFromChar } from "./tinyFont";
import { renderPixel, getPixelOffset } from "./renderUtil";
import { easeBounceOut } from "./easing";

const PIPE_SIZE = 20;
const PIPE_RADIUS = 4;
const PIPE_ENDPOINT = 14;

const BUFFER_WIDTH = sizeof<i32>() * PIPE_SIZE * 10;
const BUFFER_SIZE = BUFFER_WIDTH * PIPE_SIZE * 8;
const FLAG_CURSOR = 1;
const FLAG_INVALID = 1 << 1;

const COLOR_START = 0xff57c35e;
const COLOR_END = 0xff5757c3;

const PIPE_COLOR = 0xff0f84bf;
const PIPE_INSIDE_COLOR = 0xff3d4e57;
const BACKGROUND_COLOR = 0x00000000;

const PIPE_CONTENTS_COLOR = 0xff00f7ff;

const PIPE_BLOCKED_BORDER = 0xffa3b0b0;
const PIPE_BLOCKED_BACKGROUND = 0xff787878;

const OFFSET_GRID_X = PIPE_SIZE + 3;
const OFFSET_GRID_Y = 4;

const PROGRESSBAR_COLOR_GOOD = 0xff00ff00;
const PROGRESSBAR_COLOR_GAME_OVER = 0xff0000ff;
const PROGRESSBAR_HEIGHT = 10;
const FONT_HEIGHT = 5;

const WINDOW_BORDER_COLOR = 0xff26323a;

const FRIENDLY_MESSAGE_TIMEOUT = 1000 * 5;

function renderPipe(offset: i32, width: i32, pipeShape: i32, flags: i32 = 0): void {
  let onlyShape: i8 = (pipeShape as u8) & 0b1111;

  let insideColor: i32 = PIPE_INSIDE_COLOR;
  let pipeColor: i32 = PIPE_COLOR;
  let blockedBg: i32 = PIPE_BLOCKED_BACKGROUND;
  let blockedBorder: i32 = PIPE_BLOCKED_BORDER;

  if (flags & FLAG_CURSOR) {
    insideColor = flags & FLAG_INVALID ? 0xff3d3d57 : 0xff574f3d;
    pipeColor = flags & FLAG_INVALID ? 0xff2d2d80 : 0xff805f2d;
    blockedBg = insideColor;
    blockedBorder = pipeColor;
  }

  if (pipeShape & Shape.PIPE_BLOCKED) {
    drawRectOffset(width, offset, PIPE_SIZE, PIPE_SIZE, blockedBorder);

    drawRectOffset(
      width,
      offset + getPixelOffset(1, 1, width),
      PIPE_SIZE - 2,
      PIPE_SIZE - 2,
      blockedBg
    );
  }

  if (onlyShape === Shape.PIPE_OUTLET_CROSS) {
    renderPipe(offset, width, 0b1100, flags);
  } else {
    if (onlyShape & Shape.PIPE_OUTLET_TOP) {
      drawRectOffset(
        width,
        offset + getPixelOffset(6, 0, width),
        PIPE_RADIUS * 2,
        PIPE_ENDPOINT,
        pipeColor
      );
    }

    if (onlyShape & Shape.PIPE_OUTLET_BOTTOM) {
      drawRectOffset(
        width,
        offset + getPixelOffset(6, 6, width),
        PIPE_RADIUS * 2,
        PIPE_ENDPOINT,
        pipeColor
      );
    }
  }

  if (onlyShape & Shape.PIPE_OUTLET_LEFT) {
    drawRectOffset(
      width,
      offset + getPixelOffset(0, 6, width),
      PIPE_ENDPOINT,
      PIPE_RADIUS * 2,
      pipeColor
    );
  }

  if (onlyShape & Shape.PIPE_OUTLET_RIGHT) {
    drawRectOffset(
      width,
      offset + getPixelOffset(6, 6, width),
      PIPE_ENDPOINT,
      PIPE_RADIUS * 2,
      pipeColor
    );
  }

  //
  if (onlyShape !== Shape.PIPE_OUTLET_CROSS) {
    if (onlyShape & Shape.PIPE_OUTLET_TOP) {
      drawRectOffset(
        width,
        offset + getPixelOffset(7, 0, width),
        6,
        PIPE_ENDPOINT - 1,
        insideColor
      );
    }

    if (onlyShape & Shape.PIPE_OUTLET_BOTTOM) {
      drawRectOffset(
        width,
        offset + getPixelOffset(7, 7, width),
        6,
        PIPE_ENDPOINT - 1,
        insideColor
      );
    }
  }

  if (onlyShape & Shape.PIPE_OUTLET_LEFT) {
    drawRectOffset(width, offset + getPixelOffset(0, 7, width), PIPE_ENDPOINT - 1, 6, insideColor);
  }

  if (onlyShape & Shape.PIPE_OUTLET_RIGHT) {
    drawRectOffset(width, offset + getPixelOffset(7, 7, width), PIPE_ENDPOINT - 1, 6, insideColor);
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
  let offset = getCanvasOffset() + getPixelOffset(offsetX, offsetY, width);
  drawRectOffset(width, offset, sizeX, sizeY, color);
}

function clipRectAlpha(
  bufferX: i32,
  bufferY: i32,
  width: i32,
  height: i32,
  canvasX: i32,
  canvasY: i32,
  sizeX: i32,
  alpha: u8
): void {
  let baseBufferOffset = getBufferOffset() + getPixelOffset(bufferX, bufferY, BUFFER_WIDTH);
  let baseCanvasOffset = getCanvasOffset() + getPixelOffset(canvasX, canvasY, sizeX);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let color = load<i32>(baseBufferOffset + getPixelOffset(x, y, BUFFER_WIDTH));
      renderPixel(
        baseCanvasOffset + getPixelOffset(x, y, sizeX),
        color === 0x00000000 ? color : (color & 0x00ffffff) | (alpha << 24),
        true
      );
    }
  }
}

function clipRect(
  bufferX: i32,
  bufferY: i32,
  width: i32,
  height: i32,
  canvasX: i32,
  canvasY: i32,
  sizeX: i32
): void {
  let baseBufferOffset = getBufferOffset() + getPixelOffset(bufferX, bufferY, BUFFER_WIDTH);
  let baseCanvasOffset = getCanvasOffset() + getPixelOffset(canvasX, canvasY, sizeX);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let color = load<i32>(baseBufferOffset + getPixelOffset(x, y, BUFFER_WIDTH));
      if (color !== 0x00000000) {
        renderPixel(baseCanvasOffset + getPixelOffset(x, y, sizeX), color);
      }
    }
  }
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
  let sizeX = World.gridSizeX;
  let sizeY = World.gridSizeY;

  drawRect(width, 0, 0, width, height, BACKGROUND_COLOR);

  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      let index = Pipe.getIndex(x, y, World.gridSizeX);
      let pipeShape = Pipe.getShape(index);

      let pixelX = x * PIPE_SIZE + OFFSET_GRID_X;
      let pixelY = y * PIPE_SIZE + OFFSET_GRID_Y;

      renderPipe(getCanvasOffset() + getPixelOffset(pixelX, pixelY, width), width, pipeShape);

      let animStart = World.countdownEnd - World.countdownTotal;
      if (time < animStart + FRIENDLY_MESSAGE_TIMEOUT) {
        if (pipeShape & Shape.PIPE_START) {
          let text: Array<u8> = [83, 84, 65, 82, 84];
          bounceMessage(
            time - animStart,
            width,
            PIPE_SIZE + 2,
            pixelX - 1,
            pixelY + (PIPE_SIZE - FONT_HEIGHT) / 2,
            text
          );
        }

        if (pipeShape & Shape.PIPE_END) {
          let text: Array<u8> = [69, 78, 68];
          bounceMessage(
            time - animStart,
            width,
            PIPE_SIZE + 2,
            pixelX - 1,
            pixelY + (PIPE_SIZE - FONT_HEIGHT) / 2,
            text
          );
        }
      }

      for (let flowIndex = 0; flowIndex < 2; flowIndex++) {
        let flowFrom = Pipe.getFlowFrom(index, flowIndex);
        if (flowFrom > 0) {
          let flowStart = Pipe.getFlowStart(index, flowFrom);
          if (flowStart < time) {
            let percentage: f32 =
              (<f32>time - <f32>flowStart) / <f32>(Pipe.BURST_TIME / World.flowMultiplier);
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
                y * PIPE_SIZE + startY + OFFSET_GRID_Y,
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
                  y * PIPE_SIZE + startY + OFFSET_GRID_Y,
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

  drawQueue(width, time);
  drawCursor(width, height, time);
  drawProgressBar(width, height, time);

  if (World.gameOver) {
    drawGameOver(width, height);
  }

  if (World.isWinning) {
    drawWin(width, height);
  }
}

function drawCursor(width: i32, height: i32, time: i32): void {
  let index = Pipe.getIndex(World.cursorPositionX, World.cursorPositionY, World.gridSizeX);
  let validPlacement = Pipe.validPlacementLocation(index);
  let startX = World.cursorPositionX * PIPE_SIZE;
  let startY = World.cursorPositionY * PIPE_SIZE;

  let shape = Queue.getShape(0);
  drawRectOffset(BUFFER_WIDTH, getBufferOffset(), PIPE_SIZE, PIPE_SIZE, BACKGROUND_COLOR);
  renderPipe(
    getBufferOffset(),
    BUFFER_WIDTH,
    shape,
    FLAG_CURSOR | (validPlacement ? 0 : FLAG_INVALID)
  );
  clipRectAlpha(
    0,
    0,
    PIPE_SIZE,
    PIPE_SIZE,
    startX + OFFSET_GRID_X - 2,
    startY + OFFSET_GRID_Y - 2,
    width,
    200
  );
}

let lastQueueSignature: i32 = 0;
let lastQueueSignatureCaptureTime: i32 = 0;
function drawQueue(width: i32, time: i32): void {
  drawRect(width, 0, 3, PIPE_SIZE + 2, PIPE_SIZE * Queue.MAX + 2, WINDOW_BORDER_COLOR);
  drawRect(width, 1, 4, PIPE_SIZE, PIPE_SIZE * Queue.MAX, BACKGROUND_COLOR);

  let queueSignature: i32 = 0;
  for (let i: u8 = 0; i < Queue.MAX; i++) {
    let shape = Queue.getShape(i);
    queueSignature += shape;
  }

  if (queueSignature !== lastQueueSignature) {
    lastQueueSignature = queueSignature;
    lastQueueSignatureCaptureTime = time;
  }

  let offset: i32 = 0;
  let timeout = 1000 * 1;
  let maxTime = lastQueueSignatureCaptureTime + timeout;
  if (time < maxTime) {
    offset =
      <i32>(
        (<f32>PIPE_SIZE * easeBounceOut(<f32>(time - lastQueueSignatureCaptureTime) / <f32>timeout))
      ) - PIPE_SIZE;
  }

  for (let i: u8 = 0; i < Queue.MAX; i++) {
    let shape = Queue.getShape(i);
    queueSignature += shape;

    renderPipe(
      getCanvasOffset() + getPixelOffset(1, (Queue.MAX - i - 1) * PIPE_SIZE + 4 + offset, width),
      width,
      shape
    );
  }

  let queueLabel: Array<u8> = [81, 85, 69, 85, 69]; // QUEUE
  let startX = 2;
  let startY = PIPE_SIZE * Queue.MAX + 7;
  drawText(width, startX, startY, queueLabel, WINDOW_BORDER_COLOR);
}

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

export function drawChar(char: i32, width: i32, offsetX: i32, offsetY: i32, color: i32): void {
  let letter = getLetterFromChar(char);
  let shift: i16 = 0;

  // 3x5
  let baseOffset = getCanvasOffset() + getPixelOffset(offsetX, offsetY, width);
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      let on = letter & (1 << shift);
      if (on) {
        let offset = baseOffset + getPixelOffset(x, y, width);
        renderPixel(offset, color);
      }
      shift++;
    }
  }
}

function getBufferOffset(): i32 {
  return World.OFFSET_RENDERER;
}

export function getCanvasOffset(): i32 {
  return World.OFFSET_RENDERER + BUFFER_SIZE;
}

function drawGameOver(width: i32, height: i32): void {
  let label: Array<u8> = [71, 65, 77, 69, 32, 79, 86, 69, 82]; // "GAME OVER"
  drawCenterMessage(width, height, label);
}

function drawWin(width: i32, height: i32): void {
  let label: Array<u8> = [89, 79, 85, 32, 87, 73, 78]; // "YOU WIN"
  drawCenterMessage(width, height, label);
}

function drawCenterMessage(width: i32, height: i32, queueLabel: Array<u8>): void {
  let textHeight = 9;
  let textWidth = queueLabel.length * 4 + 4;
  let startX = (width - textWidth) / 2;
  let startY = (height - textHeight) / 2;
  drawRect(width, startX, startY, textWidth, textHeight, PIPE_INSIDE_COLOR);
  drawRect(width, startX + 1, startY + 1, textWidth - 2, textHeight - 2, BACKGROUND_COLOR);
  drawText(width, startX + 2, startY + 2, queueLabel, WINDOW_BORDER_COLOR);
}

function bounceMessage(
  time: i32,
  width: i32,
  itemWidth: i32,
  pixelX: i32,
  pixelY: i32,
  text: Array<u8>
): void {
  let animTime = 1000 * 3;
  let animSize: f32 = <f32>20;

  let leftSide: boolean = pixelX < width / 2;
  let messageX: i32;
  let percentDone = easeBounceOut(<f32>time / <f32>animTime);
  let textWidth = text.length * 4;
  let newPixelX: i32;
  if (leftSide) {
    messageX = pixelX + itemWidth;
    percentDone = 1 - percentDone;
    newPixelX = time > animTime ? messageX : messageX + <i32>(animSize * percentDone);
  } else {
    messageX = pixelX - textWidth;
    newPixelX =
      time > animTime ? messageX : messageX + <i32>(animSize * percentDone) - <i32>animSize;
  }

  drawText(width, newPixelX, pixelY, text, WINDOW_BORDER_COLOR);
}

function drawText(width: i32, startX: i32, startY: i32, text: Array<u8>, color: i32): void {
  for (let i = 0; i < text.length; i++) {
    drawChar(text[i], width, startX + i * 4, startY, color);
  }
}
