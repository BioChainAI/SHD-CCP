import Lake
open Lake DSL

-- Core Lean only for now so `lake build` stays fast in CI. Add
--   require mathlib from git "https://github.com/leanprover-community/mathlib4"
-- once the lemma statements need Mathlib (projective geometry, Nat.Prime, ℍ).
package GeometricEngineSpec

@[default_target]
lean_lib GeometricEngineSpec
