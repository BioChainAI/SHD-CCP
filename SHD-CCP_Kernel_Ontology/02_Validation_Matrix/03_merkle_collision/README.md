# Suite: Merkle Collision

**Status: pending definition.** This suite blocks certification until it is implemented.

## Purpose

Security agents test the South Halo and ECC hashes for collisions: distinct payloads must not map to the same halo / ECC signature beyond the stated bound.

## Pass criterion

TODO: state the exact, machine-checkable condition a kernel must satisfy. It must be a deterministic integer computation, not a tolerance on floating-point values, so that every binding reproduces it bit for bit.

## To implement

- [ ] Write the criterion above, and cite the lemma or RFC it comes from
- [ ] Add `merkle_collision` to `CHECKS` in `Agent_Tooling/suites.py` and remove it from `PENDING_SUITES`
- [ ] Add passing and failing example kernels under `cases/` and a test for each
