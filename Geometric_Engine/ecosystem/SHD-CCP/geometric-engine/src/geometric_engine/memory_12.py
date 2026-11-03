"""12-Engine cuboctahedral parity memory and 64-stream balancer (RFC 04).

Recovery invariant: H1 * H2 * H3 * H4 = 1, so a single erased engine is
H4 = (H1 * H2 * H3)^-1; the 13th engine handles cascade recovery.
"""

ENGINE_COUNT = 12
STREAM_COUNT = 64


def recover_single_erasure(shell, erased_index):
    raise NotImplementedError("12-engine recovery: pending RFC 04 normative text")
