# SHD-CCP

Landing portal and documentation hub for the **SHD-CCP** protocol (the 64-bit Einstein Tile) and the **Geometric Engine**. The site is served from this repository via GitHub Pages.

## Ecosystem

The protocol, the reference engine, the language bindings, the application layer and the course are split across a 5-layer federated set of repositories. All of them are anchored by a single spec repo:

| Layer | Repository | Role |
| :---: | :--- | :--- |
| 0 | `SHD-CCP/geometric-engine-spec` | RFCs, golden test vectors, Lean 4 proofs. **The source of truth.** |
| 1 | `SHD-CCP/geometric-engine` | Python reference implementation and vector generator |
| 2 | `SHD-CCP/geometric-engine-{c,rust,java,elixir,js}` | Native bindings, certified against the Layer 0 vectors |
| 3 | `BioChain-AI/biochain` | Application and governance platform |
| 4 | `Owl-Academy/geometric-engine-course` | Livebooks, simulators, walkthroughs |

These repositories are currently staged under [`ecosystem/`](ecosystem/). See [`ecosystem/README.md`](ecosystem/README.md) for the architecture, the conformance pipeline and how to split each folder into its own repo.

*The Geometric Engine of Time* is the title of the chronometric 5-tier orbital calculator module inside the engine (RFC 05).

## Visualizations in this repo

- [`Geometric_Engine/Geometric_Engine_Tutorial.html`](Geometric_Engine/Geometric_Engine_Tutorial.html)
- [`Visualization_Repository/Lattice_Architecture/72-node_Tri_stream_animation.html`](Visualization_Repository/Lattice_Architecture/72-node_Tri_stream_animation.html)
- [`Simulations/Hyper-Sim/Decoder/`](Simulations/Hyper-Sim/Decoder/)

## Site setup

See [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) for the sign-in gate and Firebase configuration.
