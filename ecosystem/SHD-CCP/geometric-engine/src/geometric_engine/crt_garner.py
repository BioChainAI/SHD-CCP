"""Closed-form (881, 883, 887) Garner CRT cubic index solver (RFC 02).

A cubic index n in [0, M), M = 881 * 883 * 887 = 690_017_701, is carried as
three residues. Garner's mixed-radix reconstruction needs only two constants:

    C12  = 881^-1           mod 883 = 441
    C123 = (881 * 883)^-1   mod 887 = 37
"""

MODULI = (881, 883, 887)
M = 881 * 883 * 887  # 690_017_701
C12 = 441
C123 = 37

assert (881 * C12) % 883 == 1
assert (881 * 883 * C123) % 887 == 1


def encode(n: int) -> tuple[int, int, int]:
    if not 0 <= n < M:
        raise ValueError(f"cubic index out of range [0, {M}): {n}")
    return (n % 881, n % 883, n % 887)


def decode(residues: tuple[int, int, int]) -> int:
    r1, r2, r3 = residues
    for r, m in zip(residues, MODULI):
        if not 0 <= r < m:
            raise ValueError(f"residue {r} out of range for modulus {m}")
    v2 = ((r2 - r1) * C12) % 883
    v3 = ((r3 - r1 - 881 * v2) * C123) % 887
    return r1 + 881 * v2 + 881 * 883 * v3
