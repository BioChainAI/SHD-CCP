# Stage 2: Validation Matrix

The automated testing arena. `validation_bot.py` moves each ready kernel into `kernels/` and runs every check on it.

- **Pass:** the kernel stays in `kernels/`, tagged **`[COMPUTED]`**. The check results and metrics are written into its `Validation` block, ready for `certification_bot.py`.
- **Fail:** the kernel moves to `04_Deprecated_Archive/failed_wobble_states/`, tagged `[FAILED]`, with a post-mortem file next to it.

## Checks

| Check | Status | Pass criterion |
| :--- | :--- | :--- |
| `layout_integrity` | implemented | Fields cover bits 0–63 exactly once, each width matches its type, and the header sits at 60–63 |
| `glass_box_round_trip` | implemented | Forward and inverse cancel: `unpack(pack(v)) == v` for 1,000 seeded random field values, the header decodes to the kernel's Form ID, and each field touches only its own bits |
| [`01_tqf_parity_checks`](01_tqf_parity_checks/) | **pending definition** | Triple Quad Formula equilibrium |
| [`02_toda_kogame_stress`](02_toda_kogame_stress/) | **pending definition** | Orthogonal compression limits |
| [`03_merkle_collision`](03_merkle_collision/) | **pending definition** | South Halo / ECC hash collision resistance |

A pending suite neither passes nor fails a kernel, but it blocks certification. To bring a suite online:

1. Write its pass criterion in the suite folder's README.
2. Implement it as a function in `Agent_Tooling/suites.py`, add it to `CHECKS`, and remove it from `PENDING_SUITES`.
3. Add test vectors for it in the suite folder.

## Metrics recorded

`fields`, `payload_bits` (data bits that are not header, ECC or reserved), `ecc_residual_bits`, `reserved_bits`, `header_bits`, `payload_efficiency` (payload_bits / 64).
