import { readFileSync } from "fs";

let wasm;
let memory;
const byteSize = 100;
const memorysize = ((byteSize + 0xffff) & ~0xffff) >>> 16;

const instantiate = async () => {
  const buffer = readFileSync("dist/unit.untouched.wasm");
  const module = await WebAssembly.compile(buffer);

  console.log("starting tests with page size", memorysize);
  memory = new WebAssembly.Memory({
    initial: memorysize
  });

  const instance = await WebAssembly.instantiate(module, {
    env: { memory: memory },
    JSMath: Math,
    console: {
      // import as console.logi
      logi(value) {
        console.log("logi: " + value);
      }
    }
  });

  startMemdiff();
  instance.exports.setupWorld(5, 5);
  showDiff(HEAP / 4);
  startMemdiff();

  return instance.exports;
};

const HEAP = 80; // TODO: Get automatically

var memdiff = new Uint32Array(16384);
function startMemdiff() {
  var mem = new Uint32Array(memory.buffer, 0);
  memdiff.set(mem);
}

function showDiff(until = undefined) {
  // console.log('showing differences...', desc)
  var mem = new Uint32Array(memory.buffer, 0, until);
  var sliced = memdiff.slice(0, until);
  var different = false;
  const jump = 15;
  for (var i = 0; i < sliced.length; i++) {
    if (sliced[i] !== mem[i]) {
      const first = Array.from(memdiff.slice(i, i + jump))
        .map(el => pad(el.toString(16), 8))
        .join("")
        .match(/.{1,4}/g)
        .join(" ");

      const second = Array.from(mem.slice(i, i + jump))
        .map(el => pad(el.toString(16), 8))
        .join("")
        .match(/.{1,4}/g)
        .join(" ");

      const diff = second
        .split("")
        .map((c, i) => (c === first[i] ? " " : c))
        .join("");

      // prettier-ignore
      console.log([
        ['offset: ', i, ' len: ', mem.length].join(''),
        ['original: ', first].join(''),
        ['     new: ', second].join(''),
        ['    diff: ', diff].join(''),
      ].join("\n"))
      // showMemory(memdiff, i, jump);
      // showMemory(mem, i, jump);
      different = true;
      i += jump;
    }
  }

  return different;
}

function pad(n, width, z = "0") {
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function showMemory(mem, offset: number = 52, length: number) {
  console.log(
    "offset",
    offset,
    Array.from(mem.slice(offset, offset + length))
      .map(el => pad(el.toString(16), 8))
      .join("")
      .match(/.{1,4}/g)
      .join(" "),
    "len",
    mem.length
  );
}

beforeAll(async done => {
  wasm = await instantiate();
  done();
});

beforeEach(() => {
  startMemdiff();
});

afterEach(() => {
  expect(showDiff(HEAP / 4)).toBe(false);
});

test("setupWorld correctly loads world", () => {
  // showDiff('');
  expect(wasm.getSizeX()).toBe(5);
  expect(wasm.getSizeY()).toBe(5);
});

test("random", () => {
  wasm.random();

  const randomInt = wasm.randomInt(10, 11);
  expect(randomInt).toBeGreaterThanOrEqual(10);
  expect(randomInt).toBeLessThanOrEqual(11);
});

test("getOffset", () => {
  const offset = wasm.getHeapBase();
  expect(offset).toBe(HEAP);
});

test("countSetBits", () => {
  expect(wasm.countSetBits(0b1)).toBe(1);
  expect(wasm.countSetBits(0b10)).toBe(1);
  expect(wasm.countSetBits(0b11)).toBe(2);
});

test("getRandomSetBit", () => {
  //expect(wasm.getRandomSetBit(0b1)).toBe(1);
  expect(wasm.getRandomSetBit(0b10)).toBe(2);
  expect(wasm.getRandomSetBit(0b11)).toBeLessThan(4);
});
