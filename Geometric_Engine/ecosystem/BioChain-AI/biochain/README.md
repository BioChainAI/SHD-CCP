# BioChain-AI / biochain

**Layer 3: the application and governance platform.** It is a decentralized neuro-symbolic system that runs on top of the SHD-CCP Geometric Engine.

## Separation of concerns

`biochain` is a **consumer** of the Layer 2 bindings. It depends on them only as versioned packages from Hex, crates.io and the other registries. It never vendors or reimplements the mathematical primitives. A bug found in a primitive is fixed upstream, in the spec (Layer 0) or a binding (Layer 2), and then picked up here by bumping the version.

```text
geometric-engine-spec  ──►  geometric-engine-{elixir,rust,…}  ──►  biochain
     (Layer 0)                     (Layer 2, versioned)              (Layer 3)
```

## Layout

| Path | Component |
| :--- | :--- |
| `apps/helix_a_biostrata/` | **Helix A**: BioStrata proposer |
| `apps/helix_b_genesis_chain/` | **Helix B**: HyperSim Genesis Chain certifier |
| `apps/consensus/` | Proof-of-Manifold consensus over the Ramanujan `X(5, q)` overlay |
| `apps/ledger/` | QCC-compressed ledger state storage |
| `apps/agents/` | AI agent orchestration |
| `docs/` | Architecture and governance documentation |

The build tool is not chosen yet. An Elixir umbrella (`mix new biochain --umbrella`) would fit the planned dependency on `geometric_engine` from Hex and the OTP-based memory and handshake.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
