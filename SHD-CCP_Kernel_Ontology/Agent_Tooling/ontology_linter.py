#!/usr/bin/env python3
"""Check that 00_Ontology_Core is self-consistent and every kernel file conforms to it.

    python Agent_Tooling/ontology_linter.py

Exits non-zero on any problem. CI runs this on every change to the registry.
"""

import sys

import ontology as ont


def main() -> int:
    base, tags = ont.load_base(), ont.load_tags()
    problems = ont.lint_core()
    files = list(ont.kernel_files())
    for path in files:
        problems += ont.lint_kernel(path, base, tags)
    for p in problems:
        print(p)
    print(f"{len(files)} kernel files, {len(problems)} problems")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
