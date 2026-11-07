"""Run the reference implementation against every suite in the Layer 0 test_vectors/ directory.

The suites are discovered from test_vectors/*.json (see conftest.py and CONFORMANCE.md): a suite
with a handler below runs; a normative suite without a handler fails; a draft suite without a
handler is reported as skipped; a pending suite has no cases and is skipped.
"""

import json

import pytest

from geometric_engine import crt_garner, hurwitz, tile_codec, vectors


def check_einstein_tiles(doc):
    for case in doc["cases"]:
        t = int(case["tile"], 16)
        assert tile_codec.form_id(t) == case["form_id"]
        assert tile_codec.south_halo(t) == case["south_halo"]
        assert tile_codec.payload(t) == int(case["payload"], 16)


def check_garner_crt(doc):
    for case in doc["cases"]:
        assert list(crt_garner.encode(case["n"])) == case["residues"]
        assert crt_garner.decode(tuple(case["residues"])) == case["n"]


def check_gram_tqf(doc):
    for case in doc["cases"]:
        p1, p2, p3 = (tuple(case[k]) for k in ("p1", "p2", "p3"))
        assert hurwitz.gram_tqf(p1, p2, p3) == int(case["tqf"])
        assert hurwitz.is_collinear(p1, p2, p3) == case["collinear"]


HANDLERS = {
    "einstein_tiles_forms_0_15": check_einstein_tiles,
    "garner_crt_881_883_887": check_garner_crt,
    "gram_tqf_collinearity": check_gram_tqf,
}


def test_suite(suite_file):
    if suite_file is None:
        pytest.skip("geometric-engine-spec not found (set GE_SPEC_DIR or add the spec submodule at ./spec)")
    doc = json.loads(suite_file.read_text())
    suite, status = doc["suite"], doc["status"]
    assert suite == suite_file.stem, f"{suite_file.name} declares suite {suite!r}"
    if status == "pending":
        pytest.skip(f"{suite}: pending, no cases")
    handler = HANDLERS.get(suite)
    if handler is not None:
        handler(doc)
    elif status == "draft":
        pytest.skip(f"no handler for draft suite {suite}")
    else:
        pytest.fail(f"no handler for {status} suite {suite}")


def test_every_handler_has_a_suite(vectors_dir):
    present = {p.stem for p in vectors_dir.glob("*.json")}
    missing = sorted(set(HANDLERS) - present)
    assert not missing, f"suites not found in {vectors_dir}: {missing}"


def test_schema(vectors_dir):
    jsonschema = pytest.importorskip("jsonschema")
    schema = json.loads((vectors_dir / "schema.json").read_text())
    for path in sorted(vectors_dir.glob("*.json")):
        if path.name != "schema.json":
            jsonschema.validate(json.loads(path.read_text()), schema)


def test_binary_mirrors_json(vectors_dir):
    for path in sorted(vectors_dir.glob("*.json")):
        doc = json.loads(path.read_text())
        if path.name == "schema.json" or doc["binary"] is None:
            continue
        records = vectors.read_bin(vectors_dir / doc["binary"]["file"])
        assert len(records) == len(doc["cases"])
        assert all(len(r) == len(doc["binary"]["fields"]) for r in records)
