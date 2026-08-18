# HANDOFF — EQL Source Auras (Session C)

The exchange below holds only what is still live. Applied rulings move into the standing sections
underneath and are deleted from the exchange.

---

## From the Director

*Nothing outstanding. All rulings received to 2026-08-18 are applied and moved to standing.*

---

## To the Director

**One live item.**

**The rename is blocked on having somewhere to do it.** The application source is not under
version control anywhere I can reach — it exists only inside `EQLS Auras.zip`, which is gitignored
here because it is 349 MB and exceeds GitHub's 100 MB per-file limit. I can read it; I cannot
change it revertibly.

The rename is not a find-and-replace. It moves Electron's userData directory and will orphan the
live config on first launch (detail in *Standing: blocking work*). Doing that to an unversioned
tree means the only undo is the ZIP.

**What I need:** where the app source should live. Either it goes into this repo — I would unpack
the tree without `node_modules`, `dist/` or the packaged binaries, which is roughly 3 MB of real
source — or you point me at a separate repo. Say which and I will put it under version control
first, then land the rename and the userData migration as separate revertible commits.

Until then the band is unaffected and ships whenever Session A is ready.

---

## Standing: band material — FINAL

Adjudicated 2026-08-18. C1 through C9 approved as worded; claim wording frozen in `CLAIM-SET.md`.
Session A wires it. Nothing here was written to eql-source.

```
_media/auras.mp4          892 KB   1600x900, CRF 32, 6.8 s, no audio stream
_media/auras-poster.jpg   149 KB   1600x900
COPY.md                   120 words, no digits, no braces, ceiling 649 -> 769
CLAIM-SET.md              C1-C9, wording frozen, adjudication recorded
ENCODE.md                 reproducible commands, three redaction boxes, CRF reasoning
```

Both under precedent: 892 KB against 949, 149 KB against 177.

**Note the video moved from 933 KB to 892 KB** after the blur ruling. Blurred regions carry less
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
  admission inviting follow-up. Kept digit-free so it drops into any page without tripping the
  figure-near-hedge rule.
- **All three names blurred** — owner's nameplate, guild tag and pet name alongside the third
  party's, per CLAUDE.md section seven. Boxes verified static at three points across the cut; the
  camera does not move, so nothing drifts out from behind one. The pet box was narrowed after a
  first attempt clipped the leading digit of the pet's health and left a stray "00", which reads
  as a bug rather than a redaction.
- **CRF 32 stands.** Recorded in `ENCODE.md` as meeting a size precedent rather than drifting from
  a CRF one, with the full measured ladder, so nobody later "restores" CRF 28.
- **Timing: the band may land after the drop.** The copy is not to be compressed in a rush. Cut #1
  remains approved but is no longer a schedule concession — `COPY.md` now says so explicitly, so
  Session A does not reach for it reflexively under pressure that no longer exists. Cuts #2 and #3
  are marked unavailable with reasoning attached so neither is re-proposed by someone who was not
  party to the ruling.

---

## Standing: blocking work — rename the application

**Blocking release, not deferred.** Carried by Session C. Blocked on a destination; see the
exchange above.

The band ships safely without it because the cut contains no application chrome. A downloadable
binary does not.

The name lives in eight places. Three further "Buff Tracker" strings are *page* names and **must
not be touched**, or the app's own navigation stops making sense.

**Change these eight:**

| File | Line | Current |
|---|---|---|
| `package.json` | 2 | `"name": "eq-buff-tracker"` |
| `package.json` | 3 | `"productName": "EQ Buff Tracker"` |
| `package.json` | 17 | `"appId": "com.example.eqbufftracker"` |
| `package.json` | 18 | `build.productName: "EQ Buff Tracker"` |
| `src/main/mainWindow.js` | 17 | `title: 'EQ Buff Tracker'` |
| `src/renderer/main-window/index.html` | 5 | `<title>EQ Buff Tracker</title>` |
| `src/renderer/main-window/index.html` | 21 | `<h1>EQ Buff Tracker</h1>` — sidebar header |
| `src/renderer/overlay/index.html` | 5 | `<title>EQ Buff Tracker Overlay</title>` |

**Leave alone:** `index.html` lines 22, 38, 126, 786 and the comment at `buffEngine.js:710`.

**The trap.** Electron derives `app.getPath('userData')` from `productName`. Renaming silently
moves the config directory from `AppData\Roaming\EQ Buff Tracker\` to a new path, orphaning
`config.json`, the widget store, loadout profiles, the buff store and the icon cache. The app will
start up looking factory-fresh with every widget gone. Nothing has shipped, so the blast radius is
one machine — but it is the machine this project is developed on, and it happens on the first
launch after the rename unless the folder is moved first. `src/main/store.js:7` documents the old
path in a comment and wants updating in the same pass.

Also `appId` is `com.example.eqbufftracker`. `com.example.` is a placeholder domain and should
become something real before an installer goes out.

---

## Standing: defects

**Roster-count drift — the fifth instance of a hand-written figure beside computed truth.**
Documentation says the bundled roster is "~3300 entries". `src/shared/data/buffs.json` holds
**11,337 entries, every one uniquely named**. Stale by roughly a factor of three.

Recorded rather than patched, deliberately. Changing "~3300" to "11,337" produces the sixth
instance the next time the roster is re-mined. If this is the fifth occurrence the fault is the
practice, not the number: the figure should not be hand-written at all. Either the mining script
writes the count into the doc as it regenerates `buffs.json`, or the doc drops the number and
points at the file. Cheapest durable version is a check reading
`len(json.load(open('buffs.json')))` that fails when the documented figure disagrees — the same
shape as the gate already guarding the site's prose.

**A dark rectangle in every frame of the source recording.** Hard-edged, constant position,
opaque, floating over the game world. Most likely one of the configured but empty widgets
(Ally Buffs / Timer 1 / buff 2) drawing an opaque background — a rendering bug, not a recording
artefact. Cropped out of the deliverable, so the band is unaffected, but it will appear in any
future footage taken before it is fixed.

**Placeholder text live in the settings UI.** The literal word "planned" sits where a value belongs
beside three controls, "Not active yet." appears twice, a roadmap sentence lives inside the sounds
pane, and a test widget named "buff 2" sits in the sidebar beside Self Buffs and Ally Buffs.
Invisible in the band because no application chrome is in shot, but the settings panel is the
second thing anyone screenshots after release.

---

## Standing: repository

`samusmylove47-maker/EQLSAuras`, public, `main` tracking `origin/main`. Wired 2026-08-18 — the repo
was empty, so `git init` plus remote rather than a clone.

The source ZIP and the two raw recordings are gitignored: the ZIP is 349 MB, over GitHub's 100 MB
per-file hard limit, and carries `node_modules`, a 78 MB installer and a 180 MB packaged exe.
Commit identity is set repo-locally to the GitHub noreply address rather than the account Gmail,
since commit metadata on a public repo is permanent and indexed.

Session C does not write to eql-source. Output is material and a spec; Session A lands it.

*Session C, 2026-08-18.*
