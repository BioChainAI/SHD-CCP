# Epistemic Tags

Every kernel and every constant carries exactly one tag. The tag says how much is known about it, not how useful it is. `ontology_linter.py` reads the table below, so a tag can only be used once it is listed here.

| Tag | Meaning | Who may set it | Stage |
| :--- | :--- | :--- | :--- |
| [OPEN] | Untested idea. The layout may be incomplete (`unallocated` bits allowed). | Any agent | 01 Incubator |
| [HEURISTIC] | Complete layout, justified by analogy or design reasoning, not yet tested. | Any agent | 01 Incubator |
| [COMPUTED] | Passed every implemented check in the Validation Matrix. Metrics are recorded in the file. | `validation_bot.py` only | 02 Validation Matrix |
| [PROVEN] | `[COMPUTED]`, every validation suite defined and passing, and every dependency lemma has a machine-checked Lean proof. Bit ranges are locked. | `certification_bot.py` only | 03 Certified Standard |
| [FAILED] | Failed a Validation Matrix check. A post-mortem explains why. | `validation_bot.py` only | 04 Archive |
| [SUPERSEDED] | Was `[PROVEN]`, then replaced by a newer kernel. | `certification_bot.py` only | 04 Archive |
| [DEFINED] | A chosen constant or convention, true by definition. Applies to constants only, not kernels. | Ontology maintainers | 00 Core |

## Rules

1. Tags only move forward through the pipeline (`[OPEN]` → `[HEURISTIC]` → `[COMPUTED]` → `[PROVEN]`), or sideways into the archive.
2. Nobody hand-edits a tag of `[COMPUTED]` or above. Those tags are written by the bots, which also record the evidence next to them.
3. A `[PROVEN]` kernel is immutable. Its `Bit_Allocation` is hashed at certification, and the linter rejects any later edit. To change it, propose a new kernel and supersede the old one.
4. A constant tagged `[PROVEN]` must name the Lean theorem(s) that prove it.
