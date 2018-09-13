// Original Author: Paul Sauve (https://github.com/PaulBGD/PixelFont)
// Adapted to AssemblyScript by Lee Bradley
export const LETTER_0: u16 = 0b0111101101101111;
export const LETTER_1: u16 = 0b0010010010010010;
export const LETTER_2: u16 = 0b0111001111100111;
export const LETTER_3: u16 = 0b0111100111100111;
export const LETTER_4: u16 = 0b0100100111101101;
export const LETTER_5: u16 = 0b0111100111001111;
export const LETTER_6: u16 = 0b0111101111001111;
export const LETTER_7: u16 = 0b0100100100100111;
export const LETTER_8: u16 = 0b0111101111101111;
export const LETTER_9: u16 = 0b0111100111101111;
export const LETTER_DASH: u16 = 0b0000000111000000;
export const LETTER_A: u16 = 0b0101111101101010;
export const LETTER_B: u16 = 0b0011101111101011;
export const LETTER_C: u16 = 0b0111001001001111;
export const LETTER_D: u16 = 0b0011101101101011;
export const LETTER_E: u16 = 0b0111001111001111;
export const LETTER_F: u16 = 0b0001001011001111;
export const LETTER_G: u16 = 0b0110001101001110;
export const LETTER_H: u16 = 0b0101101111101101;
export const LETTER_I: u16 = 0b0111010010010111;
export const LETTER_J: u16 = 0b0111101100100111;
export const LETTER_K: u16 = 0b0001101011101001;
export const LETTER_L: u16 = 0b0111001001001001;
export const LETTER_M: u16 = 0b0001001101101111;
export const LETTER_N: u16 = 0b0001001101011001;
export const LETTER_O: u16 = 0b0111101101101111;
export const LETTER_P: u16 = 0b0001001111101111;
export const LETTER_Q: u16 = 0b0111101001001110;
export const LETTER_R: u16 = 0b0101011101101011;
export const LETTER_S: u16 = 0b0111100111001111;
export const LETTER_T: u16 = 0b0010010010010111;
export const LETTER_U: u16 = 0b0111101101101101;
export const LETTER_V: u16 = 0b0100010010001001;
export const LETTER_W: u16 = 0b0111101001001001;
export const LETTER_X: u16 = 0b0001010100010001;
export const LETTER_Y: u16 = 0b0010010010101101;
export const LETTER_Z: u16 = 0b0111010100000111;
export const LETTER_SPACE: u16 = 0b0000000000000000;

export function getLetterFromChar(char: i32): i32 {
  switch (char) {
    case 45:
      return LETTER_DASH;
    case 48:
      return LETTER_0;
    case 49:
      return LETTER_1;
    case 50:
      return LETTER_2;
    case 51:
      return LETTER_3;
    case 52:
      return LETTER_4;
    case 53:
      return LETTER_5;
    case 54:
      return LETTER_6;
    case 55:
      return LETTER_7;
    case 56:
      return LETTER_8;
    case 57:
      return LETTER_9;
    case 65:
      return LETTER_A;
    case 66:
      return LETTER_B;
    case 67:
      return LETTER_C;
    case 68:
      return LETTER_D;
    case 69:
      return LETTER_E;
    case 70:
      return LETTER_F;
    case 71:
      return LETTER_G;
    case 72:
      return LETTER_H;
    case 73:
      return LETTER_I;
    case 74:
      return LETTER_J;
    case 75:
      return LETTER_K;
    case 76:
      return LETTER_L;
    case 77:
      return LETTER_M;
    case 78:
      return LETTER_N;
    case 79:
      return LETTER_O;
    case 80:
      return LETTER_P;
    case 81:
      return LETTER_Q;
    case 82:
      return LETTER_R;
    case 83:
      return LETTER_S;
    case 84:
      return LETTER_T;
    case 85:
      return LETTER_U;
    case 86:
      return LETTER_V;
    case 87:
      return LETTER_W;
    case 88:
      return LETTER_X;
    case 89:
      return LETTER_Y;
    case 90:
      return LETTER_Z;
    default:
    case 32:
      return LETTER_SPACE;
  }
}
