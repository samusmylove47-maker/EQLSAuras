# HANDOFF — EQLS Auras (Session C)

The exchange below holds only what is still live. Applied rulings move into the standing sections
underneath and are deleted from the exchange.

---

## From the Director

*Nothing outstanding. Orders of 18 August are executed; results are in the report below.*

---

## To the Director

**GO for Tuesday 25 August 2026, conditional.** Nothing I found is a code blocker. Everything
outstanding is release packaging, and all of it is hours of work rather than days. Conditions at
the end of this section.

Verified against `LoxyBee/EQLS-Auras` at **`baea785`** — my previous `c7f7f4e` baseline was already
stale. She merged PR #1 at 16:16 UTC today, "Custom alert sounds, aura terminology, and
detection/settings fixes", touching `main.js`, `widgetStore.js` and the whole renderer. A
terminology rename is exactly what can silently break saved state, so I re-verified from the new
HEAD rather than trusting the old read.

### 1. Rename — verified in the BUILT app, not from source

Installed dependencies, ran `npm run dist`, ran the packaged binary.

| Surface | Observed | Settled | |
|---|---|---|---|
| installer | `EQLS Auras Setup 0.1.0.exe` | EQLS Auras | ok |
| window title | `EQLS Auras` | EQLS Auras | ok |
| overlay window | `EQLS Auras Overlay` | — | ok |
| taskbar / process | `EQLS Auras` | EQLS Auras | ok |
| `productName` | `EQLS Auras` | EQLS Auras | ok |
| **sidebar heading** | **`EQLS Auras`** | **`Auras`** | **residue** |
| **`build.appId`** | **`com.eqlsource.eqlsauras`** | **`com.eqlsource.auras`** | **residue** |

Window titles were read by enumerating the process's real top-level windows, not from source.

**The appId is the time-sensitive one.** It is the NSIS upgrade identity and the registry uninstall
key. Changing it now costs nothing. Changing it after anyone installs means a later build is not
recognised as an upgrade — the user ends up with two copies side by side and two uninstall entries.
Free today, expensive on Wednesday.

Both are one-line changes, prepared as `proposed/B-naming-residue.patch`. **Not applied — Shara's
call.**

A third thing, cosmetic and entirely hers: the terminology rename is half-migrated in the UI. The
nav reads "Overlay Auras" and "+ Add aura" beside "Buff Tracker" and "Self Buffs", and one Setup
paragraph uses "buff" and "aura" in consecutive sentences. Her handoff says the rename was "UI text
only, by explicit user choice", so this may be deliberate staging rather than an oversight.

### 2. The pin — untouched, and I did not touch it

`app.setPath('userData', ...)` is intact at `main.js:24`, still pinned to `EQ Buff Tracker`, still
above every local `require()`. The new commit did not modify it.

One correction worth recording, because it nearly became a false alarm from me: my first ordering
check reported the pin as **mis-ordered**. It was wrong. The comment block above the pin contains
the text `require('./widgetManager')` as an example of what must not appear above it, and a naive
scan matches that comment. The pin is fine. I mention it because the regression test below had to
be written to survive exactly that trap — it strips comments before reasoning about order.

### 3. userData — tested, and the deliverable is a regression test

**Saved state survives the completed rename. Proven twice, empirically.**

First, in the real packaged app. This machine had no Auras userData beforehand. I ran the built
binary and it created **`%APPDATA%\EQ Buff Tracker`** — the pinned folder — containing
`buffs.json`, `profiles.json`, `widgets.json`, `buffsMeta.json` and
`selfAmbiguousResolutionsByProfile.json`. Not a new folder. The pin works in the shipped artefact,
not merely in source. I removed the directory afterwards; the machine is as I found it.

Second, as a test — `proposed/userdata-pin.test.js`. Seven cases, zero dependencies, plain `node`,
no framework, since the project has none and should not gain one:

```
ok  main.js pins userData, and pins it to the original folder name
ok  the pin runs BEFORE any local require()
ok  nothing else repoints userData
ok  saved state written under the old folder still loads after the rename
ok  without the pin the app would read a different folder (proves the pin is load-bearing)
ok  a stale folder named after the current product is NOT preferred over the pinned one
ok  a widget saved before the alert-sounds fields still loads, with defaults filled in
```

**I mutation-tested it, because a test that cannot fail is worth nothing.** Three deliberate
regressions, each caught, green again on revert:

- pin moved below the requires — *the exact bug that already happened once* — caught, exit 1
- pin repointed at the current product name — caught
- a new persisted field left out of `normalizeWidget` — caught

That last case matters beyond the pin. The alert-sounds work added `landSoundId`, `expireSoundId`,
`warningSoundId` and `alertVolume` to every widget. `normalizeWidget` defaults all four
(`widgetStore.js:279-282`), so widgets saved before that commit still load — `alertVolume` falls
back to 100 rather than `undefined`, which would otherwise mute or NaN the alert. Correct today,
and the test keeps it correct. Custom sounds are copied into `userData/customSounds`, so they sit
under the pin too and survive renames.

**No migration is needed. Do not write one.**

### 4. THE DATE — 25 August holds

Plainly: **yes, as of today.** The engineering is in better shape than the packaging.

- the app builds, packages and runs at HEAD — I did all three today
- saved state is safe, proven above
- her own handoff lists no unresolved blocker; known limitations are marked "unchanged, no action
  needed", and the two bugs found this session were fixed and verified live

The website's "next Tuesday's maintenance", published 18 August, resolves to 25 August. Consistent.
**No slip to report.** If that changes I will say so here, dated, rather than let anyone infer it.

### 5. SIZE — read off the built package

**`EQLS Auras Setup 0.1.0.exe` — 78,504,631 bytes (74.9 MB).** NSIS, single file, unsigned.

Read from the artefact. If the site ever quotes a size it should read it at build time rather than
carry a typed number, for the same reason the roster count should not be hand-written.

### 6. `npm run dist` fails silently — the finding I was not looking for

The first build **exited 0 and produced no installer.** Only `win-unpacked` and a debug yml.

The cause is the `winCodeSign` issue her CLAUDE.md already documents: electron-builder unpacks a
macOS signing archive even for an unsigned Windows build, and two `.dylib` symlinks fail without
Developer Mode. Her documented workaround fixed it — extract the archive with `darwin*` excluded
into the cache — and the second run produced the installer.

The documented part is the failure. The undocumented part is that **it reports success while
producing nothing.** This machine's cache holds sixteen half-extracted attempts dating to 16
August, so it has been failing quietly and repeatedly here. On her machine the cache is warm and it
works, which is exactly why this could go unnoticed until release day on a clean machine or in CI.

Worth a one-line guard in the `dist` script asserting the installer exists afterwards. I have not
written one — it is her build script.

### 7. First-release gaps, none of them code

- **no icon configured.** `build.icon` unset, no `.ico` in the tree, so installer and installed app
  both carry the default Electron icon. Visible, and awkward for a product whose logo family is
  being designed right now.
- **installer is unsigned** — `Get-AuthenticodeSignature` reports `NotSigned`. Windows SmartScreen
  will warn every first-time downloader. A certificate cannot realistically be obtained and
  seasoned by Tuesday, so the right move is to **say so in the release notes** rather than let a
  game community discover it and ask whether the download is malware. That sentence is cheap and
  buys a lot of goodwill.
- **no LICENSE and no README.** For software other people install, and on a project whose standard
  is crediting outside work by name, shipping without a licence is a gap.
- two zero-byte files, `2188` and `3792`, are tracked in the repo root.

### Conditions on the GO

Blocking, in order, all small: appId corrected before anyone installs; the SmartScreen warning
acknowledged in the release notes; a LICENSE chosen. Strongly wanted: an icon. Everything else can
follow the release.

### The =Auras mark

**Nothing drawn.** The slot is left for Session A to design centrally in the site's design system,
proposed before Tuesday, landing only once Shara and the owner approve. I have produced no mark, no
placeholder, and no glyph that could ship by accident.

### What needs Shara's consent

Two patches in `proposed/`, neither applied. No push access needed or used; her tree is untouched
and my clone is clean.

- `A-userdata-regression-test.patch` — the seven-case test plus an `npm test` script. The project's
  first test. No dependencies.
- `B-naming-residue.patch` — `appId` to `com.eqlsource.auras`, sidebar `<h1>` to `Auras`.

---

## Standing: naming — closed

The product is **"EQLS Auras"** on first mention, **"Auras"** after. EQLS is not an abbreviation to
be avoided; it is the name. It pronounces "Equals Auras" and anchors a logo family the owner is
designing — =Auras, =50Upgrades, =SkyLedger.

Session C called the rename to "EQLS Auras" wrong. It was right.

Residual naming work is two one-line changes, recorded in the exchange above.

---

## Standing: the userData pin — do not touch it

`src/main/main.js:24` pins Electron's userData directory to the original `EQ Buff Tracker` folder,
above every local `require()`:

    app.setPath('userData', path.join(app.getPath('appData'), 'EQ Buff Tracker'));

Load-bearing, and it has already earned its place: an earlier version sat *below* the requires and
silently seeded a second, empty `widgets.json` under the new folder while buffs, profiles and
spellbook stayed in the old one. Her `CLAUDE.md` records that a future rename must leave it alone.

Verified intact at `baea785`, and now covered by a regression test that fails if it is moved,
repointed, or duplicated elsewhere.

---

## Standing: band material — landed

Adjudicated 2026-08-18, C1 through C9 approved as worded, wording frozen in `CLAIM-SET.md`. The
band landed at `0a3360d`, merged in `#96`. Session A wrote its own copy and shipped its own encode
(8.92 s / 24 fps / 839 KB against Session C's 6.8 s / 30 fps / 892 KB); `ENCODE.md` states this at
the top so nobody reproduces the recipe and wonders why the bytes differ.

The landed copy is factually sound — its two claims outside the adjudicated set ("no network
requests of its own", "or send it input") were both verified against the application source.

**One defect remains on the live page:** the band heading reads "EQL Source Auras". It should read
"EQLS Auras". Correct when it shipped; wrong now. One string, `public/index.html`, Session A's file.

---

## Standing: defects in the application

**Roster-count drift — the fifth instance of a hand-written figure beside computed truth.** Docs say
"~3300 entries"; `src/shared/data/buffs.json` holds **11,337, every one uniquely named**. Recorded
rather than patched: changing the number produces the sixth instance at the next re-mine. The figure
should not be hand-written at all — either the mining script writes it, or the doc points at the
file. A check reading `len(json.load(open('buffs.json')))` that fails on disagreement is the same
shape as the gate already guarding the site's prose.

**Placeholder text live in the settings UI.** The literal word "planned" where a value belongs, and
"Not active yet." Invisible in the band because no application chrome is in shot; the settings panel
is the second thing anyone screenshots after release.

---

## Standing: repositories

`samusmylove47-maker/EQLSAuras` — this one. Band material, this exchange, and `proposed/` patches.
No application source and nothing authored by the app's owner.

`LoxyBee/EQLS-Auras` — the application, owned and maintained by its author. **Canonical.** Session C
has read access only and has never written to it. Anything landing there goes as a proposed patch
with her explicit consent.

`samusmylove47-maker/eql-source` — Session A's. Read to verify what landed; never written to.

The ZIP in this working directory is a stale transfer artefact and is not a source of truth.

*Session C, 2026-08-18.*
