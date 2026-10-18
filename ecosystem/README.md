# Ecosystem staging area

This directory scaffolds the **5-layer federated architecture**. Every folder `ecosystem/<Org>/<repo>/` is a complete, self-contained repository: it has its own README, LICENSE, manifest, tests and `.github/workflows/`. Each one is ready to be split out into `github.com/<Org>/<repo>`.

The root workflow [`ecosystem-conformance.yml`](../.github/workflows/ecosystem-conformance.yml) runs every binding against the spec vectors while they live together here. After a split, each repo's own `ci.yml` takes over.

## Layers

| Layer | Repository | Role | State |
| :---: | :--- | :--- | :--- |
| 0 | [`SHD-CCP/geometric-engine-spec`](SHD-CCP/geometric-engine-spec) | RFCs 00–06, golden vectors, Lean 4 proofs, papers. **Single source of truth.** | RFC skeletons; 3 vector suites; Lean project with the CRT constants checked |
| 1 | [`SHD-CCP/geometric-engine`](SHD-CCP/geometric-engine) | Python reference implementation and vector generator | tile, CRT and Gram-TQF implemented; the rest stubbed |
| 2 | [`SHD-CCP/geometric-engine-c`](SHD-CCP/geometric-engine-c) | C11 `libgengine`, CMake | CONFORMANT |
| 2 | [`SHD-CCP/geometric-engine-rust`](SHD-CCP/geometric-engine-rust) | `no_std` crate | CONFORMANT |
| 2 | [`SHD-CCP/geometric-engine-java`](SHD-CCP/geometric-engine-java) | Java 21, Maven | CONFORMANT |
| 2 | [`SHD-CCP/geometric-engine-elixir`](SHD-CCP/geometric-engine-elixir) | BEAM / OTP, Hex | CONFORMANT |
| 2 | [`SHD-CCP/geometric-engine-js`](SHD-CCP/geometric-engine-js) | TypeScript / JS, npm | CONFORMANT |
| 3 | [`BioChain-AI/biochain`](BioChain-AI/biochain) | Application and governance platform | directory skeleton and architecture outline |
| 4 | [`Owl-Academy/geometric-engine-course`](Owl-Academy/geometric-engine-course) | Livebooks, simulators, walkthroughs | first Livebook; Pages workflow |

"CONFORMANT" here means the binding passes every case of the three suites that have cases so far (2,366 total). Those suites cover the tile codec (draft layout), the Garner CRT and the exact Gram-TQF.

## Conformance pipeline

```text
  SHD-CCP/geometric-engine ──export_golden_vectors.py──►  SHD-CCP/geometric-engine-spec
        (Layer 1)                                          rfcs/ · test_vectors/ · formal/lean4/
                                                                       │
             ┌───────────────┬──────────────┬──────────────┬───────────┴───┐
             ▼               ▼              ▼              ▼               ▼
            -c             -rust          -java         -elixir           -js
          (.bin)          (.bin)         (.bin)         (.bin)          (.json)
             └───────────────┴──────────────┴──────┬───────┴───────────────┘
                                                   ▼
                                       BioChain-AI/biochain
                                  (consumes versioned packages)
```

Each binding looks for the spec at `$GE_SPEC_DIR`, then `./spec` (the submodule after the split), then `../geometric-engine-spec` (the sibling folder here).

## Splitting a repository out

1. Create the empty target repo on GitHub, for example `SHD-CCP/geometric-engine-spec`.
2. Split the folder, history included, and push it:

   ```sh
   ecosystem/scripts/split.sh SHD-CCP/geometric-engine-spec
   git push git@github.com:SHD-CCP/geometric-engine-spec.git split/SHD-CCP/geometric-engine-spec:main
   ```

3. Split in this order: the spec first, then `geometric-engine`, then the bindings.
4. In each split binding, mount the spec:

   ```sh
   git submodule add https://github.com/SHD-CCP/geometric-engine-spec spec
   ```

## Organization map

| Org | Owns | Action |
| :--- | :--- | :--- |
| `SHD-CCP` | Layers 0–2 | Keep `SHD-CCP/SHD-CCP` (this repo) as the landing portal and docs hub |
| `BioChain-AI` | Layer 3 | Depend on Layer 2 only as versioned packages |
| `Owl-Academy` | Layer 4 | Host the Livebooks, simulators and walkthroughs |
| `Ebayednoob` | Personal portfolio | Pin the flagship repos from the three orgs above |
| `Schism-Labs` | R&D incubator: open problems P1–P16, CUDA/FPGA | **Undecided:** rename to `Prism-Labs`, `Geometric-Labs` or `BEAM-Engine` |

## Open decisions

- [ ] Rename for `Schism-Labs` (no repo is scaffolded for it until a name is chosen)
- [ ] Canonical Einstein Tile layout: Gate Byte and per-Form fields (RFC 01). The tile suite stays `draft` until this is settled.
- [ ] Build tool for `biochain`
- [ ] Copyright holder for each org's LICENSE (every repo currently carries the root MIT license, "Schism-Labs-AI")
