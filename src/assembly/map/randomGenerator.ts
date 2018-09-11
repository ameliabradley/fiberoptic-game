import { getRandomSetBit, getRandomSide } from "../util";
import * as Pipe from "../baseGame/pipe";
import * as Shape from "../baseGame/shape";
import { World } from "../baseGame/game";
import { clearMap } from "./mapUtil";

export function generateRandomMap(sizeX: i32, sizeY: i32): void {
  clearMap(sizeX, sizeY);

  let maxX = sizeX - 1;
  let maxY = sizeY - 1;

  let sideIndex = getRandomSide(sizeX, sizeY);
  let startX = sideIndex % sizeX;
  let startY = (sideIndex - startX) / sizeX;
  let startOptions = getValidOutlets(startX, startY, maxX, maxY);
  let startDirection = getRandomSetBit(startOptions);
  Pipe.saveShape(sideIndex, startDirection | Shape.PIPE_START);
  Pipe.startFlowFrom(
    Pipe.getIndex(startX, startY, sizeX),
    Shape.PIPE_OUTLET_LEFT,
    World.countdownEnd
  );

  let endX = maxX - startX;
  let endY = maxY - startY;
  let endOptions = getValidOutlets(endX, endY, maxX, maxY);
  let endDirection = getRandomSetBit(endOptions);
  Pipe.saveShape(endX + endY * sizeX, endDirection | Shape.PIPE_END);

  /*
  Pipe.saveShape(Pipe.getIndex(2, 1, sizeX), Shape.PIPE_OUTLET_TOP);
  Pipe.saveShape(Pipe.getIndex(2, 2, sizeX), Shape.PIPE_OUTLET_BOTTOM);
  Pipe.saveShape(Pipe.getIndex(2, 3, sizeX), Shape.PIPE_OUTLET_LEFT);
  Pipe.saveShape(Pipe.getIndex(2, 4, sizeX), Shape.PIPE_OUTLET_RIGHT);
  Pipe.saveShape(Pipe.getIndex(2, 5, sizeX), Shape.PIPE_OUTLET_TOP | Shape.PIPE_OUTLET_BOTTOM);
  Pipe.saveShape(Pipe.getIndex(2, 6, sizeX), Shape.PIPE_OUTLET_CROSS);
  */

  /*
  Pipe.saveShape(Pipe.getIndex(2, 2, sizeX), Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_END);
  Pipe.saveShape(Pipe.getIndex(3, 2, sizeX), Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_BOTTOM);
  Pipe.saveShape(
    Pipe.getIndex(3, 3, sizeX),
    Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_TOP | Shape.PIPE_BLOCKED
  );
  Pipe.startFlowFrom(Pipe.getIndex(2, 2, sizeX), Shape.PIPE_OUTLET_LEFT, World.countdownEnd);
  */

  /*
  Pipe.saveShape(Pipe.getIndex(2, 2, sizeX), Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_END);
  // Pipe.saveShape(Pipe.getIndex(3, 2, sizeX), Shape.PIPE_OUTLET_CROSS | Shape.PIPE_BLOCKED);
  Pipe.saveShape(Pipe.getIndex(4, 2, sizeX), Shape.PIPE_START | Shape.PIPE_OUTLET_LEFT);
  Pipe.startFlowFrom(Pipe.getIndex(4, 2, sizeX), Shape.PIPE_OUTLET_RIGHT, World.countdownEnd);
  */

  // Testing
  /*
  Pipe.saveShape(sizeX + 0, Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_RIGHT);
  Pipe.startFlowFrom(sizeX + 0, Shape.PIPE_OUTLET_LEFT, World.countdownEnd);
  Pipe.saveShape(sizeX + 1, Shape.PIPE_OUTLET_CROSS);
  Pipe.saveShape(sizeX + 2, Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_BOTTOM);
  Pipe.saveShape(sizeX + sizeX + 2, Shape.PIPE_OUTLET_LEFT | Shape.PIPE_OUTLET_TOP);
  Pipe.saveShape(sizeX + sizeX + 1, Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_OUTLET_TOP);
  Pipe.saveShape(1, Shape.PIPE_OUTLET_RIGHT | Shape.PIPE_OUTLET_BOTTOM);
  */
}

export function getValidOutlets(startX: i32, startY: i32, maxX: i32, maxY: i32): u8 {
  let options: u8 = 0b1111; // TBLR
  options &= startX === 0 ? 0b1101 : startX === maxX ? 0b1110 : 0b1111;
  options &= startY === 0 ? 0b0111 : startY === maxY ? 0b1011 : 0b1111;
  return options;
}
