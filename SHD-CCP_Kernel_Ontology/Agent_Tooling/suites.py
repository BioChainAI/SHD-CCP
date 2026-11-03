"""Validation Matrix checks.

Implemented checks run on every kernel. Domain suites whose pass criterion is
not yet written down are registered as pending: they never pass or fail a
kernel, but a pending suite blocks certification to [PROVEN].
"""

import random

from ontology import fields, form_id, lint_allocation, pack, unpack

ROUND_TRIP_TRIALS = 1000
SEED = 0x5EED_6400


def layout_integrity(kernel: dict, base: dict) -> dict:
    """Fields tile all 64 bits exactly once, widths match types, header in place."""
    problems = lint_allocation(kernel["Kernel_Name"], kernel, base)
    if problems:
        return {"result": "fail", "details": "; ".join(problems)}
    return {"result": "pass", "details": f"{len(fields(kernel))} fields tile bits 0..{base['word_bits'] - 1} exactly once"}


def glass_box_round_trip(kernel: dict, base: dict) -> dict:
    """Forward (pack) then inverse (unpack) must cancel exactly, with no crosstalk between fields."""
    flds = fields(kernel)
    rng = random.Random(SEED)
    hs, he = base["header"]["bits"]
    header_key = f"{hs:02d}_{he:02d}"
    form = form_id(kernel)

    for trial in range(ROUND_TRIP_TRIALS):
        values = {f.key: rng.getrandbits(f.width) for f in flds}
        values[header_key] = form
        word = pack(flds, values)
        if not 0 <= word < 1 << base["word_bits"]:
            return {"result": "fail", "details": f"trial {trial}: packed word exceeds {base['word_bits']} bits"}
        if unpack(flds, word) != values:
            return {"result": "fail", "details": f"trial {trial}: unpack(pack(v)) != v for word 0x{word:016x}"}
        if (word >> hs) & 0xF != form:
            return {"result": "fail", "details": f"trial {trial}: header does not decode to Form {kernel['Form_ID']}"}

    for f in flds:
        word = pack(flds, {g.key: (1 << g.width) - 1 if g is f else 0 for g in flds})
        if word != f.mask:
            return {"result": "fail", "details": f"field {f.key} leaks outside its own bits"}
    return {"result": "pass", "details": f"{ROUND_TRIP_TRIALS} random round trips and {len(flds)} isolation checks"}


def metrics(kernel: dict, base: dict) -> dict:
    flds = fields(kernel)

    def bits(pred) -> int:
        return sum(f.width for f in flds if pred(f))

    overhead = {"multiplexer", "residual_array", "reserved"}
    return {
        "fields": len(flds),
        "payload_bits": bits(lambda f: f.type not in overhead),
        "ecc_residual_bits": bits(lambda f: f.type == "residual_array"),
        "reserved_bits": bits(lambda f: f.type == "reserved"),
        "header_bits": bits(lambda f: f.type == "multiplexer"),
        "payload_efficiency": round(bits(lambda f: f.type not in overhead) / base["word_bits"], 4),
    }


# Implemented checks: name -> function(kernel, base) -> {"result": "pass"|"fail", "details": str}
CHECKS = {
    "layout_integrity": layout_integrity,
    "glass_box_round_trip": glass_box_round_trip,
}

# Domain suites that live in 02_Validation_Matrix/<folder>/. Each folder's README
# states what the suite must establish; add a function to CHECKS (and remove the
# entry here) once its pass criterion is specified.
PENDING_SUITES = {
    "01_tqf_parity_checks": "Triple Quad Formula equilibrium",
    "02_toda_kogame_stress": "Orthogonal compression limits",
    "03_merkle_collision": "South Halo / ECC hash collision resistance",
}


def run_all(kernel: dict, base: dict) -> dict:
    checks = {"layout_integrity": layout_integrity(kernel, base)}
    sound = checks["layout_integrity"]["result"] == "pass"
    for name, fn in CHECKS.items():
        if name not in checks:
            checks[name] = fn(kernel, base) if sound else {"result": "fail", "details": "not run: layout is unsound"}
    return {
        "checks": checks,
        "pending_suites": sorted(PENDING_SUITES),
        "metrics": metrics(kernel, base) if sound else {},
        "passed": all(c["result"] == "pass" for c in checks.values()),
    }

