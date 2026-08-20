# HANDOFF — EQLS Auras (Session C)

The exchange below holds only what is still live. Applied rulings move into the standing sections
underneath and are deleted from the exchange.

Session A and Session B can read this file directly:
`curl -s https://raw.githubusercontent.com/samusmylove47-maker/EQLSAuras/main/HANDOFF.md`

---

## From the Director

*Rulings of 18 August applied. Sequencing note of 18 August applied — see below. Nothing
outstanding.*

---

## To the Director

### 1. Acknowledged: I work with Shara, not at her, and I stay out of A's way

Understood and adopted:

- **Direct with Shara until 23 August.** This closes my open item — I had findings prepared and no
  route to her.
- **Build with her, not propose at her.** Her project, her release, her design decisions. I bring
  findings and working code; I do not bring conditions.
- **No site changes from me during Session A's theme build.** If Shara wants something on the site
  in the next three days — the band, a download route, an app page — it routes to you first and you
  sequence it against the theme. Two sessions editing `build1.py` in one afternoon is exactly the
  collision to avoid, and I am not going near eql-source regardless.

**My outstanding spec is queued, not pending.** `proposed/SPEC-auras-band-network-sentence.md`
proposes edits to `band.html` and to the generator, which is precisely the collision class in your
note. It is yours to sequence whenever the theme build allows. I will not push it, chase it, or let
it turn into a reason to touch A's tree.

### 2. One hazard that survives the sequencing, and gets worse during it

**`docs/auras/band.html:7` still reads `<h2 class="feath">EQL Auras</h2>` — re-checked just now on
both `main` and `claude/eq-map-export-proposal-oe8m6l`.**

The generator still emits the correct `EQLS Auras` at `build1.py:368`, so nothing is wrong on the
page today. The risk is that a chrome rebuild touching the band, or any move to make the generator
read `band.html`, picks up the wrong name in passing. **Fix `band.html` before, or at the same time
as, anything that makes it authoritative.** Details in the spec; flagging it here because A is now
rebuilding every page's chrome and this is the moment it could slip through unnoticed.

### 3. Ready for Shara, the moment she wants it

Nothing sent, nothing assumed. Four things in `proposed/`, plus the findings list. The typeface
item leads with the fact that makes it her free choice: **self-hosting Poppins renders
identically** — it changes where a file comes from, not how anything looks.

Standing by for the archive, the plan and her prompt.

---

## Standing: working with Shara, 18-23 August

Direct channel. Findings and working code, never conditions. Her project, her release, her design.

Any site-side work she wants goes to the Director to sequence against Session A's theme build.
Session C does not write to `eql-source` and has no push access to `LoxyBee/EQLS-Auras`.

---

## Standing: release position

**NO-GO for describing Auras as released on 25 August — upheld by the Director on my evidence.**

Two findings, either sufficient, both reported as findings rather than conditions:

- profile-scoped aura visibility is shipped and its author has called it backwards; the fix touches
  `widgetStore.js`'s persisted data model, the semantics are not agreed, and there is no updater
- the core function silently drops buffs — confirmed against a real log dump, five named spells, no
  in-session recovery

**This governs our page, not her ship date.** The date is hers. What follows for us is only that we
print no date and do not describe it as released.

---

## Standing: the installer figure

**78,504,631 bytes — 74.9 MB**, read off `EQLS Auras Setup 0.1.0.exe`. The Director's 100.5 MB was
Sky Ledger's figure, misattributed. Mine is the only one ever read off the artefact it describes.
Publish it read at build time, never typed — same rule as the roster count.

---

## Standing: the userData pin — do not touch it

`src/main/main.js:24` pins userData to the original `EQ Buff Tracker` folder, above every local
`require()`:

    app.setPath('userData', path.join(app.getPath('appData'), 'EQ Buff Tracker'));

An earlier version sat below the requires and seeded a second, empty `widgets.json` while the real
state stayed in the old folder. Verified intact at `baea785`; the packaged app writes its real
state there. Covered by a seven-case regression test, mutation-tested against three deliberate
regressions including that one.

**No migration needed** — `1fe8fb4` changed no store filename, key, default or shape, and
`normalizeWidget` backfills the four new widget fields.

---

## Standing: naming — closed

**EQLS Auras** on first mention, **Auras** after. It pronounces "Equals Auras" and anchors the logo
family =Auras, =50Upgrades, =SkyLedger, which originated with Shara and is credited to her.

Residue in her tree, hers to take: `appId`, the sidebar `<h1>` duplicate, the `EQBT2-` share-code
prefix. Residue in ours: `band.html:7`, covered by the spec and still live.

---

## Standing: band material — landed

Adjudicated 18 August, C1-C9 frozen in `CLAIM-SET.md`. Landed at `0a3360d`, merged in `#96`.
Session A shipped its own encode (8.92 s / 24 fps / 839 KB against Session C's 6.8 s / 30 fps /
892 KB); `ENCODE.md` says so at the top. The trailer caption "9s, silent" is accurate.

The heading defect on the built page is fixed. The network sentence is the one live defect and the
spec corrects it.

---

## Standing: repositories

`samusmylove47-maker/EQLSAuras` — this one. Band material, this exchange, `proposed/` patches and
specs. No application source, nothing authored by the app's owner.

`LoxyBee/EQLS-Auras` — the application, owned by its author. **Canonical.** Read access only.

`samusmylove47-maker/eql-source` — Session A's. Read only, and hands off entirely while the theme
build runs.

*Session C, 2026-08-18.*
