/*
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
*/
