# Extending the SHD-CCP manual

The manual is a static, public documentation section. The supplied architecture
overview is preserved in `architecture-overview.html`. The five detail chapters
are explicitly marked **Planned**; they provide expansion space, not fabricated
specifications or implementation results.

Each file here is an article fragment, not an independent webpage. `../build.py`
wraps it with the shared page template, navigation, breadcrumbs, and pagination.
Generated pages live directly under `manual/`, and their shared styles live in
`manual/assets/manual.css`. GitHub Pages serves the generated HTML directly.
There are no runtime packages or external asset dependencies.

## Add a chapter

1. Copy `_template.html` to a descriptive filename here, such as
   `packet-examples.html`. Keep one `h1`; use stable IDs on section headings.
2. Add an entry to `manual/navigation.json` in the desired chapter order:

   ```json
   {
     "slug": "packet-examples",
     "source": "packet-examples.html",
     "title": "Packet Examples",
     "status": "planned",
     "sections": [
       {"id": "scope", "title": "Scope"},
       {"id": "example", "title": "Worked Example"}
     ]
   }
   ```

   `slug` becomes the generated filename `manual/packet-examples.html`. Use only
   lowercase letters, digits, and single hyphens. Each slug must be unique; the
   first entry must remain `index` for the architecture overview.
3. Write the chapter content. Link other manual pages with filenames such as
   `einstein-tile.html#scope`, and the homepage with `../index.html`. These links
   are relative to the generated output page, not this source folder.
4. Keep `status` set to `planned` while the page is a placeholder. Set it to
   `available` when reviewed content has replaced the placeholder and the chapter
   is ready to read. Replace the “Planned chapter” box in the fragment at the same
   time. State the protocol version and distinguish design proposals from tested
   implementation behavior. Include definitions, worked examples, claim status,
   references, and validation where applicable.
5. From the repository root, run:

   ```sh
   python3 manual/build.py
   ```

   Or use the absolute script path from any working directory. Rebuild a second
   time to check repeatability, then inspect the generated page on desktop and
   mobile. Verify navigation, section anchors, table scrolling, and pagination.
6. Commit the source fragment, `navigation.json`, and generated HTML together.
   Shared template changes belong in `manual/templates/page.html`, and shared
   style changes belong in `manual/assets/manual.css`. Rebuild all pages after
   changing either.

The builder validates chapter filenames, slugs, statuses, and required source
files. Generated files contain a comment identifying their source workflow;
avoid editing those files directly because a rebuild replaces them.
