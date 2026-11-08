# Owl-Academy / geometric-engine-course

**Layer 4: teaching material, interactive visualizers and curriculum.** It onboards mathematicians, systems engineers and students without cluttering the spec or engine repositories.

**Status: aspirational.** This folder is a scaffold staged inside SHD-CCP. Owl-Academy's working course site is [BioChainAI/Owl-Academy](https://github.com/BioChainAI/Owl-Academy), which does not use it.

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

Once this folder is its own repository, `.github/workflows/pages.yml` will deploy `simulators/` to GitHub Pages on every push to `main`. Until then the workflow is a template and does not run.
