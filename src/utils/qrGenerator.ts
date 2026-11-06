/**
 * Compact, zero-dependency QR Code Generator for React Native & Web
 * Generates ISO/IEC 18004 compliant QR Code module matrices (Versions 1-6)
 */

export interface QRCodeData {
  size: number;
  modules: boolean[][];
}

// GF(256) Math tables for Reed-Solomon coding
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gmult(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

function rsComputePoly(ecCount: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < ecCount; i++) {
    const next = new Uint8Array(poly.length + 1);
    const factor = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gmult(poly[j], factor);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: Uint8Array, ecCount: number): Uint8Array {
  const poly = rsComputePoly(ecCount);
  const remainder = new Uint8Array(ecCount);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.copyWithin(0, 1);
    remainder[ecCount - 1] = 0;
    for (let j = 0; j < ecCount; j++) {
      remainder[j] ^= gmult(poly[j], factor);
    }
  }
  return remainder;
}

// Version specifications (capacity and EC bytes for Level M)
// Version 1 (21x21, 16 data bytes)
// Version 2 (25x25, 28 data bytes)
// Version 3 (29x29, 44 data bytes)
// Version 4 (33x33, 64 data bytes)
// Version 5 (37x37, 86 data bytes)
// Version 6 (41x41, 108 data bytes)
const VERSION_SPECS = [
  { version: 1, size: 21, dataBytes: 16, ecBytes: 10 },
  { version: 2, size: 25, dataBytes: 28, ecBytes: 16 },
  { version: 3, size: 29, dataBytes: 44, ecBytes: 26 },
  { version: 4, size: 33, dataBytes: 64, ecBytes: 18 * 2 },
  { version: 5, size: 37, dataBytes: 86, ecBytes: 24 * 2 },
  { version: 6, size: 41, dataBytes: 108, ecBytes: 16 * 4 },
];

export function generateQRCode(text: string): QRCodeData {
  const utf8Bytes = new TextEncoder().encode(text);
  const spec = VERSION_SPECS.find((s) => s.dataBytes >= utf8Bytes.length + 3) || VERSION_SPECS[5];
  const size = spec.size;

  // Initialize matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Add Finder Patterns
  addFinderPattern(matrix, isFunction, 0, 0);
  addFinderPattern(matrix, isFunction, size - 7, 0);
  addFinderPattern(matrix, isFunction, 0, size - 7);

  // Add Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    const bit = i % 2 === 0;
    if (!isFunction[6][i]) {
      matrix[6][i] = bit;
      isFunction[6][i] = true;
    }
    if (!isFunction[i][6]) {
      matrix[i][6] = bit;
      isFunction[i][6] = true;
    }
  }

  // Dark module
  matrix[size - 8][8] = true;
  isFunction[size - 8][8] = true;

  // Alignment Pattern for version 2+
  if (spec.version >= 2) {
    const alignPos = size - 7;
    addAlignmentPattern(matrix, isFunction, alignPos, alignPos);
  }

  // Data Bitstream construction (Byte mode)
  const bits: number[] = [];
  // Mode indicator: 0100 (Byte mode)
  bits.push(0, 1, 0, 0);
  // Character count indicator (8 bits for version 1-9)
  for (let i = 7; i >= 0; i--) {
    bits.push((utf8Bytes.length >> i) & 1);
  }
  // Data bytes
  for (const byte of utf8Bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  // Terminator
  const maxBits = spec.dataBytes * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) {
    bits.push(0);
  }
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad bytes: 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    const pad = padBytes[padIdx % 2];
    for (let i = 7; i >= 0; i--) {
      bits.push((pad >> i) & 1);
    }
    padIdx++;
  }

  // Convert bits to data byte array
  const dataArray = new Uint8Array(spec.dataBytes);
  for (let i = 0; i < spec.dataBytes; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i * 8 + j];
    }
    dataArray[i] = byte;
  }

  // Error correction calculation
  const ecArray = rsEncode(dataArray, spec.ecBytes);

  // Combine data + EC into allBits
  const allBits: number[] = [];
  for (let i = 0; i < dataArray.length; i++) {
    for (let j = 7; j >= 0; j--) {
      allBits.push((dataArray[i] >> j) & 1);
    }
  }
  for (let i = 0; i < ecArray.length; i++) {
    for (let j = 7; j >= 0; j--) {
      allBits.push((ecArray[i] >> j) & 1);
    }
  }

  // Place data bits in matrix (serpentine traversal)
  let bitIdx = 0;
  let upward = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column
    const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
    for (const r of rows) {
      for (let c = right; c >= right - 1; c--) {
        if (!isFunction[r][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          // Apply Mask 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = (bit ^ (mask ? 1 : 0)) === 1;
        }
      }
    }
    upward = !upward;
  }

  // Format information (Mask 0 + EC Level M -> 101010000010010)
  applyFormatInfo(matrix, size);

  return { size, modules: matrix };
}

function addFinderPattern(matrix: boolean[][], isFunction: boolean[][], startX: number, startY: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const y = startY + r;
      const x = startX + c;
      if (y >= 0 && y < matrix.length && x >= 0 && x < matrix.length) {
        isFunction[y][x] = true;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          matrix[y][x] =
            r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        } else {
          matrix[y][x] = false; // Separator
        }
      }
    }
  }
}

function addAlignmentPattern(matrix: boolean[][], isFunction: boolean[][], centerX: number, centerY: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const y = centerY + r;
      const x = centerX + c;
      if (y >= 0 && y < matrix.length && x >= 0 && x < matrix.length) {
        if (!isFunction[y][x]) {
          isFunction[y][x] = true;
          matrix[y][x] = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
        }
      }
    }
  }
}

function applyFormatInfo(matrix: boolean[][], size: number) {
  // Format bits for Level M, Mask pattern 0 (00000 ^ 10101 = 101010000010010)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  for (let i = 0; i <= 5; i++) matrix[8][i] = formatBits[i] === 1;
  matrix[8][7] = formatBits[6] === 1;
  matrix[8][8] = formatBits[7] === 1;
  matrix[7][8] = formatBits[8] === 1;
  for (let i = 9; i <= 14; i++) matrix[14 - i][8] = formatBits[i] === 1;

  for (let i = 0; i <= 7; i++) matrix[size - 1 - i][8] = formatBits[i] === 1;
  for (let i = 8; i <= 14; i++) matrix[8][size - 15 + i] = formatBits[i] === 1;
}
