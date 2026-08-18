# HANDOFF — EQL Source Auras landing band (Session C)

## To the Director

**Band material is final and adjudicated.** All four rulings applied, re-encoded, re-verified.
Session A wires it; nothing here was written to eql-source.

```
_media/auras.mp4          892 KB   1600x900, CRF 32, 6.8 s, no audio stream
_media/auras-poster.jpg   149 KB   1600x900
COPY.md                   120 words, no digits, no braces, ceiling 649 -> 769
CLAIM-SET.md              C1-C9, adjudication recorded, wording frozen
ENCODE.md                 reproducible commands, three redaction boxes, CRF reasoning
HANDOFF.md                this file
```

Both assets under precedent: video 892 KB against 949, poster 149 KB against 177. Adding the two
extra blur regions took the video from 933 KB to 892 KB — blurred areas carry less
high-frequency detail, so the redaction bought headroom rather than costing any.

### Rulings applied

- **Name.** "EQL Source Auras" on first mention, "Auras" after, throughout. The heading carries
  the first mention so the full name is the first thing a reader meets. I also renamed the asset
  files from `eqls-auras.*` to `auras.*` — a filename is reachable in view-source and the network
  tab, so it is somewhere a reader could meet an abbreviation the site otherwise never uses.
  The long-form name costs one word; the band is **120 words**, ceiling **769**.
- **C3 stays in full.** Cut #1 is marked approved in `COPY.md` and Session A may take it without
  asking, which would bring the band to 109 words and the ceiling to 758. Cuts #2 and #3 are
  marked unavailable with the reasoning attached, so nobody re-proposes them later.
- **C4's sentence held back, ready verbatim.** It sits in `COPY.md` under "Held in reserve",
  written out and sourced, with a second clause added — "It reads which window has focus, not
  anything inside the game" — so it lands as a complete answer rather than an admission needing
  follow-up. Kept free of digits so it can be dropped into any page without tripping the
  figure-near-hedge rule.
- **All three names blurred.** Owner's nameplate, guild tag and pet name now blurred alongside the
  third party's. Boxes verified static at three points across the cut; the camera does not move,
  so nothing drifts out from behind one. One detail worth knowing: at my first box width the pet
  blur clipped the leading digit of the pet's health and left a stray "00" on screen, which reads
  as a bug rather than a redaction. Narrowed until the health value survives intact.
- **CRF 32 approved, arc kept.** Recorded in `ENCODE.md` as a size precedent rather than a CRF
  precedent, with the full ladder, so the next person to touch this does not "restore" CRF 28.

---

## BLOCKING — rename the application before release

**Blocking, not deferred.** Carried by Session C. The band ships safely without it, because the
cut contains no application chrome; a downloadable binary does not.

The name lives in eight places. Three are page names, not the product name, and **must not be
touched** or the app's own navigation stops making sense.

**Change these eight:**

| File | Line | Current |
|---|---|---|
| `package.json` | 2 | `"name": "eq-buff-tracker"` |
| `package.json` | 3 | `"productName": "EQ Buff Tracker"` |
| `package.json` | 17 | `"appId": "com.example.eqbufftracker"` |
| `package.json` | 18 | `build.productName: "EQ Buff Tracker"` |
| `src/main/mainWindow.js` | 17 | `title: 'EQ Buff Tracker'` |
| `src/renderer/main-window/index.html` | 5 | `<title>EQ Buff Tracker</title>` |
| `src/renderer/main-window/index.html` | 21 | `<h1>EQ Buff Tracker</h1>` — the sidebar header |
| `src/renderer/overlay/index.html` | 5 | `<title>EQ Buff Tracker Overlay</title>` |

**Leave these alone** — "Buff Tracker" here is the name of a *page* inside the app:
`index.html` lines 22, 38, 126 and 786, and the comment at `buffEngine.js:710`.

**The trap, and it is a real one.** Electron derives `app.getPath('userData')` from `productName`.
Renaming silently moves the config directory from `AppData\Roaming\EQ Buff Tracker\` to a new
path, orphaning `config.json`, the widget store, loadout profiles, the buff store and the icon
cache. The app will start up looking factory-fresh with every widget gone. Nothing has shipped, so
the blast radius is one machine — but it is your machine, and it will happen on the first launch
after the rename unless the folder is moved first. `src/main/store.js:7` documents the old path in
a comment and wants updating in the same pass.

While in there: `appId` is `com.example.eqbufftracker`. `com.example.` is placeholder domain and
should become something real before an installer goes out.

---

## Roster-count drift — the fifth instance of the same fault

Documentation says the bundled roster is "~3300 entries". `src/shared/data/buffs.json` holds
**11,337 entries, every one uniquely named**. Stale by roughly a factor of three.

You called this the same fault hit five times: a hand-written figure beside computed truth. That
framing points at the fix. Patching "~3300" to "11,337" produces the sixth instance the next time
the roster is re-mined. The figure should not be hand-written at all — either the mining script
writes the count into the doc as it regenerates `buffs.json`, or the doc stops carrying a number
and points at the file. Cheapest durable version is a check that reads
`len(json.load(open('buffs.json')))` and fails when the documented figure disagrees, which is the
same shape as the gate that already guards the site's prose.

Not touched in this pass — it is a repo defect, independent of the band, and renaming is the
blocking item.

---

## Two other defects noted in passing

- **A dark rectangle sits at the top right of every frame of the source recording.** Hard-edged,
  constant position, opaque, floating over the game world. Most likely one of the configured but
  empty widgets (Ally Buffs / Timer 1 / buff 2) drawing an opaque background — a rendering bug,
  not a recording artefact. Cropped out of the deliverable, so the band is unaffected, but it will
  appear in any future footage taken before it is fixed.
- **Placeholder text is live in the settings UI**: the literal word "planned" sits where a value
  belongs beside three controls, "Not active yet." appears twice, a roadmap sentence lives inside
  the sounds pane, and a test widget named "buff 2" sits in the sidebar next to Self Buffs and
  Ally Buffs. Invisible in the band because no application chrome is in shot, but the settings
  panel is the second thing anyone will screenshot after release.

---

## Repository

Wired this session. `samusmylove47-maker/EQLSAuras`, public, `main` tracking `origin/main`. The
source ZIP and the two raw recordings are gitignored — the ZIP is 349 MB and exceeds GitHub's
100 MB per-file hard limit, and it carries `node_modules`, a 78 MB installer and a 180 MB packaged
exe. Commit identity is set repo-locally to the GitHub noreply address rather than the account
Gmail, since commit metadata on a public repo is permanent and indexed.

The application source is not in this repo — it exists only inside the ZIP. The rename above
therefore has nowhere to land yet. Say where the app source should live and I will put it under
version control before touching it, so the rename and the userData migration are revertible.

*Session C, 2026-08-18.*
