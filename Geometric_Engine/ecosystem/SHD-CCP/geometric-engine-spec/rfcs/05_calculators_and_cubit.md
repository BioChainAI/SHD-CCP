# RFC 05: Calculators and the Cubit

| | |
| :--- | :--- |
| **Status** | Draft (outline) |
| **Spec version** | 0.1.0 |
| **Vectors** | — (planned) |
| **Reference** | `SHD-CCP/geometric-engine` `calculators/` |

Key words MUST, SHOULD and MAY follow RFC 2119.

## Scope

| Module | Title |
| :--- | :--- |
| `orbital_5tier` | **The Geometric Engine of Time**: 6-channel, 5-tier toroidal orbital calculator, `W_Σ = 60`, ¹³³Cs 0.5 s parity closure, 432-cycle Platonic Great Year |
| `ttmpt_pump` | 10-node Torsional Trefoil Markov Pump, net current `J > 0` |
| `fp_prime_sieve` | 4D Hurwitz Fokker–Planck prime sieve, 30-node wheel |
| `acoustic_cubit` | Cramer (1993) real-air speed of sound and the local cubit `C₀(T)` |

## TODO

- [ ] Normative definitions and their exact (non-floating) forms where possible
- [ ] For the floating-point calculators (Cramer, Fokker–Planck), a tolerance policy (ULP bounds) and its place in the conformance rules
- [ ] Vector suites
