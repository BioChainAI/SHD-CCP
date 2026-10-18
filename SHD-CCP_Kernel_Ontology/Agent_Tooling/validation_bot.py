#!/usr/bin/env python3
"""Stage 1 -> Stage 2: move ready Incubator kernels into the Validation Matrix and test them.

    python Agent_Tooling/validation_bot.py [KERNEL ...] [--dry-run]

With no arguments it picks up every kernel in 01_Incubator_Experimental that
is ready: no `unallocated` bits and no format errors. Each kernel is moved to
02_Validation_Matrix/kernels/ and run through the Validation Matrix:

  pass -> tagged [COMPUTED], results and metrics written into the file
  fail -> moved to 04_Deprecated_Archive/failed_wobble_states/, tagged [FAILED],
          with a post-mortem next to it
"""

import argparse
import datetime as dt
import shutil
import sys
from pathlib import Path

import ontology as ont
import suites

TOOL = "validation_bot.py 0.1.0"


def is_ready(kernel: dict) -> bool:
    return all(spec.get("type") != "unallocated" for spec in kernel["Bit_Allocation"].values())


def postmortem(path: Path, kernel: dict, report: dict) -> str:
    failed = {n: c for n, c in report["checks"].items() if c["result"] == "fail"}
    lines = [
        f"# Post-mortem: {kernel['Kernel_Name']} (Form {kernel['Form_ID']})",
        "",
        f"- File: `{path.name}`",
        f"- Rejected by: {TOOL} on {report['validated_at']}",
        f"- Previous status: {report['previous_status']}",
        "",
        "## Failed checks",
        "",
    ]
    lines += [f"- **{n}**: {c['details']}" for n, c in failed.items()]
    lines += [
        "",
        "## Why the geometry failed",
        "",
        "TODO (proposing agent): explain which structural assumption broke, "
        "so future proposals avoid it.",
        "",
    ]
    return "\n".join(lines)


def validate(path: Path, base: dict, tags: list[str], dry_run: bool = False) -> str:
    kernel = ont.read_kernel(path)
    if not is_ready(kernel):
        return "skip: [OPEN] draft still has unallocated bits"
    # Format problems (names, keys, tags) are the proposer's to fix: skip.
    # Layout problems (overlaps, gaps, widths) are a failed design: archive it.
    layout = set(ont.lint_allocation(path.name, kernel, base))
    problems = [p for p in ont.lint_kernel(path, base, tags) if p not in layout]
    if problems:
        return "skip (lint): " + "; ".join(problems)

    report = suites.run_all(kernel, base)
    report["validated_at"] = dt.date.today().isoformat()
    report["previous_status"] = kernel["Status"]
    passed = report.pop("passed")
    kernel["Validation"] = {"tool": TOOL, **report}

    if passed:
        kernel["Status"] = "[COMPUTED]"
        dest = ont.VALIDATION_KERNELS / path.name
    else:
        kernel["Status"] = "[FAILED]"
        kernel["Postmortem"] = path.stem + ".postmortem.md"
        dest = ont.ARCHIVE_FAILED / path.name

    if dry_run:
        return f"would move to {dest.relative_to(ont.REGISTRY)} as {kernel['Status']}"
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(path, dest)
    ont.write_kernel(dest, kernel)
    if not passed:
        (dest.parent / kernel["Postmortem"]).write_text(postmortem(dest, kernel, kernel["Validation"]))
    return f"{kernel['Status']} -> {dest.relative_to(ont.REGISTRY)}"


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("kernels", nargs="*", type=Path)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    base, tags = ont.load_base(), ont.load_tags()
    targets = [p.resolve() for p in args.kernels] or list(ont.kernel_files(ont.INCUBATOR))
    for p in targets:
        if ont.INCUBATOR not in p.parents:
            print(f"{p.name}: not in 01_Incubator_Experimental, skipped")
            continue
        print(f"{p.name}: {validate(p, base, tags, args.dry_run)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
