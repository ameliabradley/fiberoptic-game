import * as Keyboard from "../shared/keyboard";

"use strict";

// Set up the canvas with a 2D rendering context
var cnv = document.getElementsByTagName("canvas")[0];

var ctx = cnv.getContext("2d");
let width: number;
let height: number;
let canvasByteSize: number;
let size: number;
let imageData: ImageData;
let argb: Uint32Array;

function updateSize() {
  width = 240;
  height = 200;

  cnv.width = width;
  cnv.height = height;

  ctx.imageSmoothingEnabled = false;

  size = height * width;
  canvasByteSize = (size + size) << 2; // 4b per pixel (X << N is the same as X * 2 ^ N)

  // render the output at [size, 2*size]
  imageData = ctx.createImageData(width, height);
  argb = new Uint32Array(imageData.data.buffer);
}

updateSize();
window.onresize = updateSize;

// TODO: Update this on release to the number of bytes we expect the internal memory to take up
var memByteSize = 800;

var totalPages = (memByteSize + ((canvasByteSize + 0xffff) & ~0xffff)) >>> 16;
console.log(`Memory Allocated: ${totalPages * 6.4} KiB`);

var memory = new WebAssembly.Memory({
  initial: totalPages
});

let char = 0;

function charFromKey(key: string) {
  switch (key) {
    case "w":
    case "ArrowUp":
      return Keyboard.FLAG_UP;

    case "s":
    case "ArrowDown":
      return Keyboard.FLAG_DOWN;

    case "a":
    case "ArrowLeft":
      return Keyboard.FLAG_LEFT;

    case "d":
    case "ArrowRight":
      return Keyboard.FLAG_RIGHT;

    case " ":
    case "Space":
      return Keyboard.FLAG_SPACE;
  }

  return 0;
}

let exports: any;

window.addEventListener("keydown", e => {
  char = char | charFromKey(e.key);
  exports.setKeys(char);
});
window.addEventListener("keyup", e => {
  char = char & ~charFromKey(e.key);
  exports.setKeys(char);
});

fetch("module.untouched.wasm")
  .then(response => response.arrayBuffer())
  .then(bytes =>
    WebAssembly.instantiate(bytes, {
      env: { memory: memory },
      JSMath: Math,
      console: {
        logi: (value: number) => console.log("logi: ", value),
        logf: (value: number) => console.log("logf: ", value)
      },
      tools: {
        time: () => Math.floor(performance.now())
      }
    })
  )
  .then(results => {
    exports = results.instance.exports;
    exports.setupWorld(10, 8);

    var offsetCanvas = exports.getOffsetRenderer();
    var mem = new Uint32Array(memory.buffer, offsetCanvas);

    (function render() {
      requestAnimationFrame(render);
      exports.step(width, height, Math.floor(performance.now()));
      argb.set(mem.subarray(0, size)); // copy output to image buffer
      ctx.putImageData(imageData, 0, 0); // apply image buffer
    })();
  });
