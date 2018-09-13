// Ideally these would be in a Typescript definition file, but I can't get that to work
declare namespace console {
  function logi(val: i32): void;
  function logf(val: f32): void;
}

declare namespace tools {
  function time(): i32;
  function seti(key: i32, val: i32): void;
  function geti(key: i32): i32;
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

export function saveNumber(key: i32, val: i32): void {
  tools.seti(key, val);
}

export function fetchSavedNumber(key: i32): i32 {
  return tools.geti(key);
}
