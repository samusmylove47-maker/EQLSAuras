# The parser seam — measured, not merged

**Session C, 3 September 2026.** Reproducible: `scripts/parser-seam-v2.py`. Prints its file list,
line count, dedup rule, and whether both parsers produced any events at all.

**Measurement only. Nothing here merges the parsers, proposes a merge, or widens a regex.** My own
parser is benched with the aggro board and is deliberately not in the comparison.

---

## ⚠ THE FIRST VERSION OF THIS DOCUMENT WAS WRONG. WITHDRAWN, NOT CORRECTED.

**v1 reported that E's engine counts the player hurting themselves as damage output — 571
Cannibalize lines. That finding is false and is withdrawn.** E's engine has the guard, at
`gapengine.py:206`, its comment names Cannibalize by name, and `coverage.self_damage_excluded`
has been reporting the exclusion all along. **On this corpus E's own counter reports 1,865 lines
and 254,646 points excluded.** E refuted it and E was right.

**v1 also reported 447 "taxonomy divergences" where Shara labels a DoT tick `spell` and E labels
it `dot`. Also withdrawn: the string `dot` does not appear in `gapengine.py` at all.**

### The reason, and it is not the one I was offered

I was told the cause was that transliterating an implementation preserves its patterns and loses
everything that is not one — a guard on its own line is not part of "the four patterns and the
match order". **That is a true and useful law and it is not what happened.**

**I compared against the wrong file.** I searched E's repository for names matching
`parse|engine|damage`, found `tools/parse.py`, could read its four regexes quickly, and called it
"Session E's engine." **It is a 48-line ad-hoc script with no docstring.** The engine is
`gapengine.py` — 793 lines, whose own first line reads *"THE ENGINE, not the shape of its
output."* The `dot` label came from `tools/parse.py:32`.

**A perfect transliteration of the wrong artifact would have produced the same wrong finding.**
The selection error sits upstream of the fidelity error. **I wrote a careful paragraph bounding my
transliteration and not one sentence establishing that the file I transliterated was the file I
was claiming to measure.** The bound I published was real and it was pointed at the wrong risk.

---

## v2 — HOW IT AVOIDS THE WHOLE CLASS

**Nothing is translated.** Each parser runs in its own runtime:

| | |
|---|---|
| **E** | `gapengine.py` imported and executed, blob `27bbd0d1c5e6`. Its own `_parse` and `_hits` decide its verdicts, guards included. |
| **Shara** | her real `damageLines.js`, blob `0a97f0b6d35f`, run under node. Her code decides her verdicts. |

**Two defects in my own harness, both caught before publishing, both worth recording:**

1. **The first comparison looked E's events up *by Shara's* amount and target.** When Shara
   returned nothing there was no key to look up, so the "Shara sees nothing / E sees it"
   direction — **the exact direction v1 had reported** — could never be detected. It printed
   `NONE`. **A `NONE` from a harness that cannot fail in one direction is worth nothing.** Both
   sides are now built independently as multisets and differenced both ways.
2. **Python text mode rewrote the line endings** on the file handed to node, so node saw a
   trailing carriage return and every end-anchored pattern in Shara's parser failed. That printed
   `Shara events: 0`, **which would have read as total disagreement between the two parsers.** It
   was caught only by the both-sides-produced-events guard, never by the comparison logic. That
   guard now prints on every run.

---

## FINDING 1 — E DROPS EVERY MELEE HIT WHOSE PARENTHETICAL IS NOT EXACTLY `(Critical)`

```
gapengine.py:71
  MELEE = ... for (\d+) points of damage\.(\s*\(Critical\))?$

damageLines.js:36
  CRIT_SUFFIX = (?: \([A-Za-z ]+\))?      -> any parenthetical
```

**Counted directly, not through the harness — 1,920 first-person melee lines carry a
parenthetical E's pattern rejects:**

```
(Critical)                12,929   accepted
(Riposte)                  1,511   REJECTED
(Riposte Critical)           185   REJECTED
(Crippling Blow)             164   REJECTED
(Flurry)                      38   REJECTED
(Riposte Crippling Blow)      13   REJECTED
(Critical Flurry)              9   REJECTED
```

**`(Riposte Critical)` and `(Critical Flurry)` are rejected despite containing the word
`Critical`**, because the group requires the whole parenthetical to be exactly that word.

**This is actor-correlated, not uniform.** Crippling Blow and Flurry are warrior/rogue-shaped
events and they are among the largest single hits a melee character lands. Dropping them
understates melee classes specifically — and these two characters are support, so **1,920 is the
floor, measured on the population that ripostes least.**

---

## FINDING 2 — E'S ENGINE HAS NO DAMAGE-OVER-TIME PATTERN AT ALL

**`gapengine.py` contains zero occurrences of `has taken`.** Its only damage patterns are `SPELL`
(`^You hit …`) and `MELEE` (`^You <verb> …`).

**On this corpus that is 58,475 first-person DoT lines and 2,949,826 points of damage**, across 19
distinct spells — Chords of Dissonance, Denon's Disruptive Discord, Selo's Chords of Cessation.
**Bard songs.** Shara's parser reads all of them via `YOUR_SPELL`.

### E already knows, and handles it well in the one place it bites

`gapengine.py:570-577` — when computing resist rates, E guards on landings and **declines to claim
a rate** rather than reporting a false 100% resist:

> *"no landings of this spell appear as direct-damage lines (a damage-over-time effect reports
> differently), so the denominator is unknown and NO RATE IS CLAIMED"*

**That is exactly right and I want it on the record before the rest of this finding.**

### What is missing is the declaration, not the awareness

**Self-damage is excluded *and counted*, surfaced as `coverage.self_damage_excluded`.** DoT damage
is excluded and **counted nowhere** — a reader of the report cannot tell that 2.95M points sat
outside the measurement, and **absence and zero look identical to a reader while meaning opposite
things.**

**That is E's own principle, which E gave me for my stun gap and I gave back for damage shields.**
It is not a bug and I am not calling it one — DoT may be deliberately out of scope. **But it is
not in E's declared "what it does NOT do" list** (naming an item, modelled absolutes, catalogue
answers, cross-character engaged time), so I cannot tell from outside whether it is scope or gap.
**Only E can say which, and either answer is fine as long as the report says so.**

---

## THE BOUND

**194,994 in-scope first-person damage lines out of 4,291,762.** Both characters here are support
— they heal, buff and wear damage shields. **Both findings are floors measured on the population
that exercises them least.**

**The harness keys events on `(amount, target)`, which is lossy** — the same pair recurs, so its
raw disagreement matrix conflates parsing differences with ordering and windowing differences.
**Neither finding above rests on it.** Both were confirmed by direct inspection of the patterns
and by exact line counts. **The matrix is a pointer; the counts are the measurement.**

---

## WHAT I AM NOT DOING

**Not proposing a fix to either parser.** Both findings are E's to act on or decline.
**Not touching Shara's parser and not routing anything to her** — everything that reaches her goes
through the owner.

---

*Session C, 3 September 2026. `SHARA_PARSER=… EQ_GAPENGINE=… python scripts/parser-seam-v2.py` —
16 files, 4,291,762 lines, dedup by size + first 64KB.*
