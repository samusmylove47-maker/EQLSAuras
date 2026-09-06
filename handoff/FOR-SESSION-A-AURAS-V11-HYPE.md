# =Auras v1.1 hype package — for Session A

**Session C, 5 September 2026.** Seven screenshots retrieved from Shara's repo, five of them
cleared to publish, two held. Four figures on the live page are wrong and one of them is mine.

**Measured at `LoxyBee/EQLS-Auras@8da2cc88` (current master) and `eql-source@f98e7cd0`, read-only.**
I have not written to Shara's repository and will not.

---

## 0. TWO THINGS THAT CORRECT THE BRIEF BEFORE ANYTHING ELSE

**THERE ARE NO VIDEOS.** Not on master, not on any branch, not as a release asset, no LFS
pointers. `docs/HIGHLIGHTS.md`'s `## Videos` section names three and **none has been captured.**
Do not reference, embed, tease, or imply a demo reel. **The only moving asset in existence is the
18 August `auras-trailer.mp4` already on our site.**

**THE SCREENSHOTS ARE NOT NEW.** They landed at `42c50c66` on **3 September**, before `ff3fccf9`
— so they were already in the repo yesterday and I did not spot them, because yesterday's sweep
did not re-enumerate media. **Version 1.1.0 is also not new:** it landed at `73cbf3ce`, also
3 September. The nine commits since yesterday are code, tests and docs.

**Neither changes what to do. Both change what to say** — nothing here should be framed as "just
shipped".

---

## 1. FOUR DEFECTS ON THE LIVE PAGE, AND THE FIRST ONE IS MINE

| # | Live | Correct | Where |
|---|---|---|---|
| 1 | **`1,067 spells known`** | **1,066** | `public/index.html:121` |
| 2 | `53 stacking slots` | **56** | `:121`, `assets/auras.json:52`, `docs/auras/BAND-COPY.md:143` |
| 3 | `Out now · version 1.0` | **version 1.1** | `:116`, `assets/auras.json:44` |
| 4 | `Stop alt-tabbing to check your buffs.` | **withdrawn by Shara** | `:118` |

**#1 is mine and it is the shape I keep hitting.** `src/shared/data/buffs.json` holds **1,067**
entries. The loader at `src/main/buffStore.js:51` drops every entry with `durationSec > 18000`,
and exactly one qualifies. **So the app loads 1,066.** Both numbers are real; only one is the
population the sentence names. I gave you the raw file count and labelled it as what the app
knows. **Same for the icon figure if it is ever printed: 1,050 of 1,066 loaded, not 1,051 of
1,067 raw.**

**#4 is the one to check with the owner.** Shara **deleted** "Stop alt-tabbing to check your
buffs" from her pitch at `fdf623a7`, 3 September. Her current one-liner is:

> **A countdown timer for every buff you're running, right on top of the game. Read straight from
> your EverQuest Legends log.**

**We are publishing a sentence its author retired.** The band below uses her current line verbatim.

**Still correct, re-measured today, change nothing:** the download URL, **79.1 MB**
(79,136,781 bytes), **100+ zones routed** (the graph holds 104), **15 sounds**, the trailer and
poster, and the three privacy clauses.

**The band is `handoff/auras-v11-band.html`.** Lift the markup from there. It replaces
`public/index.html` lines **103–158** and needs no move — placement is already right.

---

## 2. THE SEVEN SCREENSHOTS — FIVE CLEARED, TWO HELD

**Five are vendored in `handoff/release-images/` in this repo**, byte-identical to hers, with
sha256s at the bottom of this file.

| # | File | Shows | Native | Slot (her `RELEASE-PAGE.md`) |
|---|---|---|---|---|
| 2 | `02-list-aura.png` | List-view aura: 13 buff rows, Resist Magic 47m → Shield of Words 106m | 322×408 | `## Overlays` — **Icon grid or list.** |
| 3 | `03-add-aura.png` | The Add-an-aura menu: Timers and Event Alerts premades | 985×731 | `## Custom and premade auras` — **Premades for the common stuff.** |
| 5 | `05-travel-popup.png` | "Where are you going?" destination picker over the game | 637×474 | `## Travel` — **Zone-by-zone routes.** |
| 6 | `06-travel-route.png` | Route overlay: Cast North Ro Gate 1/3 → Go to East Freeport 2/3 → Portal to The Plane of Sky 3/3 | 390×264 | `## Travel` |
| 7 | `07-stances.png` | Gems config panel, 12 spell gems in a 4×3 grid | 755×468 | `## Action bars` — **Skin your hotbar.** |

### HELD — both render the owner's real character name

| # | File | What is visible | Recoverable? |
|---|---|---|---|
| 1 | `01-hero.png` | **"Shara" as a large nameplate at frame centre**, with the guild tag `<Valor>` directly beneath it | **No.** The name is the floating nameplate over her own character, mid-frame. A crop that removes it removes the subject. |
| 4 | `04-lockouts.png` | **"Shara"** as the selected value of the Character dropdown, top-left | **Yes** — the dropdown is one small rectangle. Croppable, or re-shot on a differently-named character. |

**I have not copied either into this repo.** That mirrors what you did with Session B's two
=Upgrades shots on 3 September, and for the same reason.

**Two honest qualifications, because the hold should rest on the real reason:**

1. **This is not containment.** Both images are already public in `LoxyBee/EQLS-Auras`, which is a
   public repo. **The hold is about not putting the owner's character name on the front page of
   eqlsource.com** — the norm you applied to B's shots — not about a secret.
2. **These are the owner's own characters, so this may be entirely fine.** I am not calling it a
   leak and it is not my call. **But it cannot be both:** either B's shots did not need holding,
   or these two do.

**`04-lockouts.png` carries a second thing even if the name is cropped:** the grid publishes a
real dated raid history — *"This period: Aug 25 – Sep 1, 2026"* with dated kill cells (Lady Vox
Aug 29, Master Yael Aug 29, Plane of Fear Aug 30–31, Plane of Hate Aug 30). **Worth a glance
before it ships even redacted.**

### The hero problem, stated plainly

**Holding `01-hero.png` costs the package its hero, and there is a second reason not to use it
anyway: it is 1123×710.** The site's existing band poster is **1600×900**. Using it as a wide hero
needs a **1.42× upscale** and **78px cropped** off the height to reach 16:9. **It is a native
screenshot, not a hero render.**

**So the band below keeps the existing trailer and poster**, which are clean, already hashed into
`assets/media.json`, and correctly sized. **The five cleared screenshots belong on `/auras`, in
the sections her `RELEASE-PAGE.md` assigns them to** — not in the band.

**If the owner wants a real hero:** the cheapest route is Shara re-shooting `01-hero` on a
character whose name is not hers, at 1600×900. That is one capture, and it unblocks both the hero
and `04`.

---

## 3. WHAT MUST NOT BE PROMOTED — all re-checked at `8da2cc88`

| Thing | Why |
|---|---|
| **Aggro Board** | Locked out of Add Aura, `main-window.js:4641` — `LOCKED_MODULE_AURAS = new Set(['aggro-board'])` |
| **Buff Planner** | Badged `exp` in the UI; the project's own teardown calls it guess-weighted |
| **Pull Timer panel** | `RELEASE-PAGE.md:23` — "module — private, not advertised". It does not even ship (`docs/` is outside `build.files`) |
| **'Combat state' trigger** | Ships disabled behind a **Planned** badge |
| **'Track buffs cast on me by others'** | **Experimental** badge; its own tooltip warns "expect some wrong guesses" |
| **'Use cast-time-aware confirmation'** | **Experimental** badge, off by default |
| **The three videos** | None captured. Zero video assets exist |
| **Screenshots 6, 7, 10 of her wishlist** | Custom trigger, share-code dialog, sound picker — never captured. Only 7 of 10 exist |
| **`## Screenshots` / `## Videos` / `## Writing copy` in HIGHLIGHTS.md** | Internal build notes; `RELEASE-PAGE.md:25-26` says they do not render |
| **"11,337 buffs"** | Still archived in `BAND-COPY.md`. Overstates by 10.6× |
| **"makes no network requests of its own"** | False — the main window fetches a typeface at launch |
| **`docs/auras/band.html`** | Stale 18 Aug file, still says "EQL Auras". No generator reads it |

**One nuance worth a line, because it bounds a claim rather than breaking it.** The published
sentence *"does not read or alter the game's memory, inject code into it, or send it input"* is
**still true** — all fifteen memory/injection/input APIs are absent at `8da2cc88`, control-checked.
**But `foregroundWatcher.js:350-365` does call `ShowWindow` and `SetForegroundWindow` on the game's
window** to bring EQ forward. That is window management, not memory access, code injection or
input. **So the sentence stands as written — but nobody should upgrade it to "never touches the
game" or "purely passive".**

**Also: a new feature landed after I measured** — `a0ce581c`, *"damage/heal meter overhaul"*.
**It is not in `HIGHLIGHTS.md`, so no approved copy exists for it.** I have not written any.

---

## 4. TWO THINGS I CANNOT SETTLE FROM HERE

**The installer's provenance.** The `latest-dev` **git tag** resolves to a commit **328 behind**
current master, while the **asset's** `updated_at` is 2026-09-06. **The tag ref and the binary
disagree**, and the API exposes no build provenance. **The download works and is current by asset
date — but do not write "this is the v1.1.0 build", because I cannot show that.**

**Whether the exclusion of the share code and sound picker extends to their prose.**
`RELEASE-PAGE.md:23` excludes them **as screenshots**. `HIGHLIGHTS.md:43` and `:49` still carry
their bold lead-ins as public copy. **Unresolved in her own docs — ask the owner rather than
guessing either way.**

---

## 5. FILE MANIFEST

```
handoff/auras-v11-band.html                  the drop-in band, replaces index.html 103-158
handoff/FOR-SESSION-A-AURAS-V11-HYPE.md      this file
handoff/release-images/02-list-aura.png      33713c01c3205bc9d83222f90f657b05b35f254a050977104733c4550853f18e
handoff/release-images/03-add-aura.png       c20a1696bfbe46f6fad0eabbb3254b17e3b624ac1b34f1bbcccce6f370bdcbdb
handoff/release-images/05-travel-popup.png   a68b18cdf36cdc3e11bdc04a6fd33c909e59b12d7e8c6947b29cb7a5e7eb4abc
handoff/release-images/06-travel-route.png   767b9cafebe5e4abc7be3924a3bdd9bbf0c471350c8c633c0e6831e8c5d595e3
handoff/release-images/07-stances.png        8aa710c205a71bbe639ec2790d9a12bc333f1dc837a9b28b3073b20a4fd499fb
```

**Held, deliberately absent, fetch from her repo only if the owner clears them:**
`LoxyBee/EQLS-Auras@8da2cc88 : docs/release-images/01-hero.png` and `04-lockouts.png`.

**Download, verified today:**
`https://github.com/LoxyBee/EQLS-Auras/releases/download/latest-dev/EQLS-Auras-Setup.exe`
— 79,136,781 bytes, **79.1 MB** decimal, matching the site's convention.

---

*Session C, 5 September 2026. Every figure re-derived at `8da2cc88`; the population of each count
is named beside it, because on this project the number has usually been right and the population
wrong.*
