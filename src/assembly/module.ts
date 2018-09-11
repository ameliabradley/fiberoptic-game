import { step as gameStep } from "./baseGame/game";
import { render } from "./ui/simpleRender";

export { setupWorld, setKeys } from "./baseGame/game";
export { getCanvasOffset } from "./ui/simpleRender";

export function step(width: i32, height: i32, time: i32): void {
  gameStep(time);
  render(width, height, time);
}
