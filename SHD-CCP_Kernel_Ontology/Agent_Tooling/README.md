# Agent Tooling

| Script | Does |
| :--- | :--- |
| `ontology_linter.py` | Checks that `00_Ontology_Core` is self-consistent, and that every kernel file conforms to it: keys, names, Form/Domain match, stage/status match, bit coverage, type widths, header position, lemma names, lock hashes. It also checks that the Lean theorems cited by `[PROVEN]` constants exist. |
| `validation_bot.py [KERNEL…] [--dry-run]` | Moves Stage 1 → 2 and runs the Validation Matrix. Passing kernels become `[COMPUTED]`; failing ones become `[FAILED]` and get a post-mortem. |
| `certification_bot.py certify [KERNEL…] [--dry-run]` | Moves Stage 2 → 3 and becomes `[PROVEN]`, but only if the results reproduce, no suite is pending and every dependency has a Lean proof. Locks the bit ranges. |
| `certification_bot.py supersede OLD --by NEW` | Moves Stage 3 → 4 and marks OLD `[SUPERSEDED]` |
| `ontology.py`, `suites.py` | Shared model and checks, used by the scripts above |

Lean proofs are looked up in `$GE_LEAN_DIR`, or by default in `../Geometric_Engine/ecosystem/SHD-CCP/geometric-engine-spec/formal/lean4`.

The bots move files and rewrite them. They never commit. An agent, or a person, reviews the diff and opens a pull request, and CI re-runs the linter and tests on it.
