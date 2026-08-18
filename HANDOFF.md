# HANDOFF — EQL Source Auras (Session C)

The exchange below holds only what is still live. Applied rulings move into the standing sections
underneath and are deleted from the exchange.

---

## From the Director

*Nothing outstanding. All rulings received to 2026-08-18 are applied and moved to standing.*

---

## To the Director

**The blocker is half closed, and not by me. I imported nothing — importing would have been
wrong.**

**The source is already versioned.** The owner set up `LoxyBee/EQLS-Auras` herself on the morning
of 2026-08-18 — public, two commits, `node_modules` and `dist/` correctly excluded. The single
point of failure you identified is closed. She closed it before I got there.

**The ZIP is stale, and importing it would have forked her project.** Her repository is ahead of
the archive: it carries a `UX_VISUAL_DESIGN.md` the ZIP does not have, a newer `CLAUDE.md`, and a
fix commit landed after the initial upload. Committing that snapshot here as canonical history
would have created a second, older lineage of someone else's live project. This is the case the
check was for.

**Consequence for the claim set, and it is an improvement.** Every load-bearing claim has been
re-verified against her live tree at `c7f7f4e` rather than the archive. All held — no memory or
injection calls, no runtime dependencies, no network code, log tail and overlay properties
unchanged. `CLAIM-SET.md` now cites a commit instead of a ZIP, which is better evidence than what
we had when you adjudicated it.

### The rename happened. It went to the wrong name.

She renamed the app from "EQ Buff Tracker" to **"EQLS Auras"** — precisely the abbreviation you
ruled out. The site would say EQL Source Auras while the title bar, sidebar and installer say
EQLS Auras. Narrower than the fault we started with; same category.

Two things worth crediting in how it was done. **The userData trap fired for real.** The code
comment records that an earlier version of the pin sat below the `require()` calls and silently
seeded a second, empty `widgets.json` under the new folder while buffs, profiles and spellbook
stayed in the old one — a genuine split-brain, caught and fixed. And **the fix is the right one**:
`app.setPath('userData', ...)` is pinned to the original `EQ Buff Tracker` folder, above every
local `require()`, and her `CLAUDE.md` states that any future rename must leave the pin alone.
That is correct, and it means the second rename is safe on that axis.

**I cannot land it.** No push access to `LoxyBee/EQLS-Auras` — a different account, and I am not a
collaborator. The complete patch is in *Standing: blocking work*, so whoever has access can apply
it without rediscovering any of this.

### One decision I need rather than assume

Your naming rule governs the site's prose. Does it bind the application's own interface? My
reading, offered as a proposal rather than taken as read:

- `productName` — **"EQL Source Auras"**. The installer name, the taskbar button, the window
  title. This is what a downloader sees, so it is the one that must match the site exactly.
- sidebar heading — **"Auras"**. Inside an installed application the reader has already met the
  full name, so this is comfortably "after first mention", and the full string is long for a
  sidebar.
- `appId` — **`com.eqlsource.auras`**, currently `com.eqlsource.eqlsauras`. Nothing has shipped,
  so this is the last moment changing it costs nothing.

Ten minutes for whoever holds the keys.

**Worth knowing:** her `CLAUDE.md` already describes the current name as "a step toward an eventual
EQLsource branded app (not there yet)". The second rename is anticipated in her own documentation,
not a correction imposed from outside.

**Nothing of hers is in this repository.** No `CLAUDE.md`, no `HANDOFF.md`, no source — only band
material and this exchange, per instruction.

---

## Standing: band material — FINAL

Adjudicated 2026-08-18. C1 through C9 approved as worded; claim wording frozen in `CLAIM-SET.md`.
Session A wires it. Nothing here was written to eql-source.

```
_media/auras.mp4          892 KB   1600x900, CRF 32, 6.8 s, no audio stream
_media/auras-poster.jpg   149 KB   1600x900
COPY.md                   120 words, no digits, no braces, ceiling 649 -> 769
CLAIM-SET.md              C1-C9, wording frozen, verified against LoxyBee/EQLS-Auras @ c7f7f4e
ENCODE.md                 reproducible commands, three redaction boxes, CRF reasoning
```

Both under precedent: 892 KB against 949, 149 KB against 177.

**The video moved from 933 KB to 892 KB** after the blur ruling. Blurred regions carry less
high-frequency detail, so the redaction bought headroom rather than costing any. 933 KB was the
pre-blur figure.

**Applied rulings, for the record:**

- **Name.** "EQL Source Auras" first mention, "Auras" after. The heading carries the first mention.
  Extended to the asset filenames — `eqls-auras.*` became `auras.*`, because a filename is
  reachable in view-source and the network tab and is therefore somewhere a reader could meet an
  abbreviation the site otherwise never uses. Long-form costs one word: band is 120, ceiling 769.
- **C3 stays in full.** Naming only the log would be incomplete; the spellbook and the install's
  icon art are named too.
- **C4's foreground sentence held back, ready verbatim.** In `COPY.md` under "Held in reserve",
  written out and sourced, with a second clause so it lands as a complete answer rather than an
  admission inviting follow-up. Kept digit-free.
- **All three names blurred** — owner's nameplate, guild tag and pet name alongside the third
  party's, per the generic-never-personal rule. Boxes verified static at three points across the
  cut. The pet box was narrowed after a first attempt clipped the leading digit of the pet's
  health and left a stray "00", which reads as a bug rather than a redaction.
- **CRF 32 stands.** Recorded in `ENCODE.md` as meeting a size precedent rather than drifting from
  a CRF one, with the full measured ladder, so nobody later "restores" CRF 28.
- **Timing: the band may land after the drop.** The copy is not to be compressed in a rush. Cut #1
  remains approved but is downgraded from a schedule concession to a ceiling-argument fallback;
  `COPY.md` says outright not to take it to save time. Cuts #2 and #3 remain unavailable with
  reasoning attached so neither is re-proposed by someone not party to the ruling.

---

## Standing: blocking work — the second rename

**Blocking release, not deferred.** Lives in `LoxyBee/EQLS-Auras`, not here. Session C has read
access only; this is the complete patch so nobody has to rediscover it.

The band ships safely without it — the cut contains no application chrome. A downloadable binary
does not.

**Change these, "EQLS Auras" to "EQL Source Auras":**

| File | Line | Current | Proposed |
|---|---|---|---|
| `package.json` | 2 | `"name": "eqls-auras"` | `"eql-source-auras"` |
| `package.json` | 3 | `"productName": "EQLS Auras"` | `"EQL Source Auras"` |
| `package.json` | 17 | `"appId": "com.eqlsource.eqlsauras"` | `"com.eqlsource.auras"` |
| `package.json` | 18 | `build.productName: "EQLS Auras"` | `"EQL Source Auras"` |
| `src/main/mainWindow.js` | 17 | `title: 'EQLS Auras'` | `'EQL Source Auras'` |
| `src/renderer/main-window/index.html` | 5 | `<title>EQLS Auras</title>` | `EQL Source Auras` |
| `src/renderer/main-window/index.html` | 21 | `<h1>EQLS Auras</h1>` | `<h1>Auras</h1>` |
| `src/renderer/overlay/index.html` | 5 | `<title>EQLS Auras Overlay</title>` | `Auras Overlay` |

Comments carrying the old name, same pass: `src/main/main.js` lines 11 and 21,
`src/main/store.js` line 10, `CLAUDE.md` lines 1 and 3.

**Do not touch `src/main/main.js` line 24:**

    app.setPath('userData', path.join(app.getPath('appData'), 'EQ Buff Tracker'));

That pin is load-bearing and has already earned its place. It must keep pointing at the original
`EQ Buff Tracker` folder, and it must stay above every `require()` of a local module — the comment
above it records exactly what happened when it did not. Renaming the product again does not
require moving anyone's data, and moving it would orphan the live install a second time.

**Leave alone** — "Buff Tracker" here is the name of a *page* inside the app:
`src/renderer/main-window/index.html` lines 11, 22, 38, 126 and 839. Also leave
`src/renderer/main-window/main-window.css` line 2, which refers to eqlsource.com's palette and is
correct as written.

---

## Standing: defects

**Roster-count drift — the fifth instance of a hand-written figure beside computed truth.**
Documentation says the bundled roster is "~3300 entries". `src/shared/data/buffs.json` holds
**11,337 entries, every one uniquely named**. Stale by roughly a factor of three.

Confirmed still present in `LoxyBee/EQLS-Auras` at `c7f7f4e`, so this is a live defect and not an
artefact of the stale archive. Recorded rather than patched, deliberately: changing "~3300" to
"11,337" produces the sixth instance the next time the roster is re-mined. If this is the fifth
occurrence then the fault is the practice, not the number — the figure should not be hand-written
at all. Either the mining script writes the count into the doc as it regenerates `buffs.json`, or
the doc drops the number and points at the file. Cheapest durable version is a check reading
`len(json.load(open('buffs.json')))` that fails when the documented figure disagrees — the same
shape as the gate already guarding the site's prose.

**A dark rectangle in every frame of the source recording.** Hard-edged, constant position, opaque,
floating over the game world. Most likely one of the configured but empty widgets drawing an opaque
background — a rendering bug, not a recording artefact. Cropped out of the deliverable, so the band
is unaffected, but it will appear in any future footage taken before it is fixed.

**Placeholder text live in the settings UI.** The literal word "planned" sits where a value belongs
beside three controls, "Not active yet." appears twice, and a roadmap sentence lives inside the
sounds pane. Invisible in the band because no application chrome is in shot, but the settings panel
is the second thing anyone screenshots after release.

---

## Standing: repository

**Two repositories, deliberately separate.**

`samusmylove47-maker/EQLSAuras` — this one. Public, `main` tracking `origin/main`. Holds **band
material and this exchange only**: `_media/`, `COPY.md`, `CLAIM-SET.md`, `ENCODE.md`, `HANDOFF.md`.
No application source, and nothing authored by the app's owner. The source ZIP and the raw
recordings are gitignored — the ZIP is 349 MB, over GitHub's 100 MB per-file limit. Commit identity
is set repo-locally to the GitHub noreply address rather than the account Gmail, since commit
metadata on a public repo is permanent and indexed.

`LoxyBee/EQLS-Auras` — the application, owned and maintained by its author. Public, default branch
`master`, `node_modules` and `dist/` correctly excluded. **This is the canonical source.** Session C
has read access only. The import contemplated earlier was abandoned once this repository was found,
because duplicating it here would have forked a live project behind its owner's back.

The ZIP in this working directory is a stale transfer artefact and should not be treated as a
source of truth by any session. Read `LoxyBee/EQLS-Auras` instead.

Session C does not write to eql-source. Output is material and a spec; Session A lands it.

*Session C, 2026-08-18.*
