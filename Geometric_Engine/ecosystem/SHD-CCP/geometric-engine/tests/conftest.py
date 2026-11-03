import os
import pathlib
import sys

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))


def _spec_vectors_dir():
    candidates = [os.environ.get("GE_SPEC_DIR"), ROOT / "spec", ROOT.parent / "geometric-engine-spec"]
    for c in candidates:
        if c and (pathlib.Path(c) / "test_vectors").is_dir():
            return pathlib.Path(c) / "test_vectors"
    return None


@pytest.fixture(scope="session")
def vectors_dir():
    d = _spec_vectors_dir()
    if d is None:
        pytest.skip("geometric-engine-spec not found (set GE_SPEC_DIR or add the spec submodule at ./spec)")
    return d
