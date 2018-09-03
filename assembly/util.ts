export function random(): f64 {
  return Math.random();
}

export function randomInt(min: i32, max: i32): i32 {
  return (Math.floor(random() * ((max - min + 1) as f64)) as i32) + min;
}

export function safeSetMem<T>(offset: usize, value: T): void {
  if (offset > HEAP_BASE) {
    store<T>(offset, value);
  } else {
    // throw new Error("Out of bounds");
  }
}

const FLAG_ORIENTATION_TOP: u8 = 0b1000;
const FLAG_ORIENTATION_BOTTOM: u8 = 0b0100;
const FLAG_ORIENTATION_LEFT: u8 = 0b0010;
const FLAG_ORIENTATION_RIGHT: u8 = 0b0001;

export function countSetBits(n: u8): u8 {
  let count: u8 = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}

declare namespace console {
  function logi(val: i32): void;
}

export function getRandomSetBit(bits: u8): u8 {
  let total = countSetBits(bits);
  let random = randomInt(0, total - 1);

  let count: u8 = 0;
  let i: u8 = 0;
  const size: u8 = 8; // sizeof<u8>() as u8;
  for (let n: u8 = 0; n < size; n++) {
    let flag: u8 = 1 << (n as u8);
    if (flag & bits) {
      if (i === random) {
        return flag;
      }
      i++;
    }
  }

  return 0;
}

// TBLR
function getRandomOrientation(blocked: u8): u8 {
  if (blocked & FLAG_ORIENTATION_LEFT) {
    if (blocked & FLAG_ORIENTATION_TOP) {
      return randomInt(0, 1) ? FLAG_ORIENTATION_RIGHT : FLAG_ORIENTATION_BOTTOM;
    } else if (blocked & FLAG_ORIENTATION_BOTTOM) {
      return randomInt(0, 1) ? FLAG_ORIENTATION_RIGHT : FLAG_ORIENTATION_TOP;
    } else {
      switch (randomInt(0, 2)) {
        case 0: {
          return FLAG_ORIENTATION_RIGHT;
        }
        case 1: {
          return FLAG_ORIENTATION_TOP;
        }
        default:
        case 2: {
          return FLAG_ORIENTATION_BOTTOM;
        }
      }
    }
  } else if (blocked & FLAG_ORIENTATION_LEFT) {
    if (blocked & FLAG_ORIENTATION_TOP) {
      return randomInt(0, 1) ? FLAG_ORIENTATION_LEFT : FLAG_ORIENTATION_BOTTOM;
    } else if (blocked & FLAG_ORIENTATION_BOTTOM) {
      return randomInt(0, 1) ? FLAG_ORIENTATION_LEFT : FLAG_ORIENTATION_TOP;
    } else {
      switch (randomInt(0, 2)) {
        case 0: {
          return FLAG_ORIENTATION_LEFT;
        }
        case 1: {
          return FLAG_ORIENTATION_TOP;
        }
        default:
        case 2: {
          return FLAG_ORIENTATION_BOTTOM;
        }
      }
    }
  } else {
    if (blocked & FLAG_ORIENTATION_TOP) {
      switch (randomInt(0, 2)) {
        case 0: {
          return FLAG_ORIENTATION_LEFT;
        }
        case 1: {
          return FLAG_ORIENTATION_BOTTOM;
        }
        default:
        case 2: {
          return FLAG_ORIENTATION_RIGHT;
        }
      }
    } else if (blocked & FLAG_ORIENTATION_BOTTOM) {
      switch (randomInt(0, 2)) {
        case 0: {
          return FLAG_ORIENTATION_LEFT;
        }
        case 1: {
          return FLAG_ORIENTATION_TOP;
        }
        default:
        case 2: {
          return FLAG_ORIENTATION_RIGHT;
        }
      }
    } else {
      switch (randomInt(0, 3)) {
        case 0: {
          return FLAG_ORIENTATION_LEFT;
        }
        case 1: {
          return FLAG_ORIENTATION_TOP;
        }
        case 2: {
          return FLAG_ORIENTATION_BOTTOM;
        }
        default:
        case 3: {
          return FLAG_ORIENTATION_RIGHT;
        }
      }
    }
  }
}
