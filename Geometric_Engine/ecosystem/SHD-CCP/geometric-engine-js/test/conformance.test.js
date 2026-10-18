// Runs the SDK against geometric-engine-spec/test_vectors/*.json.
// Spec location: $GE_SPEC_DIR, ./spec (submodule), or ../geometric-engine-spec.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { crt, tile, tqf } from "../src/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vectorsDir = [process.env.GE_SPEC_DIR, join(root, "spec"), join(root, "..", "geometric-engine-spec")]
  .filter(Boolean)
  .map((p) => join(p, "test_vectors"))
  .find(existsSync);

const load = (suite) => JSON.parse(readFileSync(join(vectorsDir, `${suite}.json`), "utf8"));

test("spec located", () => assert.ok(vectorsDir, "geometric-engine-spec not found (set GE_SPEC_DIR)"));

test("einstein_tiles_forms_0_15", { skip: !vectorsDir }, () => {
  for (const c of load("einstein_tiles_forms_0_15").cases) {
    const t = BigInt(c.tile);
    assert.equal(tile.formId(t), c.form_id, c.tile);
    assert.equal(tile.southHalo(t), c.south_halo, c.tile);
    assert.equal(tile.payload(t), BigInt(c.payload), c.tile);
  }
});

test("garner_crt_881_883_887", { skip: !vectorsDir }, () => {
  for (const c of load("garner_crt_881_883_887").cases) {
    assert.deepEqual(crt.encode(c.n), c.residues);
    assert.equal(crt.decode(c.residues), c.n);
  }
});

test("gram_tqf_collinearity", { skip: !vectorsDir }, () => {
  for (const c of load("gram_tqf_collinearity").cases) {
    assert.equal(tqf.gramTqf(c.p1, c.p2, c.p3), BigInt(c.tqf));
    assert.equal(tqf.isCollinear(c.p1, c.p2, c.p3), c.collinear);
  }
});
