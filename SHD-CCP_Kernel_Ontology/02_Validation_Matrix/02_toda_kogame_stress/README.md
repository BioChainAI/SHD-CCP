# Suite: Toda–Kogame Stress

**Status: pending definition.** This suite blocks certification until it is implemented.

## Purpose

Agents test orthogonal compression limits: how much of the orthogonal residual stream the kernel's ECC / residual bits can hold before the information is lost.

## Pass criterion

TODO: state the exact, machine-checkable condition a kernel must satisfy. It must be a deterministic integer computation, not a tolerance on floating-point values, so that every binding reproduces it bit for bit.

## To implement

- [ ] Write the criterion above, and cite the lemma or RFC it comes from
- [ ] Add `toda_kogame_stress` to `CHECKS` in `Agent_Tooling/suites.py` and remove it from `PENDING_SUITES`
- [ ] Add passing and failing example kernels under `cases/` and a test for each
