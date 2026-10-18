"""Exact Hurwitz-ring arithmetic and 128-bit Gram-TQF (RFC 02).

Gram-TQF: for integer points P1, P2, P3 with quadrances
Q1 = |P2-P3|^2, Q2 = |P1-P3|^2, Q3 = |P1-P2|^2,

    A = (Q1 + Q2 + Q3)^2 - 2 (Q1^2 + Q2^2 + Q3^2)   (= 16 * area^2)

and the points are collinear iff A == 0. With coordinates up to 2^20 the
intermediate terms reach ~2^89, so the computation is exact only in 128-bit
(or arbitrary-precision) integers; IEEE-754 float64 misclassifies thin
triangles.
"""

from dataclasses import dataclass

Point = tuple[int, int]


def quadrance(p: Point, q: Point) -> int:
    dx, dy = p[0] - q[0], p[1] - q[1]
    return dx * dx + dy * dy


def gram_tqf(p1: Point, p2: Point, p3: Point) -> int:
    q1, q2, q3 = quadrance(p2, p3), quadrance(p1, p3), quadrance(p1, p2)
    s = q1 + q2 + q3
    return s * s - 2 * (q1 * q1 + q2 * q2 + q3 * q3)


def is_collinear(p1: Point, p2: Point, p3: Point) -> bool:
    return gram_tqf(p1, p2, p3) == 0


def gram_tqf_float64(p1: Point, p2: Point, p3: Point) -> float:
    """The naive float64 evaluation, kept only to document where it fails."""
    q1, q2, q3 = (float(quadrance(a, b)) for a, b in ((p2, p3), (p1, p3), (p1, p2)))
    s = q1 + q2 + q3
    return s * s - 2.0 * (q1 * q1 + q2 * q2 + q3 * q3)


@dataclass(frozen=True)
class HurwitzQuaternion:
    """Hurwitz integer stored in doubled coordinates (a, b, c, d) = 2q.

    All four doubled coordinates share a parity: all even for Lipschitz
    integers, all odd for the half-integer coset.
    """

    a: int
    b: int
    c: int
    d: int

    def __post_init__(self):
        if len({self.a & 1, self.b & 1, self.c & 1, self.d & 1}) != 1:
            raise ValueError("doubled coordinates must share a parity")

    def norm(self) -> int:
        return (self.a * self.a + self.b * self.b + self.c * self.c + self.d * self.d) // 4

    def __mul__(self, o: "HurwitzQuaternion") -> "HurwitzQuaternion":
        # Product of doubled coords is 4 * (q * o); halve once to return 2 * (q * o).
        a = self.a * o.a - self.b * o.b - self.c * o.c - self.d * o.d
        b = self.a * o.b + self.b * o.a + self.c * o.d - self.d * o.c
        c = self.a * o.c - self.b * o.d + self.c * o.a + self.d * o.b
        d = self.a * o.d + self.b * o.c - self.c * o.b + self.d * o.a
        return HurwitzQuaternion(a // 2, b // 2, c // 2, d // 2)


def s5_reduced_words(depth: int):
    """Multiplier-free S5 shift-and-add routing tree (RFC 02 §S5)."""
    raise NotImplementedError("S5 tree: pending RFC 02 normative text")
