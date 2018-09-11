/**
 * Utility belt for rendering stuff
 * Contains only pure functions
 */

const PIXEL_SIZE = sizeof<i32>();

export function getPos(color: i32, pos: i32): f32 {
  let offset = 24 - pos * 8;
  return <f32>((color & (0xff << offset)) >>> offset);
}

export function getPosColor(color: f32, alpha: f32, inv_alpha: f32, bg: i32, pos: i32): u8 {
  let fg = alpha * getPos(<i32>color, pos);
  let bga = inv_alpha * getPos(bg, pos);
  return (fg + bga) as u8;
}

export function renderPixel(offset: i32, color: i32, alpha: boolean = false): void {
  if (alpha) {
    if ((color & 0xff000000) === 0xff000000) {
      store<i32>(offset, color);
    } else {
      let bg: i32 = load<i32>(offset);

      let fg3 = getPos(color, 0);

      if (fg3 === 0) return;

      let alpha: f32 = fg3 / 255;
      let inv_alpha: f32 = (255 - fg3) / 255;

      let b: u8 = getPosColor(<f32>color, alpha, inv_alpha, bg, 1);
      let g: u8 = getPosColor(<f32>color, alpha, inv_alpha, bg, 2);
      let r: u8 = getPosColor(<f32>color, alpha, inv_alpha, bg, 3);

      let result: i32 = 0xff000000 + ((<i32>b) << 16) + ((<i32>g) << 8) + r;

      store<i32>(offset, result);
    }
  } else {
    store<i32>(offset, color);
  }
}

export function getPixelOffset(x: i32, y: i32, width: i32): i32 {
  return (x + y * width) * PIXEL_SIZE;
}
