# SHD-CCP / geometric-engine-spec

**Layer 0: the specification and formal proofs.** This repository is the single source of truth for the Geometric Engine: RFCs 00–06, their golden vectors and the Lean 4 proofs. It holds **no runtime code**. Every other repository in this ecosystem folder sits downstream of it. The `shdccp/2` biochain stream is specified elsewhere, in RFC 07 (see [RFC 07 and the shdccp/2 contract vectors](#rfc-07-and-the-shdccp2-contract-vectors)).

| Directory | Contents |
| :--- | :--- |
| [`rfcs/`](rfcs/) | Language-independent specifications (RFC 00–06). RFC 07 is in BioChainAI/SHD-CCP-core (below). |
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

Nobody edits the vectors by hand. [`SHD-CCP/geometric-engine`](../geometric-engine) generates them with `verification/export_golden_vectors.py`, and CI fails if the committed files drift from that generator, or if `test_vectors/` holds a file the generator does not write (other than `README.md` and `schema.json`). Every conformance runner discovers the suites from `test_vectors/*.json`; see [`CONFORMANCE.md`](CONFORMANCE.md).

## RFC 07 and the shdccp/2 contract vectors

RFC 07, *the shdccp/2 biochain contract*, specifies the `shdccp/2` stream that Owl-Academy grows and verifies: framing, crystal packets, the rank coder, leaves and the Merkle rule, weaves, chainId and the record fields. It continues this folder's RFC numbering, but it and its vectors live in [BioChainAI/SHD-CCP-core](https://github.com/BioChainAI/SHD-CCP-core):

| What | Where | Licence |
| :--- | :--- | :--- |
| RFC 07 | [`rfcs/07_shdccp2_contract.md`](https://github.com/BioChainAI/SHD-CCP-core/blob/main/rfcs/07_shdccp2_contract.md) | CC0-1.0 |
| Its contract vectors, with their own schema, generator, drift check and lock | [`contract_vectors/`](https://github.com/BioChainAI/SHD-CCP-core/tree/main/contract_vectors) | CC0-1.0, except a fragment of its `schema.json` copied from this folder, which stays MIT (see SHD-CCP-core's `NOTICE`) |

RFCs 00–06 stay here as they are, as the history of the Geometric Engine specification. The contract vectors are not SHDGEV01 suites, and the runners in this ecosystem do not read them. A `shdccp/2` crystal packet is also not an RFC 01 tile, although both are 64-bit words: [RFC 07 section 14](https://github.com/BioChainAI/SHD-CCP-core/blob/main/rfcs/07_shdccp2_contract.md#14-identifiers-that-cannot-be-read-as-one-another-non-normative) explains why neither can be decoded as the other.

## Downstream repositories

| Layer | Repository |
| :--- | :--- |
| 1 | `SHD-CCP/geometric-engine`: Python reference implementation and vector generator |
| 2 | `SHD-CCP/geometric-engine-{elixir,c,java,rust,js}`: native bindings, each mounting this repo at `./spec` |
| 3 | `BioChain-AI/biochain`: application layer that would consume the Layer 2 packages (aspirational; see the [ecosystem README](../../README.md)) |
| 4 | `Owl-Academy/geometric-engine-course`: teaching material, Livebooks and visualizers (aspirational; see the [ecosystem README](../../README.md)) |
