# Suite: TQF Parity Checks

**Status: pending definition.** This suite blocks certification until it is implemented.

## Purpose

Agents test Triple Quad Formula equilibrium. The kernel's quadrance-bearing fields must be able to represent a balanced (Gram-TQF) configuration without parity wobble. The exact Gram-TQF itself is already specified in RFC 02 §3.

## Pass criterion

TODO: state the exact, machine-checkable condition a kernel must satisfy. It must be a deterministic integer computation, not a tolerance on floating-point values, so that every binding reproduces it bit for bit.

## To implement

- [ ] Write the criterion above, and cite the lemma or RFC it comes from
- [ ] Add `tqf_parity` to `CHECKS` in `Agent_Tooling/suites.py` and remove it from `PENDING_SUITES`
- [ ] Add passing and failing example kernels under `cases/` and a test for each
