# SHD-CCP / geometric-engine

**Layer 1: the canonical reference implementation.** It provides the Python verification suite, the golden test-vector generator for [`geometric-engine-spec`](../geometric-engine-spec), and the reference algorithms that every binding ports. To port the engine to a new language or hardware target, start by reading this repository.

```text
SHD-CCP Spec v0.1.0: CONFORMANT
```

## Modules

| Module | RFC | Status |
| :--- | :---: | :--- |
| `tile_codec` | 01 | implemented (draft layout) |
| `crt_garner` | 02 | implemented |
| `hurwitz`: Gram-TQF and doubled-coordinate Hurwitz quaternions | 02 | implemented. S₅ tree is a stub. |
| `qcc` | 02 | stub |
| `memory_12` | 04 | stub |
| `handshake` | 06 | stub |
| `calculators/orbital_5tier` (*The Geometric Engine of Time*), `ttmpt_pump`, `fp_prime_sieve`, `acoustic_cubit` | 05 | stubs |
| `vectors`: suite generators and the `SHDGEV01` binary format | — | implemented |

## Usage

```sh
pip install -e '.[test]'
pytest                                          # unit and conformance tests
python verification/export_golden_vectors.py    # regenerate ../geometric-engine-spec/test_vectors
python verification/export_golden_vectors.py --check   # fail if committed vectors are stale
```

The conformance tests find the spec at `$GE_SPEC_DIR`, then `./spec`, then `../geometric-engine-spec`.

## Verification scripts

`verification/` will hold the monograph's reproducible verification scripts. `export_golden_vectors.py` is live. The `verify_*.py` files are placeholders until the original scripts are imported.
