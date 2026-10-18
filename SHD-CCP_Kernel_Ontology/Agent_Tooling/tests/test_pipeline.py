"""End-to-end tests: run the real bots as subprocesses on a scratch copy of the registry."""

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

REGISTRY = Path(__file__).resolve().parents[2]
REAL_LEAN = (REGISTRY.parent / "Geometric_Engine" / "ecosystem" / "SHD-CCP"
             / "geometric-engine-spec" / "formal" / "lean4")
TRIPLET = "kernel_0x8_holographic_triplet_concept_vector.json"


@pytest.fixture
def reg(tmp_path, monkeypatch):
    root = tmp_path / "registry"
    shutil.copytree(REGISTRY, root, ignore=shutil.ignore_patterns("__pycache__", ".pytest_cache"))
    # Start every test from a fresh proposal, wherever the real triplet is in the pipeline now.
    incubator = root / "01_Incubator_Experimental" / "proposed_codex" / TRIPLET
    for found in list(root.rglob(TRIPLET)):
        k = kernel(found)
        for key in ("Validation", "Certification", "Locked", "Postmortem", "Supersedes", "Superseded_By"):
            k.pop(key, None)
        k["Status"] = "[HEURISTIC]"
        found.unlink()
        incubator.write_text(json.dumps(k, indent=2) + "\n")
    # The real spec proofs (cited by universal_constants.yaml) plus test lemmas.
    lean = tmp_path / "lean"
    shutil.copytree(REAL_LEAN, lean, ignore=shutil.ignore_patterns(".lake"))
    (lean / "Spec").mkdir()
    (lean / "Spec" / "Lemmas.lean").write_text(
        "namespace Spec.Dynamics\n"
        "theorem lemma6_holds : 1 = 1 := rfl\n"
        "theorem lemma8_holds : 2 = 2 := rfl\n"
        "end Spec.Dynamics\n")
    monkeypatch.setenv("GE_LEAN_DIR", str(lean))
    return root


def run(reg, tool, *args, check=True):
    p = subprocess.run([sys.executable, str(reg / "Agent_Tooling" / tool), *map(str, args)],
                       capture_output=True, text=True, cwd=reg)
    if check and p.returncode != 0:
        raise AssertionError(p.stdout + p.stderr)
    return p


def kernel(path):
    return json.loads(path.read_text())


def lint_ok(reg):
    p = run(reg, "ontology_linter.py", check=False)
    assert p.returncode == 0, p.stdout
    return p.stdout


def no_pending_suites(reg):
    s = reg / "Agent_Tooling" / "suites.py"
    text = s.read_text()
    start = text.index("PENDING_SUITES = {")
    end = text.index("}", start) + 1
    s.write_text(text[:start] + "PENDING_SUITES = {}" + text[end:])


def cite_proofs(path):
    k = kernel(path)
    k["Proofs"] = {"Lemma_6": "Spec.Dynamics.lemma6_holds", "Lemma_8": "Spec.Dynamics.lemma8_holds"}
    path.write_text(json.dumps(k, indent=2) + "\n")


def test_repository_lints_clean():
    p = subprocess.run([sys.executable, str(REGISTRY / "Agent_Tooling" / "ontology_linter.py")],
                       capture_output=True, text=True)
    assert p.returncode == 0, p.stdout


def test_validation_promotes_complete_kernel_and_skips_open_drafts(reg):
    out = run(reg, "validation_bot.py").stdout
    assert f"{TRIPLET}: [COMPUTED]" in out
    assert "unallocated bits" in out

    k = kernel(reg / "02_Validation_Matrix" / "kernels" / TRIPLET)
    assert k["Status"] == "[COMPUTED]"
    assert k["Validation"]["previous_status"] == "[HEURISTIC]"
    assert {c["result"] for c in k["Validation"]["checks"].values()} == {"pass"}
    assert k["Validation"]["metrics"] == {
        "fields": 5, "payload_bits": 48, "ecc_residual_bits": 12,
        "reserved_bits": 0, "header_bits": 4, "payload_efficiency": 0.75,
    }
    assert (reg / "01_Incubator_Experimental" / "proposed_memory" / "kernel_0xC_12_engine_parity.json").exists()
    lint_ok(reg)


def test_broken_layout_is_archived_with_postmortem(reg):
    bad = reg / "01_Incubator_Experimental" / "proposed_codex" / "kernel_0x9_overlapping_triplet.json"
    k = kernel(reg / "01_Incubator_Experimental" / "proposed_codex" / TRIPLET)
    k.update(Kernel_Name="Overlapping Triplet", Form_ID="0x9")
    k["Bit_Allocation"]["10_25"] = k["Bit_Allocation"].pop("16_31")
    bad.write_text(json.dumps(k, indent=2) + "\n")

    out = run(reg, "validation_bot.py", bad).stdout
    assert "[FAILED]" in out
    archived = reg / "04_Deprecated_Archive" / "failed_wobble_states" / bad.name
    assert kernel(archived)["Status"] == "[FAILED]"
    pm = (archived.parent / "kernel_0x9_overlapping_triplet.postmortem.md").read_text()
    assert "overlaps another field" in pm
    lint_ok(reg)


def test_format_errors_are_skipped_not_failed(reg):
    path = reg / "01_Incubator_Experimental" / "proposed_codex" / TRIPLET
    k = kernel(path)
    k["Domain"] = "Memory_Offload"
    path.write_text(json.dumps(k, indent=2) + "\n")
    out = run(reg, "validation_bot.py", path).stdout
    assert "skip (lint)" in out and path.exists()


def test_certification_refused_while_suites_pending_and_proofs_missing(reg):
    run(reg, "validation_bot.py")
    out = run(reg, "certification_bot.py", "certify").stdout
    assert "refused" in out
    assert "suites still pending" in out
    assert "Lemma_6: no proof cited" in out
    assert (reg / "02_Validation_Matrix" / "kernels" / TRIPLET).exists()


def test_certification_refused_on_missing_theorem_or_sorry(reg, tmp_path):
    no_pending_suites(reg)
    run(reg, "validation_bot.py")
    path = reg / "02_Validation_Matrix" / "kernels" / TRIPLET
    cite_proofs(path)
    k = kernel(path)
    k["Proofs"]["Lemma_8"] = "Spec.Dynamics.no_such_theorem"
    path.write_text(json.dumps(k, indent=2) + "\n")
    assert "not found in the Lean project" in run(reg, "certification_bot.py", "certify").stdout

    cite_proofs(path)
    (tmp_path / "lean" / "Spec" / "Todo.lean").write_text("theorem todo : 1 = 2 := sorry\n")
    assert "contains `sorry`" in run(reg, "certification_bot.py", "certify").stdout


def test_full_pipeline_certify_lock_and_supersede(reg):
    no_pending_suites(reg)
    run(reg, "validation_bot.py")
    computed = reg / "02_Validation_Matrix" / "kernels" / TRIPLET
    cite_proofs(computed)

    assert "[PROVEN]" in run(reg, "certification_bot.py", "certify").stdout
    proven = reg / "03_Certified_Standard" / "Domain_2_Codex_Semantics" / TRIPLET
    k = kernel(proven)
    assert k["Status"] == "[PROVEN]" and k["Locked"] is True
    assert k["Certification"]["proofs_verified"]["Lemma_6"] == "Spec.Dynamics.lemma6_holds"
    lint_ok(reg)

    # Editing a locked layout is caught by the linter.
    original = proven.read_text()
    k["Bit_Allocation"]["00_15"]["type"] = "int16"
    proven.write_text(json.dumps(k, indent=2) + "\n")
    assert "lock hash mismatch" in run(reg, "ontology_linter.py", check=False).stdout
    proven.write_text(original)

    # A v2 kernel goes through the same pipeline, then supersedes v1.
    v2_name = "kernel_0x8_holographic_triplet_concept_vector_v2.json"
    v2 = reg / "01_Incubator_Experimental" / "proposed_codex" / v2_name
    k2 = json.loads(original)
    for key in ("Validation", "Certification", "Locked"):
        k2.pop(key)
    k2.update(Kernel_Name="Holographic Triplet Concept Vector v2", Status="[HEURISTIC]")
    k2["Bit_Allocation"]["48_59"]["geometry"] = "Orthogonal Offload Squeeze (v2)"
    v2.write_text(json.dumps(k2, indent=2) + "\n")
    run(reg, "validation_bot.py", v2)
    run(reg, "certification_bot.py", "certify")
    new = reg / "03_Certified_Standard" / "Domain_2_Codex_Semantics" / v2_name

    assert "[SUPERSEDED]" in run(reg, "certification_bot.py", "supersede", proven, "--by", new).stdout
    legacy = reg / "04_Deprecated_Archive" / "legacy_versions" / TRIPLET
    assert kernel(legacy)["Superseded_By"] == v2_name
    assert kernel(new)["Supersedes"] == TRIPLET
    lint_ok(reg)


def test_core_lint_rejects_constant_citing_missing_theorem(reg):
    c = reg / "00_Ontology_Core" / "universal_constants.yaml"
    c.write_text(c.read_text() + '\nBogus:\n  value: 1\n  unit: x\n  tag: "[PROVEN]"\n  source: test\n'
                 '  proofs: [Spec.Nope]\n')
    assert "cites missing Lean theorem Spec.Nope" in run(reg, "ontology_linter.py", check=False).stdout
