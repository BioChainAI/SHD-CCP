"""Shared model of the SHD-CCP Kernel Registry: loading, bit layouts, linting.

All three bots (validation_bot, certification_bot, ontology_linter) build on
this module so that they agree on exactly one reading of 00_Ontology_Core.
"""

import hashlib
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path

import yaml

REGISTRY = Path(__file__).resolve().parents[1]
CORE = REGISTRY / "00_Ontology_Core"
INCUBATOR = REGISTRY / "01_Incubator_Experimental"
VALIDATION = REGISTRY / "02_Validation_Matrix"
VALIDATION_KERNELS = VALIDATION / "kernels"
CERTIFIED = REGISTRY / "03_Certified_Standard"
ARCHIVE_FAILED = REGISTRY / "04_Deprecated_Archive" / "failed_wobble_states"
ARCHIVE_LEGACY = REGISTRY / "04_Deprecated_Archive" / "legacy_versions"

DEFAULT_LEAN_DIR = (REGISTRY.parent / "Geometric_Engine" / "ecosystem" / "SHD-CCP"
                    / "geometric-engine-spec" / "formal" / "lean4")

KERNEL_FILE_RE = re.compile(r"^kernel_0x([0-9A-F])_[a-z0-9_]+\.(json|ya?ml)$")
ALLOC_KEY_RE = re.compile(r"^(\d{2})_(\d{2})$")
TAG_ROW_RE = re.compile(r"^\|\s*(\[[A-Z]+\])\s*\|", re.M)


# ── Ontology Core ─────────────────────────────────────────────────────────────

def load_base(core: Path = CORE) -> dict:
    return json.loads((core / "base_64bit_tile.json").read_text())


def load_tags(core: Path = CORE) -> list[str]:
    return TAG_ROW_RE.findall((core / "epistemic_tags.md").read_text())


def load_constants(core: Path = CORE) -> dict:
    return yaml.safe_load((core / "universal_constants.yaml").read_text())


def lean_dir() -> Path:
    return Path(os.environ.get("GE_LEAN_DIR", DEFAULT_LEAN_DIR))


# ── Kernel files ──────────────────────────────────────────────────────────────

def read_kernel(path: Path) -> dict:
    text = path.read_text()
    return json.loads(text) if path.suffix == ".json" else yaml.safe_load(text)


def write_kernel(path: Path, kernel: dict) -> None:
    if path.suffix == ".json":
        path.write_text(json.dumps(kernel, indent=2, ensure_ascii=False) + "\n")
    else:
        path.write_text(yaml.safe_dump(kernel, sort_keys=False, allow_unicode=True))


def kernel_files(root: Path = REGISTRY):
    for p in sorted(root.rglob("kernel_0x*")):
        if p.suffix in (".json", ".yaml", ".yml"):
            yield p


def stage_of(path: Path, root: Path = REGISTRY) -> str:
    rel = path.relative_to(root).parts
    return "/".join(rel[:2]) if rel[0] == "04_Deprecated_Archive" else rel[0]


def form_id(kernel: dict) -> int:
    return int(str(kernel["Form_ID"]), 16)


def domain_for_form(base: dict, form: int) -> str | None:
    for name, d in base["domains"].items():
        if d["forms"][0] <= form <= d["forms"][1]:
            return name
    return None


def allocation_hash(kernel: dict) -> str:
    canonical = json.dumps(kernel["Bit_Allocation"], sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode()).hexdigest()


@dataclass(frozen=True)
class Field:
    key: str
    name: str
    type: str
    start: int
    end: int

    @property
    def width(self) -> int:
        return self.end - self.start + 1

    @property
    def mask(self) -> int:
        return ((1 << self.width) - 1) << self.start


def fields(kernel: dict) -> list[Field]:
    """Parse Bit_Allocation; raises ValueError on malformed keys."""
    out = []
    for key, spec in kernel["Bit_Allocation"].items():
        m = ALLOC_KEY_RE.match(str(key))
        if not m:
            raise ValueError(f"bad allocation key {key!r} (expected SS_EE)")
        start, end = int(m[1]), int(m[2])
        out.append(Field(str(key), spec.get("name", ""), spec.get("type", ""), start, end))
    return sorted(out, key=lambda f: f.start)


def pack(flds: list[Field], values: dict[str, int]) -> int:
    word = 0
    for f in flds:
        word |= (values[f.key] & ((1 << f.width) - 1)) << f.start
    return word


def unpack(flds: list[Field], word: int) -> dict[str, int]:
    return {f.key: (word >> f.start) & ((1 << f.width) - 1) for f in flds}


# ── Lean proofs ───────────────────────────────────────────────────────────────

def lean_theorems(root: Path) -> set[str]:
    """Fully qualified names of every `theorem` in the Lean project (namespaces resolved)."""
    names = set()
    for src in root.rglob("*.lean"):
        if ".lake" in src.parts:
            continue
        ns: list[str] = []
        for line in src.read_text().splitlines():
            s = line.strip()
            if s.startswith("namespace "):
                ns.extend(s.split()[1].split("."))
            elif s.startswith("end ") and ns:
                for _ in s.split()[1].split("."):
                    ns.pop()
            m = re.match(r"(?:private\s+)?theorem\s+([A-Za-z_][\w.']*)", s)
            if m:
                names.add(".".join(ns + [m[1]]))
    return names


def lean_has_sorry(root: Path) -> bool:
    return any(re.search(r"\bsorry\b", re.sub(r"/-.*?-/|--[^\n]*", "", p.read_text(), flags=re.S))
               for p in root.rglob("*.lean") if ".lake" not in p.parts)


# ── Linting ───────────────────────────────────────────────────────────────────

def lint_kernel(path: Path, base: dict, tags: list[str], root: Path = REGISTRY) -> list[str]:
    """Return a list of problems; empty means the file conforms to 00_Ontology_Core."""
    errs: list[str] = []
    name = path.name
    try:
        k = read_kernel(path)
    except Exception as e:  # noqa: BLE001 - report any parse failure as a lint error
        return [f"{name}: cannot parse: {e}"]
    if not isinstance(k, dict):
        return [f"{name}: top level must be a mapping"]

    allowed = set(base["required_kernel_keys"]) | set(base["optional_kernel_keys"])
    errs += [f"{name}: missing key {key}" for key in base["required_kernel_keys"] if key not in k]
    errs += [f"{name}: unknown key {key}" for key in k if key not in allowed]
    if errs:
        return errs

    m = KERNEL_FILE_RE.match(name)
    if not m:
        errs.append(f"{name}: file name must match kernel_0x<F>_<snake_case>.json")
    if not re.fullmatch(r"0x[0-9A-F]", str(k["Form_ID"])):
        return errs + [f"{name}: Form_ID must be \"0x0\"..\"0xF\", got {k['Form_ID']!r}"]
    form = form_id(k)
    if m and int(m[1], 16) != form:
        errs.append(f"{name}: file name Form 0x{m[1]} disagrees with Form_ID {k['Form_ID']}")

    domain = domain_for_form(base, form)
    if k["Domain"] != domain:
        errs.append(f"{name}: Form {k['Form_ID']} belongs to Domain {domain}, not {k['Domain']}")

    status = k["Status"]
    if status not in tags:
        errs.append(f"{name}: status {status} is not defined in epistemic_tags.md")
    stage = stage_of(path, root)
    if stage in base["stage_statuses"] and status not in base["stage_statuses"][stage]:
        errs.append(f"{name}: status {status} is not allowed in {stage}")
    if stage == "03_Certified_Standard":
        want = base["domains"][domain]["folder"] if domain else None
        if path.parent.name != want:
            errs.append(f"{name}: certified kernel must live in 03_Certified_Standard/{want}")

    deps = k["Dependencies"]
    if not isinstance(deps, list) or any(d not in base["lemmas"] for d in deps):
        errs.append(f"{name}: Dependencies must be a list of {base['lemmas'][0]}..{base['lemmas'][-1]}")

    # A [FAILED] kernel is archived precisely because its layout is broken.
    if status != "[FAILED]":
        errs += lint_allocation(name, k, base)

    if status == "[PROVEN]":
        cert = k.get("Certification") or {}
        if not k.get("Locked"):
            errs.append(f"{name}: [PROVEN] kernel must be Locked")
        if cert.get("locked_bit_ranges_sha256") != allocation_hash(k):
            errs.append(f"{name}: Bit_Allocation changed after certification (lock hash mismatch)")
    return errs


def lint_allocation(name: str, k: dict, base: dict) -> list[str]:
    errs: list[str] = []
    if not isinstance(k["Bit_Allocation"], dict) or not k["Bit_Allocation"]:
        return [f"{name}: Bit_Allocation must be a non-empty mapping"]
    try:
        flds = fields(k)
    except ValueError as e:
        return [f"{name}: {e}"]

    bits = base["word_bits"]
    used = 0
    for f in flds:
        spec = k["Bit_Allocation"][f.key]
        for attr in ("name", "type", "geometry"):
            if not spec.get(attr):
                errs.append(f"{name}: field {f.key} missing {attr}")
        if not 0 <= f.start <= f.end < bits:
            errs.append(f"{name}: field {f.key} outside bits 0..{bits - 1}")
            continue
        if used & f.mask:
            errs.append(f"{name}: field {f.key} overlaps another field")
        used |= f.mask
        t = base["types"].get(f.type)
        if t is None:
            errs.append(f"{name}: field {f.key} has unknown type {f.type!r}")
        elif t["width"] != "any" and t["width"] != f.width:
            errs.append(f"{name}: field {f.key} is {f.width} bits but {f.type} is {t['width']}")
        if t and t.get("draft_only") and k["Status"] != "[OPEN]":
            errs.append(f"{name}: field {f.key} is unallocated; only [OPEN] drafts may leave bits unallocated")
    if used != (1 << bits) - 1:
        gaps = [i for i in range(bits) if not used >> i & 1]
        errs.append(f"{name}: bits not allocated: {gaps}")

    hs, he = base["header"]["bits"]
    header_key = f"{hs:02d}_{he:02d}"
    header = k["Bit_Allocation"].get(header_key)
    if not header or header.get("type") != base["header"]["type"]:
        errs.append(f"{name}: bits {header_key} must be the {base['header']['type']} {base['header']['name']}")
    for f in flds:
        if f.type == "multiplexer" and f.key != header_key:
            errs.append(f"{name}: multiplexer field {f.key} is only allowed at {header_key}")
    return errs


def lint_core(core: Path = CORE) -> list[str]:
    errs: list[str] = []
    base = load_base(core)
    tags = load_tags(core)
    if len(tags) != len(set(tags)):
        errs.append("epistemic_tags.md: duplicate tags")
    for stage, statuses in base["stage_statuses"].items():
        errs += [f"base_64bit_tile.json: stage {stage} uses undefined tag {s}" for s in statuses if s not in tags]
    hs, he = base["header"]["bits"]
    width = base["types"][base["header"]["type"]]["width"]
    if he - hs + 1 != width or 1 << width != base["form_id_range"][1] + 1:
        errs.append("base_64bit_tile.json: header width does not match the Form ID range")
    covered = sorted(f for d in base["domains"].values() for f in range(d["forms"][0], d["forms"][1] + 1))
    if covered != list(range(base["form_id_range"][0], base["form_id_range"][1] + 1)):
        errs.append("base_64bit_tile.json: domains must partition Forms 0..15 exactly once")

    lean = lean_dir()
    theorems = lean_theorems(lean) if lean.is_dir() else None
    for key, c in (load_constants(core) or {}).items():
        if not isinstance(c, dict) or not {"value", "unit", "tag", "source"} <= c.keys():
            errs.append(f"universal_constants.yaml: {key} needs value, unit, tag, source")
            continue
        if c["tag"] not in tags:
            errs.append(f"universal_constants.yaml: {key} uses undefined tag {c['tag']}")
        if c["tag"] == "[PROVEN]":
            if not c.get("proofs"):
                errs.append(f"universal_constants.yaml: [PROVEN] constant {key} must list proofs")
            elif theorems is not None:
                errs += [f"universal_constants.yaml: {key} cites missing Lean theorem {t}"
                         for t in c["proofs"] if t not in theorems]
        if c["value"] is None and c["tag"] != "[OPEN]":
            errs.append(f"universal_constants.yaml: {key} has no value, so it must be [OPEN]")
    return errs
