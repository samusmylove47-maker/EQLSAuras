# START HERE — Session A, =Auras website work

**Session C, 5 September 2026.** Read this file first; it is short and it tells you what to read
and in what order. **Everything below is reachable at**
`https://raw.githubusercontent.com/samusmylove47-maker/EQLSAuras/main/<path>`.

**I cannot message you.** `SendMessage` is unavailable in my session and your session is offline,
so this repo is the channel. **If you are reading this, the handoff worked.**

---

## READ IN THIS ORDER

| # | File | What it is |
|---|---|---|
| 1 | `handoff/FOR-SESSION-A-AURAS-PAGE-DECK.md` | **The main deliverable.** Shara's own page copy, her image placement, the hero problem and its salvage, and what does not fit. |
| 2 | `handoff/FOR-SESSION-A-AURAS-V11-HYPE.md` | **Four figures on the live page are wrong.** Includes the one that is my error. |
| 3 | `handoff/auras-v11-band.html` | **Drop-in markup.** Replaces `public/index.html` lines 103–158. Lift it; do not retype. |
| 4 | `handoff/release-images/` | Six images, cleared to publish, sha256s in the deck. |

**Superseded, ignore unless you want history:** `FOR-SESSION-A-AURAS-LAUNCH.md` and
`auras-launch-band.html` (3 Sep). `auras-claims-corrections.patch` already landed.

---

## THE FOUR THINGS THAT ARE WRONG ON THE LIVE PAGE RIGHT NOW

| Live | Correct |
|---|---|
| `1,067 spells known` | **1,066** — the loader drops one entry. **This one is mine.** |
| `53 stacking slots` | **56** |
| `Out now · version 1.0` | **version 1.1** |
| `Stop alt-tabbing to check your buffs.` | **Shara deleted that sentence on 3 Sep.** Her current pitch line is in the deck. |

All four are fixed in `auras-v11-band.html`.

---

## TWO THINGS THAT NEED THE OWNER BEFORE YOU SHIP THEM

**1. The hero.** `01-hero.png` renders the owner's real character name at frame centre with a guild
tag. **Every 16:9 crop of it contains the name** — I tested. I have supplied
`00-hero-candidate-CROPPED.png`, a clean 1123×254 banner that loses the name entirely, **but it is
a derivative of Shara's asset that I made and she has not seen it.** It is also a banner, not a
hero — do not stretch it into a 16:9 slot. **The real fix is one re-shoot with nameplates off.**

**2. The share-code line.** Her `RELEASE-PAGE.md:23` excludes "share code" while her
`HIGHLIGHTS.md` carries it as finished feature copy. **I held it rather than guess.** §4 of the
deck explains both readings.

**`01-hero.png` and `04-lockouts.png` are deliberately NOT in this repo.** Both render "Shara".
Fetch them from `LoxyBee/EQLS-Auras@8da2cc88 : docs/release-images/` only if the owner clears them.

---

## THREE THINGS THAT MUST NOT REACH THE PAGE

- **No videos exist.** Zero on master, on any branch, or in the release assets. Do not build a
  frame that needs one.
- **Aggro Board, Buff Planner, Pull Timer panel, Combat-state trigger, two Experimental toggles** —
  all locked, badged or private. Full list in the deck, §5.
- **"makes no network requests of its own"** and **"11,337"** — both false, both already flagged in
  `assets/auras.json`.

---

*Session C. Everything measured at `LoxyBee/EQLS-Auras@8da2cc88` and `eql-source@f98e7cd0`,
read-only. I have not written to Shara's repository and will not.*
