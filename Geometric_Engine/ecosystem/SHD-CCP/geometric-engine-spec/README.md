# SHD-CCP / geometric-engine-spec

**Layer 0: the specification and formal proofs.** This repository is the single source of truth for the SHD-CCP protocol and the Geometric Engine. It holds **no runtime code**. Every other repository in the ecosystem sits downstream of it.

| Directory | Contents |
| :--- | :--- |
| [`rfcs/`](rfcs/) | Language-independent specifications (RFC 00–06) |
| [`test_vectors/`](test_vectors/) | Canonical golden test vectors (`.json` plus a `.bin` mirror) and their JSON Schema |
| [`formal/lean4/`](formal/lean4/) | Lean 4 machine-checked proofs of the 15 Lemmas (`lake build`) |
| [`papers/`](papers/) | Published monographs (PDF / LaTeX) |

Spec version: see [`VERSION`](VERSION). Releases are tagged `vX.Y.Z`.

## The golden rule

> If a binding passes every **normative** vector in `test_vectors/` bit for bit, it is **certified conformant** with that spec version.

See [`CONFORMANCE.md`](CONFORMANCE.md) for the certification process and the badge text.

## Status of the suites

| Suite | RFC | Status | Cases |
| :--- | :---: | :--- | ---: |
| `einstein_tiles_forms_0_15` | 01 | draft (layout not frozen) | 66 |
| `garner_crt_881_883_887` | 02 | normative | 2,000 |
| `gram_tqf_collinearity` | 02 | normative | 300 |
| `hurwitz_primes_and_s5` | 02 | pending | – |
| `memory_erasure_cases` | 04 | pending | – |
| `handshake_alignment` | 06 | pending | – |

Nobody edits the vectors by hand. [`SHD-CCP/geometric-engine`](../geometric-engine) generates them with `verification/export_golden_vectors.py`, and CI fails if the committed files drift from that generator.

## Downstream repositories

| Layer | Repository |
| :--- | :--- |
| 1 | `SHD-CCP/geometric-engine`: Python reference implementation and vector generator |
| 2 | `SHD-CCP/geometric-engine-{elixir,c,java,rust,js}`: native bindings, each mounting this repo at `./spec` |
| 3 | `BioChain-AI/biochain`: application layer that consumes the Layer 2 packages |
| 4 | `Owl-Academy/geometric-engine-course`: teaching material, Livebooks and visualizers |
