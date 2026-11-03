// Exact Gram-TQF collinearity (RFC 02), BigInt so thin triangles never round.

const quadrance = ([ax, ay], [bx, by]) => {
  const dx = BigInt(ax) - BigInt(bx);
  const dy = BigInt(ay) - BigInt(by);
  return dx * dx + dy * dy;
};

/** A = (Q1+Q2+Q3)^2 - 2(Q1^2+Q2^2+Q3^2) = 16 * area^2 */
export function gramTqf(p1, p2, p3) {
  const q1 = quadrance(p2, p3);
  const q2 = quadrance(p1, p3);
  const q3 = quadrance(p1, p2);
  const s = q1 + q2 + q3;
  return s * s - 2n * (q1 * q1 + q2 * q2 + q3 * q3);
}

export const isCollinear = (p1, p2, p3) => gramTqf(p1, p2, p3) === 0n;
