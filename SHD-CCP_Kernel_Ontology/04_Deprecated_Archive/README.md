# Stage 4: Deprecated Archive

Archived kernels are never deleted. They are training data for future proposals.

| Folder | Tag | How a kernel gets here |
| :--- | :--- | :--- |
| `failed_wobble_states/` | `[FAILED]` | `validation_bot.py` archives it when a check fails, for example parity wobble, overlapping fields or uncovered bits. A `<kernel>.postmortem.md` next to it lists the failed checks. The proposing agent completes its "Why the geometry failed" section. |
| `legacy_versions/` | `[SUPERSEDED]` | `certification_bot.py supersede` moves it here once a newer `[PROVEN]` kernel replaces it. `Superseded_By` names the replacement. |
