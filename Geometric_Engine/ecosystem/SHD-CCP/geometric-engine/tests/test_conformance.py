"""Run the reference implementation against the committed Layer 0 golden vectors."""

import json

import pytest

from geometric_engine import crt_garner, hurwitz, tile_codec, vectors


def load(vectors_dir, suite):
    return json.loads((vectors_dir / f"{suite}.json").read_text())


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


def test_einstein_tiles(vectors_dir):
    for case in load(vectors_dir, "einstein_tiles_forms_0_15")["cases"]:
        t = int(case["tile"], 16)
        assert tile_codec.form_id(t) == case["form_id"]
        assert tile_codec.south_halo(t) == case["south_halo"]
        assert tile_codec.payload(t) == int(case["payload"], 16)


def test_garner_crt(vectors_dir):
    for case in load(vectors_dir, "garner_crt_881_883_887")["cases"]:
        assert list(crt_garner.encode(case["n"])) == case["residues"]
        assert crt_garner.decode(tuple(case["residues"])) == case["n"]


def test_gram_tqf(vectors_dir):
    for case in load(vectors_dir, "gram_tqf_collinearity")["cases"]:
        p1, p2, p3 = (tuple(case[k]) for k in ("p1", "p2", "p3"))
        assert hurwitz.gram_tqf(p1, p2, p3) == int(case["tqf"])
        assert hurwitz.is_collinear(p1, p2, p3) == case["collinear"]
