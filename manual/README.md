# SHD-CCP Manual

Open `index.html` through the repository's static server. The architecture
overview is the initial chapter; linked detail pages are marked **Planned** and
ready for later expansion.

Edit article fragments in `chapters/`, shared navigation in `navigation.json`,
page structure in `templates/page.html`, and styling in `assets/manual.css`.
Regenerate the checked-in static pages with:

```sh
python3 manual/build.py
```

See [the chapter authoring guide](chapters/README.md) and
[the chapter template](chapters/_template.html) for the expansion workflow.
