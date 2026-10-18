// Closed-form Garner CRT over (881, 883, 887) (RFC 02).

export const MODULI = Object.freeze([881, 883, 887]);
export const M = 690017701;
const C12 = 441; // 881^-1 mod 883
const C123 = 37; // (881 * 883)^-1 mod 887

export function encode(n) {
  if (!Number.isInteger(n) || n < 0 || n >= M) throw new RangeError(`cubic index out of range: ${n}`);
  return [n % 881, n % 883, n % 887];
}

export function decode([r1, r2, r3]) {
  if (![r1, r2, r3].every((r, i) => Number.isInteger(r) && r >= 0 && r < MODULI[i])) {
    throw new RangeError("residue out of range");
  }
  const v2 = (((r2 + 883 - (r1 % 883)) % 883) * C12) % 883;
  const t = (r1 + 881 * v2) % 887;
  const v3 = (((r3 + 887 - t) % 887) * C123) % 887;
  return r1 + 881 * v2 + 777923 * v3;
}
