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

## How a runner finds the suites

A runner does not keep its own list of suites. It reads every `test_vectors/*.json` file except `schema.json`, takes the suite's `suite` and `status` from the envelope, and then:

| The binding has a handler for the suite | `status` | Result |
| :--- | :--- | :--- |
| either | `pending` | skipped |
| yes | `normative` or `draft` | the cases run; a failing case fails the test run (for a draft suite this does not block certification, rule 2) |
| no | `draft` | reported as skipped |
| no | `normative` (or any other value) | **the run fails**, naming the suite |

A handler whose suite file is missing also fails the run, and so does a file whose `suite` differs from its file name. A new normative suite therefore fails every binding until each one adds a handler (rule 1), and a new draft suite is reported until it does (rule 2).

In this staging repository, CI checks each runner against both cases with [`scripts/check_suite_discovery.py`](../../scripts/check_suite_discovery.py), which adds a suite that no binding handles to a copy of `test_vectors/`.

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

A binding that passes every normative suite may show this line in its README:

```text
SHD-CCP Spec v0.1.0: CONFORMANT
```

The binding may then publish to its package registry. Re-certify on every spec release.

Draft suites do not change the line (rule 2). The C runner prints it at the end of its run and counts any failing draft suites after it, for example `SHD-CCP Spec v0.1.0: CONFORMANT (draft suites failing: 1)`; the run still exits non-zero.
