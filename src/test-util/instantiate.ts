import { readFileSync } from "fs";

let memory;
const byteSize = 100;
const memorysize = ((byteSize + 0xffff) & ~0xffff) >>> 16;

export const instantiate = async () => {
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

  instance.exports.setupWorld(5, 5);

  return instance.exports;
};
