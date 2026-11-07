// Runs the SDK against every suite in geometric-engine-spec/test_vectors/.
//
// The suites are discovered from the .json files in test_vectors/ (CONFORMANCE.md): a suite with
// a handler below runs, a normative suite without a handler fails, a draft suite without a handler
// is reported as skipped, and a pending suite is skipped. A handler whose suite is missing fails.
// Spec location: $GE_SPEC_DIR, ./spec (submodule), or ../geometric-engine-spec.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { crt, tile, tqf } from "../src/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vectorsDir = [process.env.GE_SPEC_DIR, join(root, "spec"), join(root, "..", "geometric-engine-spec")]
  .filter(Boolean)
  .map((p) => join(p, "test_vectors"))
  .find(existsSync);

const handlers = {
  einstein_tiles_forms_0_15(doc) {
    for (const c of doc.cases) {
      const t = BigInt(c.tile);
      assert.equal(tile.formId(t), c.form_id, c.tile);
      assert.equal(tile.southHalo(t), c.south_halo, c.tile);
      assert.equal(tile.payload(t), BigInt(c.payload), c.tile);
    }
  },
  garner_crt_881_883_887(doc) {
    for (const c of doc.cases) {
      assert.deepEqual(crt.encode(c.n), c.residues);
      assert.equal(crt.decode(c.residues), c.n);
    }
  },
  gram_tqf_collinearity(doc) {
    for (const c of doc.cases) {
      assert.equal(tqf.gramTqf(c.p1, c.p2, c.p3), BigInt(c.tqf));
      assert.equal(tqf.isCollinear(c.p1, c.p2, c.p3), c.collinear);
    }
  },
};

const suiteFiles = vectorsDir
  ? readdirSync(vectorsDir).filter((name) => name.endsWith(".json") && name !== "schema.json").sort()
  : [];

test("spec located", () => assert.ok(vectorsDir, "geometric-engine-spec not found (set GE_SPEC_DIR)"));

for (const file of suiteFiles) {
  const name = file.slice(0, -".json".length);
  test(name, (t) => {
    const doc = JSON.parse(readFileSync(join(vectorsDir, file), "utf8"));
    assert.equal(doc.suite, name, `${file} declares suite ${doc.suite}`);
    const handler = Object.hasOwn(handlers, doc.suite) ? handlers[doc.suite] : undefined;
    if (doc.status === "pending") return t.skip("pending, no cases");
    if (handler) return handler(doc);
    if (doc.status === "draft") return t.skip(`no handler for draft suite ${doc.suite}`);
    assert.fail(`no handler for ${doc.status} suite ${doc.suite}`);
  });
}

test("every handler has a suite", { skip: !vectorsDir }, () => {
  const missing = Object.keys(handlers).filter((suite) => !suiteFiles.includes(`${suite}.json`));
  assert.deepEqual(missing, [], `suites not found in ${vectorsDir}`);
});
