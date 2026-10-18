# RFC 06: Frame-Free Agent Alignment Handshake

| | |
| :--- | :--- |
| **Status** | Draft (outline) |
| **Spec version** | 0.1.0 |
| **Vectors** | `handshake_alignment` (pending) |
| **Reference** | `SHD-CCP/geometric-engine` `handshake.py` |

Key words MUST, SHOULD and MAY follow RFC 2119.

## Scope

The 6-step non-local alignment handshake (monograph §9.6). Two agents with no shared coordinate frame agree on one by exchanging frame-free quadrance signatures, then solving for the relative rotation with Horn's method over the binary octahedral group 2O.

## Steps

| # | Step | Status |
| :---: | :--- | :--- |
| 1 | | TODO |
| 2 | | TODO |
| 3 | | TODO |
| 4 | | TODO |
| 5 | | TODO |
| 6 | | TODO |

## TODO

- [ ] Message formats (as Einstein Tiles), plus timeouts and retries
- [ ] State machine (maps to `:gen_statem` in the Elixir binding)
- [ ] Vector suite: signatures and the resulting Horn quaternions
