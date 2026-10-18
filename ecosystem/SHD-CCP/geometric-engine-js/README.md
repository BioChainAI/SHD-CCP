# SHD-CCP / geometric-engine-js

**Layer 2: TypeScript / JavaScript binding** of the SHD-CCP Geometric Engine. Publishes to **npm (`@shd-ccp/geometric-engine`)**.

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

```sh
npm install @shd-ccp/geometric-engine
```

## Test and conformance

[`geometric-engine-spec`](https://github.com/SHD-CCP/geometric-engine-spec) is mounted as a submodule at `./spec`:

```sh
git submodule update --init
npm test
```

The runner also accepts `$GE_SPEC_DIR`, or a sibling `../geometric-engine-spec` checkout.

## Roadmap

- Three.js / WebGPU visualizers for web dashboards
- Optional WebAssembly fast path built from `geometric-engine-rust`

Values above 2⁵³ (tiles and Gram-TQF results) are `BigInt`.
