//! Exact 128-bit Gram-TQF collinearity (RFC 02).

/// Coordinates must satisfy `|c| <= COORD_MAX` for the result to be exact.
pub const COORD_MAX: i64 = 1 << 20;

pub type Point = (i64, i64);

#[inline]
fn quadrance(a: Point, b: Point) -> i128 {
    let (dx, dy) = ((a.0 - b.0) as i128, (a.1 - b.1) as i128);
    dx * dx + dy * dy
}

/// `A = (Q1+Q2+Q3)^2 - 2(Q1^2+Q2^2+Q3^2) = 16 * area^2`.
pub fn gram_tqf(p1: Point, p2: Point, p3: Point) -> u128 {
    let (q1, q2, q3) = (quadrance(p2, p3), quadrance(p1, p3), quadrance(p1, p2));
    let s = q1 + q2 + q3;
    (s * s - 2 * (q1 * q1 + q2 * q2 + q3 * q3)) as u128
}

pub fn is_collinear(p1: Point, p2: Point, p3: Point) -> bool {
    gram_tqf(p1, p2, p3) == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn right_triangle() {
        assert_eq!(gram_tqf((0, 0), (3, 0), (0, 4)), 576);
        assert!(is_collinear((0, 0), (2, 2), (-5, -5)));
    }
}
