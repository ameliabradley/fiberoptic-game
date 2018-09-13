import * as Keyboard from "../shared/keyboard";

"use strict";

// Set up the canvas with a 2D rendering context
let canvases = document.getElementsByTagName("canvas");
var cnv = canvases[0];
var bg = canvases[1];

var ctx = cnv.getContext("2d");
var ctxbg = bg.getContext("2d");
let width: number;
let height: number;
let canvasByteSize: number;
let size: number;
let imageData: ImageData;
let argb: Uint32Array;

function updateSize() {
  width = 240;
  height = 200;

  bg.width = cnv.width = width;
  bg.height = cnv.height = height;

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

let wasmExports: any;

window.addEventListener("keydown", e => {
  if (wasmExports) {
    let key = charFromKey(e.key);
    wasmExports.setKeys(key);
    /*
    if (key & Keyboard.FLAG_SPACE) {
      let osc = playTone(195.997717990874647, "sine");
      setTimeout(() => osc.stop(), 1000);
    } else {
      let osc = playTone(130.812782650299317, "sine");
      setTimeout(() => osc.stop(), 1000);
    }
    */
  }
});

/*
let audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
let masterGainNode = audioContext.createGain();
masterGainNode.connect(audioContext.destination);
masterGainNode.gain.value = 0.5; // volumeControl.value;
function playTone(freq: number, wave: string) {
  let osc = audioContext.createOscillator();
  osc.connect(masterGainNode);
  osc.type = wave;
  osc.frequency.value = freq;
  osc.start();

  return osc;
}
*/

// fetch(window.location.hostname === "127.0.0.1" ? "module.untouched.wasm" : "module.optimized.wasm")
fetch("module.optimized.wasm")
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
        time: () => Math.floor(performance.now()),
        seti: (key: number, value: number) => localStorage.setItem(key as any, value as any),
        geti: (key: number) => parseInt(localStorage.getItem(key as any))
      }
    })
  )
  .then(results => {
    wasmExports = results.instance.exports;
    wasmExports.setupWorld(10, 8);

    var offsetCanvas = wasmExports.getCanvasOffset();
    var mem = new Uint32Array(memory.buffer, offsetCanvas);

    (function render() {
      requestAnimationFrame(render);
      wasmExports.step(width, height, Math.floor(performance.now()));
      argb.set(mem.subarray(0, size)); // copy output to image buffer
      ctx.putImageData(imageData, 0, 0); // apply image buffer
      ctxbg.putImageData(imageData, 0, 0); // apply image buffer
    })();
  });
