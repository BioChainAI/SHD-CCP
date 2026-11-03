# Stage 3: Certified Standard

The official Ontology Library. Every kernel here is **`[PROVEN]`**, its bit ranges are locked, and production software may rely on it.

Files arrive here only through `certification_bot.py certify`. Never add or edit one by hand: the linter checks each layout against the SHA-256 recorded at certification. To change a certified kernel, propose a new one in the Incubator, take it through the pipeline, then run `certification_bot.py supersede OLD --by NEW`.

| Domain | Forms | Scope | Planned kernels |
| :--- | :---: | :--- | :--- |
| [`Domain_0_Telemetry_Signals/`](Domain_0_Telemetry_Signals/) | 0–3 | Network routing, caches, exact physics | 0x0 Base Route, 0x1 Hurwitz Core, 0x3 Exact Scalar |
| [`Domain_1_Geometric_Pointers/`](Domain_1_Geometric_Pointers/) | 4–7 | Shapes, lattices, boundaries | 0x4 Voxel Cube, 0x6 Stella Octangula |
| [`Domain_2_Codex_Semantics/`](Domain_2_Codex_Semantics/) | 8–11 | LLM embeddings, latent concepts | 0x8 Geodesic Icosahedron |
| [`Domain_3_Memory_Offload/`](Domain_3_Memory_Offload/) | 12–15 | Pump configurations, recovery | 0xC 12-Engine Parity |

Every planned kernel currently starts as an `[OPEN]` draft in `01_Incubator_Experimental`.
