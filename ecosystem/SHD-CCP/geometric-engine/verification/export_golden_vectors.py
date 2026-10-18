#!/usr/bin/env python3
"""Generate geometric-engine-spec/test_vectors/*.json and *.bin.

    python verification/export_golden_vectors.py [--out DIR] [--check]

--check regenerates into memory/a temp dir and fails if the committed vectors
differ, so the spec can never drift from the reference implementation.
"""

import argparse
import filecmp
import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from geometric_engine import vectors  # noqa: E402

DEFAULT_OUT = pathlib.Path(__file__).resolve().parents[2] / "geometric-engine-spec" / "test_vectors"


def export(out: pathlib.Path) -> list[str]:
    out.mkdir(parents=True, exist_ok=True)
    written = []
    for name, doc, records in vectors.all_suites():
        (out / f"{name}.json").write_text(vectors.dumps(doc))
        written.append(f"{name}.json")
        if records is not None:
            vectors.write_bin(out / f"{name}.bin", records, len(doc["binary"]["fields"]))
            written.append(f"{name}.bin")
    return written


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=pathlib.Path, default=DEFAULT_OUT)
    ap.add_argument("--check", action="store_true", help="verify committed vectors are up to date")
    args = ap.parse_args()

    if not args.check:
        for f in export(args.out):
            print(f"wrote {args.out / f}")
        return 0

    with tempfile.TemporaryDirectory() as tmp:
        stale = [f for f in export(pathlib.Path(tmp))
                 if not (args.out / f).exists() or not filecmp.cmp(pathlib.Path(tmp) / f, args.out / f, shallow=False)]
    if stale:
        print("stale golden vectors (re-run export_golden_vectors.py):", *stale, sep="\n  ")
        return 1
    print("golden vectors up to date")
    return 0


if __name__ == "__main__":
    sys.exit(main())
