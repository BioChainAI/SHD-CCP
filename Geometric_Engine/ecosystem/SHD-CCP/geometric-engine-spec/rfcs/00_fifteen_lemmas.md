# RFC 00: The Fifteen Lemmas and System Propositions

| | |
| :--- | :--- |
| **Status** | Draft (outline) |
| **Spec version** | 0.1.0 |
| **Vectors** | — (proofs live in `formal/lean4/`) |
| **Reference** | `SHD-CCP/geometric-engine`  |

Key words MUST, SHOULD and MAY follow RFC 2119.

## Scope

The mathematical constitution that every other RFC builds on. The lemmas are grouped in four layers, and each has a matching Lean 4 module.

| Layer | Lemmas | Topic | Lean module |
| :--- | :--- | :--- | :--- |
| I | 1–3 | Synthetic projective geometry, harmonic bundles | `Lemmas01To03_Synthetic` |
| II | 4–5 | Manifolds 𝓜_lower / 𝓜_upper, 4D Hurwitz completeness, Ghost map | `Lemmas04To05_Manifolds` |
| III | 6–8 | Dynamics | `Lemmas06To08_Dynamics` |
| IV | 9–15 | Exact arithmetic: 128-bit Gram-TQF, Garner CRT, Niven's bound, recursive Merkle integrity | `Lemmas09To15_Arithmetic` |
| §7 | — | System Propositions (12-engine memory) | `SystemPropositions_Memory` |

## Statements

TODO: transcribe each lemma from the *Fifteen Lemmas Monograph*, with its exact hypotheses. Use one subsection per lemma, numbered to match the monograph.

## Formalization status

| Item | Lean |
| :--- | :--- |
| CRT modulus, pairwise coprimality, Garner constants | checked (`Lemmas09To15_Arithmetic`) |
| Everything else | to formalize |
