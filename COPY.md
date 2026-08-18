# Band copy — EQLS Auras

**Status: SUPERSEDED ON THE PAGE, CORRECTED HERE.** Session A landed its own rewrite of this copy
on 2026-08-18 (`0a3360d`). This file remains the adjudicated reference and the record of what was
approved; it is not a description of what shipped. See *What actually shipped* at the foot.

**Name: "EQLS Auras" on first mention, "Auras" after.** Reverted from "EQL Source Auras" after the
owner overruled that ruling. EQLS is not an abbreviation to be avoided — it is the product name.
It pronounces "Equals Auras" and anchors a logo family the owner is designing: =Auras,
=50Upgrades, =SkyLedger.

**Timing: the band may land after the drop.** The copy is not to be compressed in a rush.

House voice. British spelling. No digits anywhere. No braces. No exclamation marks. Claim-by-claim
backing is in `CLAIM-SET.md`.

---

## The copy, as adjudicated

> ### EQLS Auras is coming
>
> *[video: Auras running over EverQuest Legends — poster frame below 700px and under
> prefers-reduced-motion]*
>
> Auras is a Windows overlay that puts countdown timers for your own buffs on top of EverQuest
> Legends, so you can see what is about to drop without looking away.
>
> It reads files already on your disk — your log, your spellbook, and the game's own icon art.
> It does not read or write the game's memory, and it puts no code inside the client.
>
> It is modelled on WeakAuras, the World of Warcraft addon, but written from scratch rather than
> ported, and is not affiliated with or endorsed by its authors.
>
> We are targeting next Tuesday's maintenance for the first release. The video is what exists
> today; the date is a target, not a promise.

---

## Word count

| Part | Words |
|---|---|
| Heading — "EQLS Auras is coming" | 4 |
| Paragraph one — what it does (C1) | 30 |
| Paragraph two — what it reads, what it does not touch (C2, C3, C4) | 34 |
| Paragraph three — WeakAuras credit (C5, C6, C7) | 27 |
| Paragraph four — release target (C8, C9) | 24 |
| **Total** | **119** |

119 words, not the 120 of the "EQL Source Auras" draft — the short name gives the word back. The
ceiling this version would need is **768**. Session A raised the live ceiling to **787** for its
own longer rewrite, so there is headroom either way and no ceiling work is outstanding.

---

## The only cut available

1. **APPROVED, but not a schedule concession — drop ", so you can see what is about to drop
   without looking away"** — saves 11 words. The first clause alone still explains the product to
   a stranger, and this is the only ornamental phrase in the band. Take it only if the ceiling
   argument is genuinely contested, never to save time.
2. **OVERRIDDEN — keep "and the game's own icon art".** C3 stays in full: naming only the log
   would be incomplete, and a reader who noticed the app opening their spellbook or reading their
   install's icon art would be right to call it an overclaim.
3. **REFUSED — keep "The video is what exists today".** It is the link between the evidence and
   the claim, which is the point of leading with the video.

**Do not cut** the memory sentence, the "from scratch rather than ported" clause, the
non-affiliation clause, or the word "targeting". Each is there because of a rule this site holds,
not because it reads well.

---

## Held in reserve — the foreground-check sentence

**Ruled: hold back, keep ready verbatim.** A bored Discord during maintenance is exactly where
someone runs Process Monitor, and the answer arriving immediately is worth more than the sentence
arriving pre-emptively.

Deploy this, exactly as written, the moment anyone asks:

> Auras asks Windows, twice a minute, which application is in front, so the overlay can hide
> itself when you alt-tab away. It reads which window has focus, not anything inside the game.

Backing: `foregroundWatcher.js` — an inline PowerShell `Add-Type` snippet on a two-second interval
calling `GetForegroundWindow()` and `GetWindowThreadProcessId()` from `user32.dll`, then
`Get-Process` on the returned PID, matched against the process name `eqgame`. It opens no handle
to the game process and reads no game memory.

"Twice a minute" rather than "every two seconds" keeps the sentence free of digits, so it drops
into any page without tripping the figure-near-hedge rule.

---

## What actually shipped, and the one thing wrong with it

Session A wrote its own copy rather than using this verbatim, which was its call to make. The
landed prose is **factually sound** — I re-verified it against the application source at
`LoxyBee/EQLS-Auras` `c7f7f4e`:

- *"It makes no network requests of its own"* — a claim I had cut and the Director approved
  cutting. Session A's version survives where mine would not have, because **"of its own"** does
  the work: it claims only for code the project wrote, not for Chromium. Zero network code in
  `src/`, no updater, no crash reporter, no third-party runtime dependency. **Backed.**
- *"or send it input"* — a claim not in the adjudicated set, so I checked it: no `SendInput`,
  `keybd_event`, `mouse_event`, `PostMessage`, `SetCursorPos` or `robotjs` anywhere in the tree.
  The only input-adjacent call is `setIgnoreMouseEvents(win, { forward: true })`, which makes the
  overlay decline to capture clicks rather than sending any. **Backed.**
- *"9s, silent"* — the landed asset measures 8.92 s with no audio stream. **Accurate.**

**The one defect: the heading reads "EQL Source Auras". The product is "EQLS Auras".**

This is not Session A's error — that was the correct name when it landed, and the ruling reversed
afterwards. But the page is live now and it misnames the product it is announcing, which is the
precise fault the site exists not to commit.

**The fix is one string**, in the band heading in `public/index.html` (and its source template):

    EQL Source Auras   ->   EQLS Auras

Nothing else in the landed copy refers to the product by name, so nothing else needs touching. It
shortens the page by one word, so no ceiling change is required. Session A owns that file.

**Do not** change the asset filenames. `auras-trailer.mp4` and `auras-poster.jpg` use the approved
short form and are already content-hashed into `public/`; renaming them would churn the hash for
no reader-visible gain. My earlier reasoning for stripping an `eqls-` prefix from filenames is
void — it rested on EQLS being an internal abbreviation, which it is not.
