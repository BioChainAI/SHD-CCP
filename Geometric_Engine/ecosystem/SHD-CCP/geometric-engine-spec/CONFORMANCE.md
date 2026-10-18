# Conformance

## Mounting the spec

Each Layer 2 binding mounts this repository as a git submodule at `./spec`:

```sh
git submodule add https://github.com/SHD-CCP/geometric-engine-spec spec
git -C spec checkout v0.1.0
```

Every conformance runner looks for the spec in this order:

1. `$GE_SPEC_DIR` (or a native equivalent such as `-DGE_SPEC_DIR=` / `-Dge.spec.dir=`)
2. `./spec` (the submodule)
3. `../geometric-engine-spec` (a sibling checkout, used in the staging monorepo)

## Rules

1. A runner MUST execute every case of every suite whose `status` is `normative`.
2. A runner SHOULD execute `draft` suites and report the result. Draft failures do not block certification.
3. `pending` suites have no cases and are skipped.
4. Results must match **bit for bit**. Approximate or floating-point comparisons are not allowed.
5. A runner may read either the JSON or the `.bin` mirror. The two encode identical cases (see [`test_vectors/README.md`](test_vectors/README.md)).

## One command per ecosystem

| Binding | Command |
| :--- | :--- |
| geometric-engine (Python) | `pytest` |
| geometric-engine-c | `cmake -B build && cmake --build build && ctest --test-dir build` |
| geometric-engine-rust | `cargo test` |
| geometric-engine-java | `mvn test` |
| geometric-engine-elixir | `mix test` |
| geometric-engine-js | `npm test` |

## Badge

A binding that passes may show this line in its README:

```text
SHD-CCP Spec v0.1.0: CONFORMANT
```

The binding may then publish to its package registry. Re-certify on every spec release.
