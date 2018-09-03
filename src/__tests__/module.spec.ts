import * as Shape from "../assembly/shape";
import { instantiate } from "../test-util/instantiate";

const HEAP = 80; // TODO: Get automatically
let wasm;

beforeAll(async done => {
  wasm = await instantiate();
  done();
});

test("setupWorld correctly loads world", () => {
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

test("getRandomSide", () => {
  expect(wasm.getRegularIndexFromSideIndex(3, 3, 0)).toBe(0);
  expect(wasm.getRegularIndexFromSideIndex(3, 3, 1)).toBe(1);
  expect(wasm.getRegularIndexFromSideIndex(3, 3, 2)).toBe(2);
  expect(wasm.getRegularIndexFromSideIndex(3, 3, 3)).toBe(3);
  expect(wasm.getRegularIndexFromSideIndex(3, 3, 4)).toBe(5);
  expect(wasm.getRegularIndexFromSideIndex(3, 3, 5)).toBe(6);
  expect(wasm.getRegularIndexFromSideIndex(3, 3, 6)).toBe(7);
  expect(wasm.getRegularIndexFromSideIndex(3, 3, 7)).toBe(8);

  expect(wasm.getRegularIndexFromSideIndex(4, 8, 6)).toBe(8);
  expect(wasm.getRegularIndexFromSideIndex(4, 8, 7)).toBe(11);
});

test("getValidOutlets", () => {
  // TBLR
  expect(wasm.getValidOutlets(0, 0, 3, 4)).toBe(Shape.PIPE_OUTLET_BOTTOM | Shape.PIPE_OUTLET_RIGHT);
  expect(wasm.getValidOutlets(1, 1, 3, 4)).toBe(Shape.PIPE_OUTLET_CROSS);
  expect(wasm.getValidOutlets(3, 4, 3, 4)).toBe(Shape.PIPE_OUTLET_TOP | Shape.PIPE_OUTLET_LEFT);
});
