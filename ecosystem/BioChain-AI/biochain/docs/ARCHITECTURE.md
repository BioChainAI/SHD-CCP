# BioChain Architecture

## Dual-Helix governance

| Helix | Role | Responsibility |
| :--- | :--- | :--- |
| A: BioStrata | Proposer | TODO |
| B: HyperSim Genesis Chain | Certifier | TODO |

TODO: describe the proposal → certification flow and which Einstein Tile Forms carry each message.

## Proof-of-Manifold consensus

TODO: validator selection over `X(5, q)`, finality, and fault model.

## Ledger state

TODO: how state is QCC-compressed, Merkle-committed and recovered (via the 12-engine memory, RFC 04).

## Engine dependencies

| Package | Version | Used for |
| :--- | :--- | :--- |
| `geometric_engine` (Hex) | `~> 0.1` | tile codec, CRT indexing, Gram-TQF |
