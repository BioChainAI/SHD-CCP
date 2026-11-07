"""export_golden_vectors.py --check: stale, missing and unknown files all fail."""

import pathlib
import subprocess
import sys

import pytest

EXPORTER = pathlib.Path(__file__).resolve().parents[1] / "verification" / "export_golden_vectors.py"


def run(*args):
    return subprocess.run([sys.executable, "-B", "-I", str(EXPORTER), *map(str, args)], capture_output=True, text=True)


@pytest.fixture
def out(tmp_path):
    d = tmp_path / "test_vectors"
    assert run("--out", d).returncode == 0
    (d / "README.md").write_text("hand-written\n")
    (d / "schema.json").write_text("{}\n")
    return d


def test_fresh_export_passes(out):
    result = run("--check", "--out", out)
    assert result.returncode == 0, result.stdout
    assert "golden vectors up to date" in result.stdout


def test_changed_vector_fails(out):
    path = out / "garner_crt_881_883_887.json"
    path.write_text(path.read_text().replace('"n": 0,', '"n": 1,', 1))
    result = run("--check", "--out", out)
    assert result.returncode == 1
    assert "garner_crt_881_883_887.json" in result.stdout


def test_missing_vector_fails(out):
    (out / "gram_tqf_collinearity.bin").unlink()
    result = run("--check", "--out", out)
    assert result.returncode == 1
    assert "gram_tqf_collinearity.bin" in result.stdout


@pytest.mark.parametrize("name", ["foreign_suite.json", "foreign_suite.bin", "notes.txt"])
def test_unknown_file_fails(out, name):
    (out / name).write_text("{}\n")
    result = run("--check", "--out", out)
    assert result.returncode == 1
    assert name in result.stdout
    assert "does not write" in result.stdout
