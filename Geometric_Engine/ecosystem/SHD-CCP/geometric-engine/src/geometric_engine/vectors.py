"""Golden test-vector suites and the SHDGEV01 binary mirror format.

Every suite is generated deterministically (SplitMix64, fixed seeds) so that
re-running the exporter reproduces geometric-engine-spec/test_vectors/
byte-for-byte.

Binary layout (all integers little-endian):

    offset 0   8 bytes   magic  b"SHDGEV01"
    offset 8   u32       fields per record (F)
    offset 12  u32       record count (N)
    offset 16  N * F * u64 records; signed values are two's complement
"""

import json
import struct

from . import SPEC_VERSION, crt_garner, hurwitz, tile_codec

MAGIC = b"SHDGEV01"
U64 = (1 << 64) - 1


class SplitMix64:
    def __init__(self, seed: int):
        self.state = seed & U64

    def next(self) -> int:
        self.state = (self.state + 0x9E3779B97F4A7C15) & U64
        z = self.state
        z = ((z ^ (z >> 30)) * 0xBF58476D1CE4E5B9) & U64
        z = ((z ^ (z >> 27)) * 0x94D049BB133111EB) & U64
        return z ^ (z >> 31)

    def below(self, bound: int) -> int:
        return self.next() % bound

    def signed(self, bits: int) -> int:
        """Uniform in [-2^bits, 2^bits]."""
        return self.below((1 << (bits + 1)) + 1) - (1 << bits)


def write_bin(path, records, fields: int):
    with open(path, "wb") as f:
        f.write(MAGIC + struct.pack("<II", fields, len(records)))
        for rec in records:
            assert len(rec) == fields
            f.write(struct.pack(f"<{fields}Q", *(v & U64 for v in rec)))


def read_bin(path):
    with open(path, "rb") as f:
        data = f.read()
    if data[:8] != MAGIC:
        raise ValueError(f"{path}: bad magic")
    fields, count = struct.unpack_from("<II", data, 8)
    flat = struct.unpack_from(f"<{fields * count}Q", data, 16)
    return [flat[i * fields:(i + 1) * fields] for i in range(count)]


def _envelope(suite, rfc, status, description, fields, cases):
    return {
        "suite": suite,
        "spec_version": SPEC_VERSION,
        "rfc": rfc,
        "status": status,
        "description": description,
        "generator": "SHD-CCP/geometric-engine verification/export_golden_vectors.py",
        "binary": {"file": f"{suite}.bin", "fields": fields} if fields else None,
        "cases": cases,
    }


# ── Suite: Einstein tiles, Forms 0-15 ─────────────────────────────────────────

TILE_FIELDS = ["tile", "form_id", "south_halo", "payload"]


def einstein_tiles():
    rng = SplitMix64(0x5EED_0001)
    tiles = [0, U64]
    for form in range(16):
        body_mask = tile_codec.PAYLOAD_MASK
        tiles.append(tile_codec.pack(form, 0, 0))
        tiles.append(tile_codec.pack(form, 0xFF, body_mask))
        for _ in range(2):
            tiles.append(tile_codec.pack(form, rng.below(256), rng.next() & body_mask))
    cases, records = [], []
    for t in tiles:
        f = tile_codec.unpack(t)
        cases.append({"tile": f"0x{t:016x}", "form_id": f["form_id"],
                      "south_halo": f["south_halo"], "payload": f"0x{f['payload']:016x}"})
        records.append((t, f["form_id"], f["south_halo"], f["payload"]))
    doc = _envelope(
        "einstein_tiles_forms_0_15", "01", "draft",
        "Field extraction for the pinned draft fields (Form ID bits 36-39, South Halo bits 56-63); "
        "all remaining bits are reported as opaque payload.",
        TILE_FIELDS, cases)
    return doc, records


# ── Suite: Garner CRT (881, 883, 887) ─────────────────────────────────────────

CRT_FIELDS = ["n", "r881", "r883", "r887"]


def garner_crt(count: int = 2000):
    rng = SplitMix64(0x5EED_0002)
    m = crt_garner.M
    edges = [0, 1, 880, 881, 882, 883, 886, 887, 777922, 777923, m // 2, m - 2, m - 1]
    ns = edges + [rng.below(m) for _ in range(count - len(edges))]
    cases, records = [], []
    for n in ns:
        r = crt_garner.encode(n)
        assert crt_garner.decode(r) == n
        cases.append({"n": n, "residues": list(r)})
        records.append((n, *r))
    doc = _envelope(
        "garner_crt_881_883_887", "02", "normative",
        "Cubic index round trips over [0, 690017701): encode(n) == residues and decode(residues) == n.",
        CRT_FIELDS, cases)
    return doc, records


# ── Suite: Gram-TQF collinearity ──────────────────────────────────────────────

TQF_FIELDS = ["x1", "y1", "x2", "y2", "x3", "y3", "tqf_lo", "tqf_hi", "collinear"]
COORD_BITS = 20


def _thin_triangle(rng, perturb):
    lim = 1 << COORD_BITS
    while True:
        x1, y1 = rng.signed(COORD_BITS), rng.signed(COORD_BITS)
        dx, dy = rng.signed(10), rng.signed(10)
        if dx == 0 and dy == 0:
            continue
        a, b = rng.below(1 << 10) + 1, rng.below(1 << 10) + 1
        x2, y2 = x1 + a * dx, y1 + a * dy
        x3, y3 = x1 - b * dx, y1 - b * dy
        if perturb:
            x3 += 1 if rng.below(2) else -1
        if all(-lim <= v <= lim for v in (x2, y2, x3, y3)):
            return (x1, y1), (x2, y2), (x3, y3)


def gram_tqf(count: int = 300):
    rng = SplitMix64(0x5EED_0003)
    cases, records = [], []
    for i in range(count):
        kind = ("collinear", "near_collinear", "general")[i % 3]
        if kind == "general":
            p1, p2, p3 = ((rng.signed(COORD_BITS), rng.signed(COORD_BITS)) for _ in range(3))
        else:
            p1, p2, p3 = _thin_triangle(rng, perturb=(kind == "near_collinear"))
        a = hurwitz.gram_tqf(p1, p2, p3)
        assert 0 <= a < (1 << 128)
        collinear = a == 0
        float_collinear = hurwitz.gram_tqf_float64(p1, p2, p3) == 0.0
        cases.append({
            "kind": kind, "p1": list(p1), "p2": list(p2), "p3": list(p3),
            "tqf": str(a), "collinear": collinear,
            "float64_misclassifies": float_collinear != collinear,
        })
        records.append((*p1, *p2, *p3, a & U64, a >> 64, int(collinear)))
    doc = _envelope(
        "gram_tqf_collinearity", "02", "normative",
        "Exact Gram-TQF A = (Q1+Q2+Q3)^2 - 2(Q1^2+Q2^2+Q3^2) for integer points with |coord| <= 2^20; "
        "A is given as a decimal string (binary: unsigned 128-bit split into lo/hi u64).",
        TQF_FIELDS, cases)
    return doc, records


# ── Pending suites (envelope only, no cases yet) ──────────────────────────────

PENDING = {
    "hurwitz_primes_and_s5": ("02", "94 4D Hurwitz prime nodes and S5 reduced words up to depth 8."),
    "memory_erasure_cases": ("04", "Single-erasure and 13th-engine cascade recovery vectors."),
    "handshake_alignment": ("06", "Frame-free quadrance signatures and Horn quaternion vectors."),
}


def all_suites():
    """Yield (suite_name, json_doc, records_or_None)."""
    for gen in (einstein_tiles, garner_crt, gram_tqf):
        doc, records = gen()
        yield doc["suite"], doc, records
    for name, (rfc, desc) in PENDING.items():
        yield name, _envelope(name, rfc, "pending", desc, None, []), None


def dumps(doc) -> str:
    """Indented envelope with one case per line, so diffs stay reviewable."""
    head = {k: v for k, v in doc.items() if k != "cases"}
    lines = json.dumps(head, indent=2)[:-2]
    cases = ",\n".join("    " + json.dumps(c, separators=(", ", ": ")) for c in doc["cases"])
    body = f'[\n{cases}\n  ]' if cases else "[]"
    return f'{lines},\n  "cases": {body}\n}}\n'

