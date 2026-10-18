# RFC 04: Twelve-Engine Cuboctahedral Memory

| | |
| :--- | :--- |
| **Status** | Draft (outline) |
| **Spec version** | 0.1.0 |
| **Vectors** | `memory_erasure_cases` (pending) |
| **Reference** | `SHD-CCP/geometric-engine` `memory_12.py` |

Key words MUST, SHOULD and MAY follow RFC 2119.

## Scope

- 12 engines on a cuboctahedral shell, plus a 13th engine
- Parity invariant `H₁ · H₂ · H₃ · H₄ = 1`. A single erased engine is recovered as `H₄ = (H₁ · H₂ · H₃)⁻¹`.
- 13th-engine cascade recovery
- 64-stream balancer

## TODO

- [ ] Group in which `Hᵢ` live and the exact encoding of each `Hᵢ`
- [ ] Which quadruples form parity groups on the shell
- [ ] Cascade recovery algorithm and its limits
- [ ] Stream-to-engine assignment
- [ ] Vector suite: single-erasure cases and cascade cases
