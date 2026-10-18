# SHD-CCP / geometric-engine-rust

**Layer 2: Rust (no_std, WebAssembly, Rustler NIF) binding** of the SHD-CCP Geometric Engine. Publishes to **crates.io**.

```text
SHD-CCP Spec v0.1.0: CONFORMANT
```

## Implemented

| Primitive | RFC | Vectors |
| :--- | :---: | :--- |
| 64-bit Einstein Tile codec (draft layout) | 01 | `einstein_tiles_forms_0_15` |
| Garner CRT (881, 883, 887) | 02 | `garner_crt_881_883_887` |
| Exact 128-bit Gram-TQF collinearity | 02 | `gram_tqf_collinearity` |

## Install

```toml
[dependencies]
geometric-engine = "0.1"   # default-features = false for no_std
```

## Test and conformance

[`geometric-engine-spec`](https://github.com/SHD-CCP/geometric-engine-spec) is mounted as a submodule at `./spec`:

```sh
git submodule update --init
cargo test
```

The runner also accepts `$GE_SPEC_DIR`, or a sibling `../geometric-engine-spec` checkout.

## Roadmap

- Zero-copy SIMD batch pre-filtering
- `wasm32-unknown-unknown` target, used by `geometric-engine-js`
- Rustler NIF crate for `geometric-engine-elixir`
