# Ecosystem staging area

This directory scaffolds the **5-layer federated architecture**. Every folder `Geometric_Engine/ecosystem/<Org>/<repo>/` is a complete, self-contained repository: it has its own README, LICENSE, manifest, tests and `.github/workflows/`. Each one is ready to be split out into `github.com/<Org>/<repo>`.

None has been split out yet, and no package has been published to a registry. The `<Org>/<repo>` names are the planned homes; today everything lives in the [BioChainAI](https://github.com/BioChainAI) organization (see [Where the work lives today](#where-the-work-lives-today)).

The root workflow [`ecosystem-conformance.yml`](../../.github/workflows/ecosystem-conformance.yml) runs every binding against the spec vectors while they live together here. The `.github/workflows/` files inside each folder are **templates** for after the split: GitHub runs only the workflows at the root of a repository, so here they never run.

## Layers

| Layer | Repository | Role | State |
| :---: | :--- | :--- | :--- |
| 0 | [`SHD-CCP/geometric-engine-spec`](SHD-CCP/geometric-engine-spec) | RFCs 00–06, golden vectors, Lean 4 proofs, papers. **Source of truth for the Geometric Engine.** RFC 07 (the `shdccp/2` stream) and its contract vectors live in [BioChainAI/SHD-CCP-core](https://github.com/BioChainAI/SHD-CCP-core) | RFC skeletons; 3 vector suites; Lean project with the CRT constants checked |
| 1 | [`SHD-CCP/geometric-engine`](SHD-CCP/geometric-engine) | Python reference implementation and vector generator | tile, CRT and Gram-TQF implemented; the rest stubbed |
| 2 | [`SHD-CCP/geometric-engine-c`](SHD-CCP/geometric-engine-c) | C11 `libgengine`, CMake | CONFORMANT |
| 2 | [`SHD-CCP/geometric-engine-rust`](SHD-CCP/geometric-engine-rust) | `no_std` crate | CONFORMANT |
| 2 | [`SHD-CCP/geometric-engine-java`](SHD-CCP/geometric-engine-java) | Java 21, Maven | CONFORMANT |
| 2 | [`SHD-CCP/geometric-engine-elixir`](SHD-CCP/geometric-engine-elixir) | BEAM / OTP, Hex | CONFORMANT |
| 2 | [`SHD-CCP/geometric-engine-js`](SHD-CCP/geometric-engine-js) | TypeScript / JS, npm | CONFORMANT |
| 3 | [`BioChain-AI/biochain`](BioChain-AI/biochain) | Application and governance platform | **Aspirational:** directory skeleton and architecture outline. The working application is [BioChainAI/BioChain-AI](https://github.com/BioChainAI/BioChain-AI), which does not use these bindings. |
| 4 | [`Owl-Academy/geometric-engine-course`](Owl-Academy/geometric-engine-course) | Livebooks, simulators, walkthroughs | **Aspirational:** one Livebook; its Pages workflow is a template. The working course site is [BioChainAI/Owl-Academy](https://github.com/BioChainAI/Owl-Academy), which does not use this folder. |

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
                           (planned: would consume versioned packages)
```

Each binding looks for the spec at `$GE_SPEC_DIR`, then `./spec` (the submodule after the split), then `../geometric-engine-spec` (the sibling folder here).

## Splitting a repository out

1. Create the empty target repo on GitHub, for example `SHD-CCP/geometric-engine-spec`.
2. Split the folder, history included, and push it:

   ```sh
   Geometric_Engine/ecosystem/scripts/split.sh SHD-CCP/geometric-engine-spec
   git push git@github.com:SHD-CCP/geometric-engine-spec.git split/SHD-CCP/geometric-engine-spec:main
   ```

3. Split in this order: the spec first, then `geometric-engine`, then the bindings.
4. In each split binding, mount the spec:

   ```sh
   git submodule add https://github.com/SHD-CCP/geometric-engine-spec spec
   ```

## Organization map (planned)

| Org | Owns | Action |
| :--- | :--- | :--- |
| `SHD-CCP` | Layers 0–2 | Keep `SHD-CCP/SHD-CCP` (this repo) as the landing portal and docs hub |
| `BioChain-AI` | Layer 3 | Depend on Layer 2 only as versioned packages |
| `Owl-Academy` | Layer 4 | Host the Livebooks, simulators and walkthroughs |
| `Ebayednoob` | Personal portfolio | Pin the flagship repos from the three orgs above |
| `Schism-Labs` | R&D incubator: open problems P1–P16, CUDA/FPGA | **Undecided:** rename to `Prism-Labs`, `Geometric-Labs` or `BEAM-Engine`. A [BioChainAI/Geometric-Labs](https://github.com/BioChainAI/Geometric-Labs) repository now exists (see below). |

## Where the work lives today

All of these repositories are in the BioChainAI organization.

| Repository | What it holds | Licence |
| :--- | :--- | :--- |
| [SHD-CCP](https://github.com/BioChainAI/SHD-CCP) (this repository) | the staged Layers 0–2 above, the Kernel Ontology, the landing site and the manual | MIT, (c) Schism-Labs-AI |
| [SHD-CCP-core](https://github.com/BioChainAI/SHD-CCP-core) | RFC 07 and the contract vectors of the `shdccp/2` biochain stream; the `SHDCCP-EINSTEIN-1` tile specification and its codecs | RFC 07 text and `contract_vectors/`: CC0-1.0, except a fragment of `contract_vectors/schema.json` copied from SHD-CCP, which stays MIT (SHD-CCP-core `NOTICE`); the rest GPL-3.0 |
| [Owl-Academy](https://github.com/BioChainAI/Owl-Academy) | the course site, and the reference implementation of the `shdccp/2` stream (`scripts/biomesh.js`) | MIT, (c) Ebayednoob |
| [BioChain-AI](https://github.com/BioChainAI/BioChain-AI) | the BioChain application: identity, attestation (ATTEST/1) and its Firestore rules | MIT, (c) Schism-Labs-AI |
| [Ebayednoob](https://github.com/BioChainAI/Ebayednoob) | personal site and research hub, including the Hyperbolic Lexicon, which checks RFC 07's vectors independently | GPL-3.0 |
| [Geometric-Labs](https://github.com/BioChainAI/Geometric-Labs) | an exact-arithmetic Python reference engine and verification lab, and the integration workspace for SHD-CCP-core, Kernel-Registry, CubiLoom, Manifold-Projection, FractalOS-runtime, PolyShard-Agent and Polycentric-Orchestrator | Apache-2.0 |

A `shdccp/2` crystal packet and an RFC 01 tile are both 64-bit words, but neither can be decoded as the other: [RFC 07 section 14](https://github.com/BioChainAI/SHD-CCP-core/blob/main/rfcs/07_shdccp2_contract.md#14-identifiers-that-cannot-be-read-as-one-another-non-normative) compares them with SHD-CCP-core's `SHDCCP-EINSTEIN-1` tile.

## Decisions

Decided (2026-11-07):

- [x] **Copyright holders of the existing BioChainAI repositories.** SHD-CCP and BioChain-AI are MIT, (c) Schism-Labs-AI; Owl-Academy is MIT, (c) Ebayednoob. No GPL-3.0 code (Ebayednoob, SHD-CCP-core) is copied into the MIT repositories; copied or generated files carry SPDX and NOTICE lines.
- [x] **Home of the `shdccp/2` contract.** The specification (RFC 07) and its contract vectors live in BioChainAI/SHD-CCP-core, under CC0-1.0 (except a fragment of `contract_vectors/schema.json` copied from SHD-CCP, which stays MIT). Owl-Academy owns the reference implementation, BioChain-AI owns ATTEST/1 and identity, and the Hyperbolic Lexicon in Ebayednoob is the independent check, never a dependency. RFCs 00–06 stay here as they are.
- [x] **The crystal byte 0x80.** `shdccp/2` packets carry the crystal bytes raw, 0x80 included (RFC 07 section 5.4). There is no `shdccp/3`.

Open:

- [ ] Rename for `Schism-Labs` (no repo is scaffolded for it until a name is chosen)
- [ ] Canonical Einstein Tile layout: Gate Byte and per-Form fields (RFC 01). The tile suite stays `draft` until this is settled. The decision starts from SHD-CCP-core's `SHDCCP-EINSTEIN-1` layout, which follows §6.1, Table 4 of the Fifteen Lemmas monograph.
- [ ] Build tool for `biochain`
- [ ] Copyright holder of each staged folder's `LICENSE` once it is split into its own repository. Until then the staged folders are part of this repository and carry its licence, MIT, (c) Schism-Labs-AI.
