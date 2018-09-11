import * as Pipe from "../baseGame/pipe";
import * as Shape from "../baseGame/shape";

export function clearMap(sizeX: i32, sizeY: i32): void {
  for (let i = 0; i < sizeX * sizeY; i++) {
    Pipe.saveShape(i, Shape.PIPE_OUTLET_NONE);
  }
}
