# SHD-CCP

Landing portal and documentation hub for the **SHD-CCP** protocol (the 64-bit Einstein Tile) and the **Geometric Engine**. The site is served from this repository via GitHub Pages.

## Ecosystem

The protocol, the reference engine, the language bindings, the application layer and the course are split across a 5-layer federated set of repositories. All of them are anchored by a single spec repo:

| Layer | Repository | Role |
| :---: | :--- | :--- |
| 0 | `SHD-CCP/geometric-engine-spec` | RFCs, golden test vectors, Lean 4 proofs. **The source of truth.** |
| 1 | `SHD-CCP/geometric-engine` | Python reference implementation and vector generator |
| 2 | `SHD-CCP/geometric-engine-{c,rust,java,elixir,js}` | Native bindings, certified against the Layer 0 vectors |
| 3 | `BioChain-AI/biochain` | Application and governance platform |
| 4 | `Owl-Academy/geometric-engine-course` | Livebooks, simulators, walkthroughs |

These repositories are currently staged under [`Geometric_Engine/ecosystem/`](Geometric_Engine/ecosystem/). See [`Geometric_Engine/ecosystem/README.md`](Geometric_Engine/ecosystem/README.md) for the architecture, the conformance pipeline and how to split each folder into its own repo.

*The Geometric Engine of Time* is the title of the chronometric 5-tier orbital calculator module inside the engine (RFC 05).

## Kernel Ontology

[`SHD-CCP_Kernel_Ontology/`](SHD-CCP_Kernel_Ontology/) is the registry of 64-bit kernel layouts, one per Form ID. Each layout moves through an agent-driven pipeline: Incubator `[OPEN]`/`[HEURISTIC]`, then Validation Matrix `[COMPUTED]`, then Certified Standard `[PROVEN]`, which requires machine-checked Lean proofs.

## Visualizations in this repo

- [`Geometric_Engine/Geometric_Engine_Tutorial.html`](Geometric_Engine/Geometric_Engine_Tutorial.html)
- [`Visualization_Repository/Lattice_Architecture/72-node_Tri_stream_animation.html`](Visualization_Repository/Lattice_Architecture/72-node_Tri_stream_animation.html)
- [`Simulations/Hyper-Sim/Decoder/`](Simulations/Hyper-Sim/Decoder/)

## Site setup

See [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) for the sign-in gate and Firebase configuration.

## Homepage development

The homepage opens with the Genesis Kernel's theoretical 3D packet preview and
offers Google sign-in or **Explore as guest**. Guest browsing opens the interactive
architecture guide and the original Digital Seed briefing without a Firebase
account. The original briefing is available below the guide as an expandable
section. Signed-in accounts still use the existing Firestore account-status check.

The public [SHD-CCP Manual](manual/) preserves the supplied architecture overview
and reserves five linked chapters for expansion. Edit its article fragments,
navigation manifest, and shared template, then regenerate the static pages with
`python3 manual/build.py` (also included in `npm run build`). See
[the chapter authoring guide](manual/chapters/README.md).

Serve the checked-in site directly; no build is needed to view it:

```sh
python3 -m http.server 8000
```

The guide's JavaScript is in `assets/explainer.js`, its scoped styles are in
`assets/explainer.css`, and guest-session behavior is in `assets/site-session.js`.
The embedded visualizer also works as the standalone `genesis/` page, with source
assets in `genesis/assets/`. Tailwind CSS, Three.js, and OrbitControls are served
from checked-in local assets. After changing utility classes or manual sources,
rebuild them:

```sh
npm ci
npm run build
```

Commit the generated `assets/tailwind.css` and `assets/vendor/` files alongside
source changes. The existing GitHub Pages workflow publishes those files directly.
Three.js remains pinned to the site's existing r128 release, with its license in
`assets/vendor/three.LICENSE`. Optional Google Fonts and Font Awesome icons still
use their existing external hosts; Firebase also requires network access.

Run browser regression checks with:

```sh
npm ci
npx playwright install chromium
npm test
```

The tests automatically use `/usr/bin/chromium` when present; alternatively set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` or install Playwright's browser as above.
They cover the public preview, guest entry without Firebase, account states, guide
interactions, manual navigation, prompt loading, responsive layout, and rendering fallback. Firebase
responses are mocked in tests; live Google sign-in and Firestore authorization
must be verified separately using [the Firebase setup guide](docs/FIREBASE_SETUP.md).

The uploaded explainer's models and prompt examples are educational design
illustrations. Its preset semantic mappings are not learned encodings, the tensor
calculator uses JavaScript arithmetic rather than FP8/FP16 encoding, and packet
times estimate serialization rather than measured end-to-end latency.
