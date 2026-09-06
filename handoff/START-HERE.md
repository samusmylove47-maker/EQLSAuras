# START HERE — Session A, =Auras website work

**Session C, 5 September 2026.** Read this first. Everything is reachable at
`https://raw.githubusercontent.com/samusmylove47-maker/EQLSAuras/main/<path>`.

**Three things changed after my first drop, so read this file even if you read the earlier ones.**

---

## WHAT CHANGED

**1. THE HERO IS CLEARED.** The owner has ruled: *"Shara's name is fine, it's her own screenshot of
her app."* **`01-hero.jpg` ships as-is, name and guild tag included.** My earlier hold is
withdrawn. **The ruling covers HER name in HER screenshot and nothing wider** — if any other asset
shows a name that is ours rather than hers, that is a separate question.

**2. THE FORMAT PASS IS DONE, not described.** Your finding reproduced exactly — four of the seven
were photographic content in PNG at 1.05–1.74 B/px against the site poster's 0.12. **I re-encoded
those four to progressive JPEG q85 and left the three flat-UI shots as PNG.** The build refuses to
re-encode by policy, so these are ready to drop in:

```
                          Shara's PNG    what ships   saving   B/px
  01-hero.jpg               1,089,162      166,862      85%    0.21
  02-list-aura.jpg            138,238       37,464      73%    0.29
  05-travel-popup.jpg         370,712       58,363      84%    0.19
  06-travel-route.jpg         178,741       25,752      86%    0.25
  03/04/07 .png  (flat UI, correctly PNG, untouched)   207,198
                          ───────────   ──────────   ──────
  whole set                 1,984,051      560,241      72%
```

**The hero is no longer the largest asset on the site.** I eyeballed the hero JPEG at native size
before shipping it — buff text still legible, no visible artefacts.

**3. THE BAND NO LONGER PUBLISHES FIGURES.** Applying your ruling — *guard it or stop publishing
it* — **I dropped the stat strip and the version.** Two of its four figures had already drifted
within two days despite provenance records in `assets/auras.json`. **`auras-v11-band.html` carries
both options in a comment: the build-time derivation with exact source paths if you want them
back, and the reason I recommend shipping without them today.**

---

## READ IN THIS ORDER

| # | File | What it is |
|---|---|---|
| 1 | `handoff/FOR-SESSION-A-AURAS-PAGE-DECK.md` | **The main deliverable.** Shara's page copy verbatim, her image placement, what does not fit. §7 is today's addendum. |
| 2 | `handoff/auras-v11-band.html` | **Drop-in markup**, replaces `public/index.html` 103–158. The comments carry the figure decision. |
| 3 | `handoff/release-images/` | Eight files, all cleared, format-corrected. |
| 4 | `handoff/FOR-SESSION-A-AURAS-V11-HYPE.md` | Background on the four wrong live figures. **Its "held images" section is now superseded by item 1 above.** |

**Ignore:** `FOR-SESSION-A-AURAS-LAUNCH.md` and `auras-launch-band.html` (3 Sep, superseded).
`auras-claims-corrections.patch` already landed.

---

## THE ONE THING STILL WAITING ON THE OWNER

**The share-code line.** `RELEASE-PAGE.md:23` excludes "share code" while `HIGHLIGHTS.md` carries
it as finished feature copy. **I held it rather than guess** — deck §4 sets out both readings. The
two sound lines I cleared, judging that her exclusion names the sound *picker* (a screenshot never
taken) rather than the sound *feature*. **Say if you read that differently.**

---

## ONE FLAG THAT IS NOT ABOUT A NAME

**`04-lockouts.png` is cleared for the name and still worth a glance.** Beyond "Shara" in the
dropdown, the grid publishes a **real dated raid history** — *"This period: Aug 25 – Sep 1, 2026"*
with dated kill cells. **The owner's ruling was about the name; it did not mention this.** Not a
blocker, and not mine to decide.

---

## THREE THINGS THAT MUST NOT REACH THE PAGE

- **No videos exist.** Zero on master, on any branch, or in the release assets. `## Videos` is a
  brief, not a manifest.
- **Aggro Board, Buff Planner, Pull Timer panel, Combat-state trigger, two Experimental toggles** —
  locked, badged or private. Full list in deck §5.
- **"makes no network requests of its own"** and **"11,337"** — both false, both already flagged in
  `assets/auras.json`.

**And one claim to keep as written:** *"does not read or alter the game's memory, inject code into
it, or send it input"* is **true** at `8da2cc88`, fifteen APIs absent and control-checked. But
`foregroundWatcher.js:350-365` calls `ShowWindow`/`SetForegroundWindow` to raise the game window —
**so do not upgrade it to "never touches the game".**

---

*Session C. Measured at `LoxyBee/EQLS-Auras@8da2cc88` and `eql-source@f98e7cd0`, read-only.
Nothing written to Shara's repository.*
