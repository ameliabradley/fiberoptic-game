export const PIPE_OUTLET_NONE: u8 = 0;
export const PIPE_OUTLET_RIGHT: u8 = 1;
export const PIPE_OUTLET_LEFT: u8 = 1 << 1;
export const PIPE_OUTLET_BOTTOM: u8 = 1 << 2;
export const PIPE_OUTLET_TOP: u8 = 1 << 3;
export const PIPE_OUTLET_CROSS: u8 =
  PIPE_OUTLET_BOTTOM | PIPE_OUTLET_LEFT | PIPE_OUTLET_RIGHT | PIPE_OUTLET_TOP;

export const PIPE_START: u8 = 1 << 4;
export const PIPE_END: u8 = 1 << 5;
