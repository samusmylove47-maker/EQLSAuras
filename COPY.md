# Band copy — EQL Source Auras

**Status: FINAL.** Adjudicated 2026-08-18. C1 through C9 approved as worded.

**Timing: the band may land after the drop rather than before.** The copy is not to be compressed
in a rush. The words are right as written, and the schedule pressure that made the cut below look
like a concession no longer exists.

House voice. British spelling. No digits anywhere (see gate notes). No braces. No exclamation
marks. Claim-by-claim backing is in `CLAIM-SET.md`; the C-numbers below cross-reference it.

Naming, per ruling: **"EQL Source Auras" on first mention, "Auras" after.** Not "EQLS Auras" —
that is an internal abbreviation and appears nowhere a reader would meet it. The site brands its
siblings long-form in prose (Sky Ledger, 50 Upgrades) and this matches. The heading carries the
first mention so the full name is the first thing a reader meets.

---

## The copy, as it should appear

> ### EQL Source Auras is coming
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
| Heading — "EQL Source Auras is coming" | 5 |
| Paragraph one — what it does (C1) | 30 |
| Paragraph two — what it reads, what it does not touch (C2, C3, C4) | 34 |
| Paragraph three — WeakAuras credit (C5, C6, C7) | 27 |
| Paragraph four — release target (C8, C9) | 24 |
| **Total added to `index.html`** | **120** |

The page ceiling is 649 words and `gate.py` fails at ceiling plus forty, so the effective hard
stop today is 689. Adding 120 words requires the ceiling to be raised **to at least 769**, by
hand, with the reason in the commit message. Suggested wording for that commit:

> Raise index.html prose ceiling 649 to 769 for the Auras announcement band.
>
> The band is 120 words: what the tool does, what it reads and does not touch, the WeakAuras
> credit, and the release target with its qualifier. The privacy sentence and the credit are
> both load-bearing and neither compresses further without becoming a claim we cannot back.
> Deliberate, not a side effect.

The long-form name costs one word against the earlier draft. It is not negotiable and the word
is not available for reclaiming.

---

## The only cut available

**Adjudicated. One of the three original candidates survives — and it is no longer urgent.**

1. **APPROVED, but not a schedule concession — drop ", so you can see what is about to drop
   without looking away"** — saves 11 words, taking the band to 109 and the ceiling to 758. The
   first clause alone still explains the product to a stranger, and this is the only ornamental
   phrase in the band. Session A may take it without asking **if the ceiling argument is genuinely
   contested**. Do not take it to save time: the band may land after the drop, so there is no
   deadline buying anything here, and 120 words is the version that was adjudicated.
2. **OVERRIDDEN — keep "and the game's own icon art".** Not available. C3 stays in full: naming
   only the log would be incomplete, and a reader who noticed the app opening their spellbook or
   reading their install's icon art would be right to call it an overclaim.
3. **REFUSED — keep "The video is what exists today".** Not available. It is the link between the
   evidence and the claim, which is the point of leading with the video.

**Do not cut** the memory sentence, the "from scratch rather than ported" clause, the
non-affiliation clause, or the word "targeting". Each is there because of a rule this site holds,
not because it reads well. Cutting any of them turns the band into ordinary marketing copy on a
page that promises it is not.

---

## Held in reserve — the foreground-check sentence

**Ruled: hold back, but keep ready verbatim.** Not in the band. A bored Discord during maintenance
is exactly where someone runs Process Monitor and finds a PowerShell call, and the answer being
immediate is worth more than the sentence being pre-emptive.

Deploy this, exactly as written, the moment anyone asks:

> Auras asks Windows, twice a minute, which application is in front, so the overlay can hide
> itself when you alt-tab away. It reads which window has focus, not anything inside the game.

Backing: `foregroundWatcher.js` — an inline PowerShell `Add-Type` snippet on a two-second
interval calling `GetForegroundWindow()` and `GetWindowThreadProcessId()` from `user32.dll`, then
`Get-Process` on the returned PID, matched against the process name `eqgame`. It opens no handle
to the game process and reads no game memory, so it does not disturb C4 as worded.

Note "twice a minute" rather than "every two seconds": that keeps the sentence free of digits, so
it can be dropped into any page without tripping the figure-near-hedge rule. If the literal
interval is ever wanted, it must be spelled in words and kept well clear of hedge words.

---

## Notes for Session A on wiring the band

- **The video leads.** It sits above the prose, not beside it. The first paragraph is the caption
  the video earns, not the headline the video decorates.
- **No YouTube, no iframe, no third-party embed.** The home page states that nothing is reported
  to anyone before a reader clicks. An embed would make that sentence false on the one page that
  makes it. The asset is a local file served from the site's own origin.
- **The video is silent and has no audio track at all** — not muted, absent. Do not render
  controls that imply sound. `autoplay muted loop playsinline` with the poster as `poster`.
- **Below 700px, and under `prefers-reduced-motion`, show the poster only.** Matching the existing
  behaviour rather than introducing new behaviour.
- **Meta description:** if the band changes the page's meta description, it must contain no digits
  unless that digit appears literally in the visible page text. The band contributes none.
- **Filenames** are `auras.mp4` and `auras-poster.jpg`. Renamed from an earlier `eqls-` prefix:
  a filename is reachable in view-source and the network tab, so it is somewhere a reader could
  meet the internal abbreviation.
- **Alt text / accessible name**, no digits, no braces, no character names:
  > Auras drawing countdown timers over EverQuest Legends.
