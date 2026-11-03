# SHD-CCP / geometric-engine-c

**Layer 2: C99 / C11, bare-metal and embedded binding** of the SHD-CCP Geometric Engine. Publishes to **CMake / vcpkg / Conan**.

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

```cmake
find_package(gengine REQUIRED)
target_link_libraries(app PRIVATE gengine::gengine)
```

## Test and conformance

[`geometric-engine-spec`](https://github.com/SHD-CCP/geometric-engine-spec) is mounted as a submodule at `./spec`:

```sh
git submodule update --init
cmake -B build && cmake --build build && ctest --test-dir build --output-on-failure
```

The runner also accepts `$GE_SPEC_DIR`, or a sibling `../geometric-engine-spec` checkout.

## Roadmap

- L1 South Halo batch filter over tile arrays
- Static 2,017-byte prime bitmap for O(1) Form 1 certification
- Multiplier-free `<< 1` shift-and-add S₅ routing
- FFI surface for Elixir NIFs, Python (cffi) and Java (Panama FFM)
- vcpkg port and Conan recipe

Requires a compiler with `unsigned __int128` (GCC or Clang).
