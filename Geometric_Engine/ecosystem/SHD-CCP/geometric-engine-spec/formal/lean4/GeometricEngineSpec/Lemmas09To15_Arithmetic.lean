/-!
# Lemmas 9–15 — Exact arithmetic (RFC 00, Layer IV)

Machine-checked so far: the Garner CRT constants used by every binding
(RFC 02). Still to formalize: 128-bit Gram-TQF bound, Niven's bound,
recursive Merkle integrity, and the remaining Layer IV lemmas.
-/

namespace GeometricEngineSpec.Arithmetic

/-- The cubic-index modulus. -/
theorem crt_modulus : 881 * 883 * 887 = 690017701 := by decide

theorem crt_coprime_881_883 : Nat.gcd 881 883 = 1 := by decide
theorem crt_coprime_881_887 : Nat.gcd 881 887 = 1 := by decide
theorem crt_coprime_883_887 : Nat.gcd 883 887 = 1 := by decide

/-- `C12 = 881⁻¹ mod 883`. -/
theorem garner_c12 : 881 * 441 % 883 = 1 := by decide

/-- `C123 = (881 · 883)⁻¹ mod 887`. -/
theorem garner_c123 : 881 * 883 * 37 % 887 = 1 := by decide

/-- Garner reconstruction, exactly as specified in RFC 02. -/
def garnerDecode (r1 r2 r3 : Nat) : Nat :=
  let v2 := (r2 + 883 - r1 % 883) % 883 * 441 % 883
  let t := (r1 + 881 * v2) % 887
  let v3 := (r3 + 887 - t) % 887 * 37 % 887
  r1 + 881 * v2 + 777923 * v3

/-- Spot checks matching `garner_crt_881_883_887.json` edge cases. -/
example : garnerDecode 0 0 0 = 0 := by decide
example : garnerDecode 0 0 24 = 777923 := by decide
example : garnerDecode (690017700 % 881) (690017700 % 883) (690017700 % 887) = 690017700 := by decide

end GeometricEngineSpec.Arithmetic
