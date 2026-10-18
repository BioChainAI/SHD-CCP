import assert from "node:assert/strict";
import { test } from "node:test";

import { crt, tile, tqf } from "../src/index.js";

test("tile round trip", () => {
  const t = tile.pack(5, 0xa5, 0x0123456789n);
  assert.equal(tile.formId(t), 5);
  assert.equal(tile.southHalo(t), 0xa5);
  assert.equal(tile.payload(t), 0x0123456789n);
  assert.throws(() => tile.pack(0, 0, tile.FORM_ID_MASK), RangeError);
});

test("crt round trip", () => {
  for (let n = 0; n < 200000; n += 7) assert.equal(crt.decode(crt.encode(n)), n);
  assert.equal(crt.decode(crt.encode(crt.M - 1)), crt.M - 1);
  assert.throws(() => crt.encode(crt.M), RangeError);
});

test("tqf right triangle", () => {
  assert.equal(tqf.gramTqf([0, 0], [3, 0], [0, 4]), 576n);
  assert.ok(tqf.isCollinear([0, 0], [2, 2], [-5, -5]));
});
