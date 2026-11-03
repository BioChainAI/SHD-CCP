# SHD-CCP Kernel Ontology

The registry of SHD-CCP 64-bit kernel layouts. Each layout says what every bit of an Einstein Tile means for one Form ID. Kernels are treated as pseudo-FPGA bitstreams: before a layout joins the Universal Standard, it must be proposed, tested and then mathematically proven, in that order. Bots move a kernel through each stage, and every promotion records its evidence in the kernel file itself.

```text
01_Incubator_Experimental ──validation_bot──► 02_Validation_Matrix ──certification_bot──► 03_Certified_Standard
   [OPEN] [HEURISTIC]                │           [COMPUTED]                                    [PROVEN]
                                     │ fail                                                       │ superseded
                                     ▼                                                            ▼
                    04_Deprecated_Archive/failed_wobble_states            04_Deprecated_Archive/legacy_versions
                         [FAILED] + post-mortem                                   [SUPERSEDED]
```

| Folder | Stage | Contents |
| :--- | :--- | :--- |
| [`00_Ontology_Core/`](00_Ontology_Core/) | — | Tile bounds, epistemic tags and universal constants. Every other file is checked against these. |
| [`01_Incubator_Experimental/`](01_Incubator_Experimental/) | 1 | Draft kernels proposed by agents |
| [`02_Validation_Matrix/`](02_Validation_Matrix/) | 2 | Kernels under test, and the test suites |
| [`03_Certified_Standard/`](03_Certified_Standard/) | 3 | Production kernels, grouped by Ontological Domain |
| [`04_Deprecated_Archive/`](04_Deprecated_Archive/) | 4 | Failed and superseded kernels, kept as training data |
| [`Agent_Tooling/`](Agent_Tooling/) | — | The bots and the linter |

## Quick start

```sh
pip install -r Agent_Tooling/requirements.txt
python Agent_Tooling/ontology_linter.py              # check everything against 00_Ontology_Core
python Agent_Tooling/validation_bot.py               # Stage 1 -> 2
python Agent_Tooling/certification_bot.py certify    # Stage 2 -> 3
pytest Agent_Tooling/tests                           # end-to-end pipeline tests
```

## Kernel file format

Kernel files are JSON (YAML is also accepted) and are named `kernel_0x<F>_<snake_case>.json`:

```json
{
  "Kernel_Name": "Holographic Triplet Concept Vector",
  "Form_ID": "0x8",
  "Domain": "Codex_Semantics",
  "Status": "[HEURISTIC]",
  "Dependencies": ["Lemma_6", "Lemma_8"],
  "Bit_Allocation": {
    "00_15": { "name": "Q1_Signifier",      "type": "uint16",         "geometry": "Base Coordinate Frame" },
    "16_31": { "name": "Q2_Signified",      "type": "uint16",         "geometry": "Target Manifold Surface" },
    "32_47": { "name": "Q3_Context",        "type": "uint16",         "geometry": "Torsional Transform Vector" },
    "48_59": { "name": "ECC_Metric_Tensor", "type": "residual_array", "geometry": "Orthogonal Offload Squeeze" },
    "60_63": { "name": "Form_ID_Header",    "type": "multiplexer",    "geometry": "Shape Pointer" }
  }
}
```

- `Bit_Allocation` keys are `SS_EE`: the inclusive start and end bit, with bit 0 as the least significant. The fields must cover bits 0–63 exactly once.
- Bits 60–63 are always the `Form_ID_Header`, so a decoder can read the Form ID before it knows the layout.
- Each type has a fixed width (`uint16` = 16 bits). `residual_array` and `reserved` can be any width. `unallocated` may appear only in `[OPEN]` drafts.
- Optional keys: `Description`; `Proofs` (a lemma → Lean theorem map, needed for certification); and `Validation`, `Certification`, `Locked`, `Postmortem`, `Supersedes`, `Superseded_By`, all written by the bots.

The full schema is in [`00_Ontology_Core/base_64bit_tile.json`](00_Ontology_Core/base_64bit_tile.json).

## What [PROVEN] requires

`certification_bot.py` promotes a kernel only when:

1. it is `[COMPUTED]`, and its recorded validation results reproduce when re-run;
2. no Validation Matrix suite is pending;
3. every lemma in `Dependencies` cites, in `Proofs`, a theorem that exists in [`geometric-engine-spec/formal/lean4`](../Geometric_Engine/ecosystem/SHD-CCP/geometric-engine-spec/formal/lean4), and that project contains no `sorry`. CI also runs `lake build` on it.

It then locks the layout by storing the SHA-256 of `Bit_Allocation`. The linter rejects any later edit to that layout.

## Current state

| | |
| :--- | :--- |
| Certified kernels | **0**. Nothing can be certified yet, because the three domain suites are still pending and the 15 Lemmas are not yet formalized in Lean. |
| Under validation | `kernel_0x8_holographic_triplet_concept_vector`: `[COMPUTED]` |
| Incubator | 7 `[OPEN]` stubs for the kernels named in the architecture: 0x0, 0x1, 0x3, 0x4, 0x6, 0x8 geodesic icosahedron, 0xC |

## Open decision: Form ID position

This registry puts the Form ID header at **bits 60–63**, as the kernel architecture specifies. The draft [RFC 01](../Geometric_Engine/ecosystem/SHD-CCP/geometric-engine-spec/rfcs/01_einstein_tile_64bit.md) and the golden vectors, taken from the Geometric Engine tutorial, put it at **bits 36–39**, with the South Halo at 56–63. Those placements overlap the header. One convention has to win, and then the other side must be updated. The header position is a single setting, `header.bits` in `base_64bit_tile.json`.
