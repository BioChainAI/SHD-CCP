# RFC 02: Local Engine and QCC

| | |
| :--- | :--- |
| **Status** | Partially normative (§2, §3) |
| **Spec version** | 0.1.0 |
| **Vectors** | `garner_crt_881_883_887`, `gram_tqf_collinearity`; `hurwitz_primes_and_s5` pending |
| **Reference** | `SHD-CCP/geometric-engine` `hurwitz.py`, `crt_garner.py`, `qcc.py` |

Key words MUST, SHOULD and MAY follow RFC 2119.

## 1. Scope

Local exact computation on 𝓜_lower: the Hurwitz ring, 128-bit Gram-TQF, Garner CRT cubic indexing, the S₅ shift-and-add tree, and Quaternion Chain Compression (QCC).

## 2. Garner CRT cubic index (normative)

A cubic index `n ∈ [0, M)`, where `M = 881 · 883 · 887 = 690 017 701`, is carried as residues `(r₁, r₂, r₃) = (n mod 881, n mod 883, n mod 887)`.

Decoding MUST be equivalent to Garner's mixed-radix reconstruction, which needs these constants:

```
C12  = 881⁻¹         mod 883 = 441
C123 = (881 · 883)⁻¹ mod 887 = 37

v₂ = ((r₂ − r₁) · C12)              mod 883
v₃ = ((r₃ − r₁ − 881 · v₂) · C123)  mod 887
n  = r₁ + 881 · v₂ + 777 923 · v₃
```

Here `mod` is the non-negative remainder. Every intermediate value fits in 32 bits. Inputs outside the residue ranges MUST be rejected.

## 3. Gram-TQF collinearity (normative)

For integer points `P₁, P₂, P₃` with quadrances `Q₁ = |P₂P₃|²`, `Q₂ = |P₁P₃|²`, `Q₃ = |P₁P₂|²`:

```
A = (Q₁ + Q₂ + Q₃)² − 2(Q₁² + Q₂² + Q₃²)      ( = 16 · area² ≥ 0 )
```

The points are collinear iff `A = 0`. For coordinates `|c| ≤ 2²⁰`, `A ≤ 2⁸⁸`, and intermediate terms reach about 2⁹⁰. Implementations MUST compute `A` exactly, using 128-bit or arbitrary-precision integers. Evaluating it in IEEE-754 float64 misclassifies thin triangles: about 12 % of the vector suite.

## 4. Hurwitz ring (draft)

Hurwitz integers are stored in doubled coordinates `(a, b, c, d) = 2q`, with all four coordinates of the same parity. `N(q) = (a² + b² + c² + d²) / 4`.

TODO: the 94 4D prime nodes, the S₅ reduced words up to depth 8, and the multiplier-free `<< 1` shift-and-add routing.

## 5. QCC and TQF stream pruning (draft)

TODO: chain encoding, and the lossless pruning rule (drop interior points with `A = 0` against their neighbours). Include the bit-exact output format.
