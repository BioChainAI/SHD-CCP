# SHD-CCP website

The homepage contains the interactive architecture guide and the original Digital
Seed briefing. Both use the existing Firebase sign-in and account-status gate;
the original briefing is available in an expandable section below the guide.
The Geometric Engine tutorial remains linked from the homepage.

Serve the checked-in site directly; no build is needed to view it:

```sh
python3 -m http.server 8000
```

The guide's JavaScript is in `assets/explainer.js`, and its scoped styles are in
`assets/explainer.css`. Tailwind CSS and Three.js are served from checked-in local
assets. After changing utility classes in the HTML or JavaScript, rebuild them:

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
They cover the signed-out gate, allowed/denied/unverified account states, guide
interactions, prompt loading, responsive layout, and rendering fallback. Firebase
responses are mocked in tests; live Google sign-in and Firestore authorization
must be verified separately using [the Firebase setup guide](docs/FIREBASE_SETUP.md).

The uploaded explainer's models and prompt examples are educational design
illustrations. Its preset semantic mappings are not learned encodings, the tensor
calculator uses JavaScript arithmetic rather than FP8/FP16 encoding, and packet
times estimate serialization rather than measured end-to-end latency.
