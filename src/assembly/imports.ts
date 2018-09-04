// Ideally these would be in a Typescript definition file, but I can't get that to work
declare namespace console {
  function logi(val: i32): void;
  function logf(val: f32): void;
}

declare namespace tools {
  function time(): i32;
}

export function logi(val: i32): void {
  console.logi(val);
}

export function logf(val: f32): void {
  console.logf(val);
}

export function getTime(): i32 {
  return tools.time();
}
