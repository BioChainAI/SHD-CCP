#!/usr/bin/env python3
"""Check that a conformance runner discovers the suites in test_vectors/ (CONFORMANCE.md).

    check_suite_discovery.py [--spec DIR] -- <runner command...>

Copies the spec's test_vectors/ twice into a temporary directory and adds one suite that no
runner handles, `zz_probe_unhandled`: once as `normative`, once as `draft`. The runner command
is run against each copy with GE_SPEC_DIR pointing at it. It must fail and name the suite for
the normative copy, and pass for the draft copy. The spec defaults to $GE_SPEC_DIR.
"""

import argparse
import json
import os
import pathlib
import shutil
import struct
import subprocess
import sys
import tempfile

PROBE = "zz_probe_unhandled"


def make_spec(src: pathlib.Path, dest: pathlib.Path, status: str) -> pathlib.Path:
    vectors = dest / "test_vectors"
    shutil.copytree(src / "test_vectors", vectors)
    doc = {
        "suite": PROBE,
        "spec_version": "0.1.0",
        "rfc": "99",
        "status": status,
        "description": "Discovery probe: a suite that no runner handles.",
        "generator": "Geometric_Engine/ecosystem/scripts/check_suite_discovery.py",
        "binary": {"file": f"{PROBE}.bin", "fields": ["value"]},
        "cases": [{"value": 1}],
    }
    (vectors / f"{PROBE}.json").write_text(json.dumps(doc, indent=2) + "\n")
    (vectors / f"{PROBE}.bin").write_bytes(b"SHDGEV01" + struct.pack("<IIQ", 1, 1, 1))
    return dest


def run(cmd, spec: pathlib.Path):
    env = dict(os.environ, GE_SPEC_DIR=str(spec))
    result = subprocess.run(cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return result.returncode, result.stdout


def main() -> int:
    ap = argparse.ArgumentParser(usage="%(prog)s [--spec DIR] -- <runner command...>")
    ap.add_argument("--spec", type=pathlib.Path, default=os.environ.get("GE_SPEC_DIR"))
    ap.add_argument("cmd", nargs=argparse.REMAINDER)
    args = ap.parse_args()
    cmd = args.cmd[1:] if args.cmd[:1] == ["--"] else args.cmd
    if not cmd or args.spec is None:
        ap.error("give the spec (--spec or $GE_SPEC_DIR) and a runner command after --")

    problems = []
    with tempfile.TemporaryDirectory() as tmp:
        for status, should_pass in (("normative", False), ("draft", True)):
            spec = make_spec(args.spec, pathlib.Path(tmp) / status, status)
            code, out = run(cmd, spec)
            print(f"── {status} {PROBE}: exit {code}")
            print(out.rstrip()[-4000:])
            if should_pass and code != 0:
                problems.append(f"the runner failed on a {status} suite without a handler (it should skip it)")
            if not should_pass and (code == 0 or PROBE not in out):
                problems.append(f"the runner did not fail, naming {PROBE}, on a {status} suite without a handler")
    for p in problems:
        print("FAIL:", p)
    if not problems:
        print("suite discovery ok: a normative suite without a handler fails, a draft one is skipped")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
