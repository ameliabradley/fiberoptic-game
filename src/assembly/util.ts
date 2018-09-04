export function randomInt(min: i32, max: i32): i32 {
  return (Math.floor(Math.random() * ((max - min + 1) as f64)) as i32) + min;
}

export function countSetBits(n: u8): u8 {
  let count: u8 = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}

export function getRegularIndexFromSideIndex(sizeX: i32, sizeY: i32, sideIndex: i32): i32 {
  let maxSide = 4 * sizeX - 4;

  let startIndex: i32 = 0;
  if (sideIndex < sizeX) {
    startIndex = sideIndex;
  } else if (sideIndex < maxSide - sizeX) {
    let x = sideIndex + 1 - sizeX;
    startIndex = (Math.floor(x / 2) as i32) * (sizeX - 2) + sideIndex;
  } else {
    let volume = sizeX * sizeY;
    startIndex = volume - maxSide + sideIndex;
  }

  return startIndex;
}

export function getRandomSide(sizeX: i32, sizeY: i32): i32 {
  let maxSide = 4 * sizeX - 4;
  let sideIndex = randomInt(0, maxSide - 1);
  return getRegularIndexFromSideIndex(sizeX, sizeY, sideIndex);
}

export function getRandomSetBit(bits: u8): u8 {
  let total = countSetBits(bits);
  let random = randomInt(0, total - 1);

  let i: u8 = 0;
  for (let n: u8 = 0; n < 8; n++) {
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
