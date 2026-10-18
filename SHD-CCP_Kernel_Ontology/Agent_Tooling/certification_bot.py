#!/usr/bin/env python3
"""Stage 2 -> Stage 3 (certify) and Stage 3 -> Stage 4 (supersede).

    python Agent_Tooling/certification_bot.py certify [KERNEL ...] [--dry-run]
    python Agent_Tooling/certification_bot.py supersede OLD_KERNEL --by NEW_KERNEL

certify promotes a [COMPUTED] kernel to [PROVEN] only if:
  1. its recorded Validation results still reproduce,
  2. no Validation Matrix suite is pending,
  3. every lemma in Dependencies maps (via `Proofs`) to a Lean theorem that
     exists in geometric-engine-spec/formal/lean4, and that project has no
     `sorry`.
It then locks the bit ranges (SHA-256 of Bit_Allocation) and moves the kernel
into its Ontological Domain folder in 03_Certified_Standard.

The Lean project is found at $GE_LEAN_DIR, else at
Geometric_Engine/ecosystem/SHD-CCP/geometric-engine-spec/formal/lean4.
CI runs `lake build` on that project, so a cited theorem that exists here is
one the kernel checks.
"""

import argparse
import datetime as dt
import shutil
import sys
from pathlib import Path

import ontology as ont
import suites

TOOL = "certification_bot.py 0.1.0"


def blockers(kernel: dict, base: dict) -> list[str]:
    out: list[str] = []
    if kernel["Status"] != "[COMPUTED]":
        out.append(f"status is {kernel['Status']}, expected [COMPUTED]")
        return out

    recorded = kernel.get("Validation", {})
    rerun = suites.run_all(kernel, base)
    if not rerun["passed"] or rerun["checks"] != recorded.get("checks"):
        out.append("recorded Validation results do not reproduce; re-run validation_bot.py")
    if rerun["pending_suites"]:
        out.append("Validation Matrix suites still pending: " + ", ".join(rerun["pending_suites"]))

    lean = ont.lean_dir()
    if not lean.is_dir():
        out.append(f"Lean project not found at {lean}")
        return out
    theorems = ont.lean_theorems(lean)
    proofs = kernel.get("Proofs") or {}
    for lemma in kernel["Dependencies"]:
        cited = proofs.get(lemma)
        if not cited:
            out.append(f"{lemma}: no proof cited in Proofs")
        elif cited not in theorems:
            out.append(f"{lemma}: cited theorem {cited} not found in the Lean project")
    if ont.lean_has_sorry(lean):
        out.append("the Lean project contains `sorry`")
    return out


def certify(path: Path, base: dict, tags: list[str], dry_run: bool = False) -> str:
    problems = ont.lint_kernel(path, base, tags)
    if problems:
        return "refused (lint): " + "; ".join(problems)
    kernel = ont.read_kernel(path)
    why = blockers(kernel, base)
    if why:
        return "refused:\n    - " + "\n    - ".join(why)

    kernel["Status"] = "[PROVEN]"
    kernel["Locked"] = True
    kernel["Certification"] = {
        "tool": TOOL,
        "certified_at": dt.date.today().isoformat(),
        "locked_bit_ranges_sha256": ont.allocation_hash(kernel),
        "proofs_verified": {lemma: kernel["Proofs"][lemma] for lemma in kernel["Dependencies"]},
    }
    folder = base["domains"][kernel["Domain"]]["folder"]
    dest = ont.CERTIFIED / folder / path.name
    if dest.exists():
        return f"refused: {dest.relative_to(ont.REGISTRY)} already exists; supersede it first"
    if dry_run:
        return f"would certify into {dest.relative_to(ont.REGISTRY)}"
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(path, dest)
    ont.write_kernel(dest, kernel)
    return f"[PROVEN] -> {dest.relative_to(ont.REGISTRY)}"


def supersede(old: Path, new: Path, base: dict, tags: list[str]) -> str:
    if ont.CERTIFIED not in old.parents or ont.CERTIFIED not in new.parents:
        return "refused: both kernels must be in 03_Certified_Standard"
    old_k, new_k = ont.read_kernel(old), ont.read_kernel(new)
    if old_k["Status"] != "[PROVEN]" or new_k["Status"] != "[PROVEN]":
        return "refused: both kernels must be [PROVEN]"

    old_k["Status"] = "[SUPERSEDED]"
    old_k["Superseded_By"] = new.name
    new_k["Supersedes"] = old.name
    # Supersedes is metadata outside Bit_Allocation, so the new kernel's lock hash still holds.
    dest = ont.ARCHIVE_LEGACY / old.name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(old, dest)
    ont.write_kernel(dest, old_k)
    ont.write_kernel(new, new_k)
    return f"[SUPERSEDED] -> {dest.relative_to(ont.REGISTRY)}"


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("certify")
    c.add_argument("kernels", nargs="*", type=Path)
    c.add_argument("--dry-run", action="store_true")
    s = sub.add_parser("supersede")
    s.add_argument("old", type=Path)
    s.add_argument("--by", type=Path, required=True)
    args = ap.parse_args(argv)

    base, tags = ont.load_base(), ont.load_tags()
    if args.cmd == "supersede":
        print(f"{args.old.name}: {supersede(args.old.resolve(), args.by.resolve(), base, tags)}")
        return 0

    targets = [p.resolve() for p in args.kernels] or list(ont.kernel_files(ont.VALIDATION_KERNELS))
    for p in targets:
        if ont.VALIDATION_KERNELS not in p.parents:
            print(f"{p.name}: not in 02_Validation_Matrix/kernels, skipped")
            continue
        print(f"{p.name}: {certify(p, base, tags, args.dry_run)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
