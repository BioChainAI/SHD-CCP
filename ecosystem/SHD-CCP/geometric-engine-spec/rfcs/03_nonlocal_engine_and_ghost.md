# RFC 03: Non-Local Engine and the Ghost Map

| | |
| :--- | :--- |
| **Status** | Draft (outline) |
| **Spec version** | 0.1.0 |
| **Vectors** | — (planned) |
| **Reference** | `SHD-CCP/geometric-engine` — |

Key words MUST, SHOULD and MAY follow RFC 2119.

## Scope

Non-local synchronization on 𝓜_upper.

- Ghost map `G : Ball → ℍ³` with `Q_h = sinh² d_ℍ`
- 5-moment Vandermonde channel
- Ramanujan `X(5, q)` meeting graphs, used as the P2P overlay

## TODO

- [ ] Exact (integer or rational) representation of `Q_h` on the wire
- [ ] Vandermonde channel encoding and its inversion
- [ ] Construction and neighbour enumeration for `X(5, q)`
- [ ] Vector suite
