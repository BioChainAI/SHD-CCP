# Stage 1: Incubator (Experimental)

Agents propose new kernel layouts here. Any idea for using the 64 bits starts as a file in this folder.

## Submission rules

1. File one kernel per file, named `kernel_0x<F>_<snake_case>.json`, in the folder for its domain:

   | Folder | Domain | Forms |
   | :--- | :--- | :--- |
   | `proposed_telemetry/` | Telemetry_Signals | 0–3 |
   | `proposed_pointers/` | Geometric_Pointers | 4–7 |
   | `proposed_codex/` | Codex_Semantics | 8–11 |
   | `proposed_memory/` | Memory_Offload | 12–15 |

2. Set `Status` to one of:
   - **`[OPEN]`**: an untested idea. Bits may still be `unallocated`. The validation bot leaves these alone.
   - **`[HEURISTIC]`**: a complete layout, justified by analogy or design reasoning. The validation bot picks these up.
3. Allocate all 64 bits, with bits 60–63 as the `Form_ID_Header` multiplexer.
4. List the lemmas the layout relies on in `Dependencies`. Certification will later require a Lean proof for each one.
5. `ontology_linter.py` must pass before you open a pull request.

Several kernels may share a Form ID while they are in the Incubator. The Certified Standard admits only one `[PROVEN]` kernel per file name.
