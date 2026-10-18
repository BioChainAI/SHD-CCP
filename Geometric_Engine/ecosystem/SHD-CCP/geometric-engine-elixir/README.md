# SHD-CCP / geometric-engine-elixir

**Layer 2: Erlang / Elixir (BEAM / OTP) binding** of the SHD-CCP Geometric Engine. Publishes to **Hex.pm**.

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

```elixir
def deps do
  [{:geometric_engine, "~> 0.1"}]
end
```

## Test and conformance

[`geometric-engine-spec`](https://github.com/SHD-CCP/geometric-engine-spec) is mounted as a submodule at `./spec`:

```sh
git submodule update --init
mix test
```

The runner also accepts `$GE_SPEC_DIR`, or a sibling `../geometric-engine-spec` checkout.

## Roadmap

- OTP supervision tree for the 12-engine + 13th-engine cuboctahedral memory, which heals crashed nodes via `H₄ = (H₁H₂H₃)⁻¹` (RFC 04)
- `:gen_statem` 6-step alignment handshake (RFC 06)
- Ramanujan `X(5, q)` P2P cluster overlay (RFC 03)
- Optional NIF acceleration via `geometric-engine-rust` (Rustler) or `geometric-engine-c`
