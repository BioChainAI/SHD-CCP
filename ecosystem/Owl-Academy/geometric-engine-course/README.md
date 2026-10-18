# Owl-Academy / geometric-engine-course

**Layer 4: teaching material, interactive visualizers and curriculum.** It onboards mathematicians, systems engineers and students without cluttering the spec or engine repositories.

| Path | Contents |
| :--- | :--- |
| [`livebooks/`](livebooks/) | Interactive Elixir Livebooks built on `geometric_engine` |
| [`simulators/`](simulators/) | Standalone 3D WebGL simulators, deployed to GitHub Pages |
| [`walkthroughs/`](walkthroughs/) | Visual proof diagrams and step-by-step walkthroughs of the 15 Lemmas |

## Run a Livebook

```sh
livebook server livebooks/01_exact_arithmetic.livemd
```

## Publish the simulators

`.github/workflows/pages.yml` deploys `simulators/` to GitHub Pages on every push to `main`.
