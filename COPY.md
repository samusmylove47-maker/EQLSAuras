# Band copy — EQLS Auras

House voice. British spelling. No digits anywhere (see gate notes). No braces. No exclamation
marks. Claim-by-claim backing is in `CLAIM-SET.md`; the C-numbers below cross-reference it.

---

## The copy, as it should appear

> ### Auras is coming
>
> *[video: EQLS Auras running over EverQuest Legends — poster frame below 700px and under
> prefers-reduced-motion]*
>
> EQLS Auras is a Windows overlay that puts countdown timers for your own buffs on top of
> EverQuest Legends, so you can see what is about to drop without looking away.
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
| Heading — "Auras is coming" | 3 |
| Paragraph one — what it does (C1) | 31 |
| Paragraph two — what it reads, what it does not touch (C2, C3, C4) | 34 |
| Paragraph three — WeakAuras credit (C5, C6, C7) | 27 |
| Paragraph four — release target (C8, C9) | 24 |
| **Total added to `index.html`** | **119** |

The page ceiling is 649 words and `gate.py` fails at ceiling plus forty, so the effective hard
stop today is 689. Adding 119 words requires the ceiling to be raised **to at least 768**, by
hand, with the reason in the commit message. Suggested wording for that commit:

> Raise index.html prose ceiling 649 to 768 for the Auras announcement band.
>
> The band is 119 words: what the tool does, what it reads and does not touch, the WeakAuras
> credit, and the release target with its qualifier. The privacy sentence and the credit are
> both load-bearing and neither compresses further without becoming a claim we cannot back.
> Deliberate, not a side effect.

If Session A wants the increase smaller, the compression order is given below — take from the top.

---

## Where to cut, if the ceiling fight is not worth it

In order of least damage. Do not reorder — the later items are the ones this site exists to say.

1. **Drop ", so you can see what is about to drop without looking away"** — saves 11 words. The
   first clause alone still explains the product to a stranger. This is the only ornamental
   phrase in the band.
2. **Drop "and the game's own icon art"** — saves 6 words. Slightly weakens C3's completeness;
   the icon art is the least surprising of the three reads, and the log and spellbook are the two
   a reader actually cares about.
3. **Drop "The video is what exists today"** — saves 6 words. Costs the link between the evidence
   and the claim, which is the point of leading with the video. Reluctant.

**Do not cut** the memory sentence, the "from scratch rather than ported" clause, the
non-affiliation clause, or the word "targeting". Each is there because of a rule this site holds,
not because it reads well. Cutting any of them turns the band into ordinary marketing copy on a
page that promises it is not.

---

## Optional sentence, if you want the foreground check surfaced

The app asks Windows, twice a minute, which application is in front, so the overlay can hide
itself when you alt-tab away.

Twenty-two words. It is **true and sourced** (`foregroundWatcher.js`, two-second poll via
`GetForegroundWindow`), and it pre-empts anyone who runs Process Monitor and finds a PowerShell
call. My recommendation is to **hold it back** for the release page rather than spend it in the
band: it answers a question nobody has asked yet, and the band's privacy sentence is already the
strongest thing on the page. Ship it the moment anyone asks.

Note "twice a minute" rather than "every two seconds" — that phrasing keeps the band free of
digits. If you prefer the literal interval, it must be written out in words, and it must not sit
within roughly 260 characters of a hedge word.

---

## Notes for Session A on wiring the band

- **The video leads.** It sits above the prose, not beside it. The first paragraph is the caption
  the video earns, not the headline the video decorates.
- **No YouTube, no iframe, no third-party embed.** The home page states that nothing is reported
  to anyone before a reader clicks. An embed would make that sentence false on the one page that
  makes it. The asset is a local file served from the site's own origin.
- **The video is silent and has no audio track at all** — not muted, absent. Do not add controls
  that imply sound. `autoplay muted loop playsinline` with the poster as `poster`.
- **Below 700px, and under `prefers-reduced-motion`, show the poster only.** Matching the existing
  behaviour rather than inventing new behaviour.
- **Meta description:** if the band changes the page's meta description, it must contain no digits
  unless that digit appears literally in the visible page text. The band contributes none.
- **Alt text / accessible name** for the video and poster, no digits, no braces:
  > EQLS Auras drawing countdown timers over EverQuest Legends.
