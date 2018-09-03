import * as Keyboard from "../shared/keyboard";

"use strict";

// Set up the canvas with a 2D rendering context
var cnv = document.getElementsByTagName("canvas")[0];

var ctx = cnv.getContext("2d");
var bcr = cnv.getBoundingClientRect();

var width = 50;
var height = 50;
cnv.width = width;
cnv.height = height;

(cnv.style as any) = `
image-rendering: optimizeSpeed;
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: optimize-contrast;
image-rendering: crisp-edges;
image-rendering: pixelated;
-ms-interpolation-mode: nearest-neighbor;
`;
ctx.imageSmoothingEnabled = false;

var size = height * width;
var canvasByteSize = (size + size) << 2; // 4b per pixel (X << N is the same as X * 2 ^ N)

// TODO: Update this on release to the number of bytes we expect the internal memory to take up
var memByteSize = 500;

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

var bcr = cnv.getBoundingClientRect();
// exports.fill((loc.clientX - bcr.left) >>> 1, (loc.clientY - bcr.top) >>> 1, 0.5);

fetch("module.untouched.wasm")
  .then(response => response.arrayBuffer())
  .then(bytes =>
    WebAssembly.instantiate(bytes, {
      env: { memory: memory },
      JSMath: Math,
      console: {
        // import as console.logi
        logi(value: number) {
          //console.log("logi: " + (b) ? value.toString(2) : value);
          console.log("logi: ", value);
        }
      }
    })
  )
  .then(results => {
    exports = results.instance.exports;

    exports.setupWorld(8, 8, height, width);

    var mem = new Uint32Array(memory.buffer, memByteSize);
    (function update() {
      // setTimeout(update, 1000 / 30); // Update about 30 times a second
      // mem.copyWithin(memByteSize, size, size + size);      // copy output to input
      // const result = exports.simpleRender(char);                            // perform the next step
      // console.log(char);
      // char = 0;
      // console.log(mem.slice(0, 10))
    })();

    // Keep rendering the output at [size, 2*size]
    var imageData = ctx.createImageData(width, height);
    var argb = new Uint32Array(imageData.data.buffer);
    (function render() {
      requestAnimationFrame(render);
      exports.simpleRender(width, height);
      argb.set(mem.subarray(0, size)); // copy output to image buffer
      ctx.putImageData(imageData, 0, 0); // apply image buffer
    })();
  });
