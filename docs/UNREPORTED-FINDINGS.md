# What this repository knows that nobody asked for

**Session C, 1 September.** Every item below was established while doing something else, lived only
as a source comment or a commit body, and would change somebody's work. Adopted after the Director
noted — and D argued correctly — that this is not a lapse but what happens when the code is the
only place a careful person writes things down. The fix is a file, not a resolution to do better.

Each item says **who it changes**. Each cites a file and line rather than memory.

---

## 1. EQ Legends ZERO-PADS the day of month. `\d{2}` is safe.

`threat/threatCore.js:71`

```
zero-padded single digit   '[Www Mmm 0N '     1,270,007 lines
space-padded single digit  '[Www Mmm  N '             0 lines
```

Measured across 16 log files. Every distinct day field present is two characters wide:
`12, 10, 26, 09, 16, 07, 04, 13, 15, 11, 06, 29, 14, 08, 19, 05, 18, 17`. Verbatim:
`[Tue Aug 04 13:33:15 2026]`. The field is `strftime` `%d`, **not** `ctime()` space-padding.

**WHO IT CHANGES — E, and B's vendored copy.** E hypothesised that a `(\d{2})` day pattern might be
silently dropping every line logged on days 1–9, and could not test it: no log in its 4-file,
189,460-line corpus contains a single-digit day at all, so its "0 lines dropped" proved nothing.
**This corpus contains 1.27 million such lines and every one is zero-padded.** The hypothesis is
refuted; nothing is being dropped.

**THE LIMIT, and it is an inch of inference:** the days present are **04 through 09**. Days 01, 02
and 03 do not occur anywhere in this corpus, so the padding is *measured* over 4–9 and *inferred*
for 1–3. No formatter pads 04 and not 01, but that is reasoning about a formatter rather than a
count. E's one-character widening to `\d{1,2}` is right-either-way and should be kept, not reverted
on this evidence.

*This sat in a source header for hours while it blocked another session's P0. It is the reason this
file exists.*

---

## 2. Stun hate is not flat 200/400 — it scales with the target's max HP

`threat/threatCore.js:19`, sourced from the EQEmu server implementation.

```
default_aggro = clamp(target_max_HP / 15, 25, 1200)      for Stun, Blind, Mez, Charm, Fear
Root is the flat exception, at 10.
```

The **400** everyone repeats is real but is `MaxScalingProcAggro` — a cap on *proc-sourced* scaling
hate, not a stun value. **No corroboration for 200 was found anywhere**, over an enumerated search.

**WHO IT CHANGES — anyone modelling threat, and the owner's own spec**, which states stuns as a flat
200 or 400. `target_max_HP` does not appear in a log line, so stun hate is not computable from a log
even with the formula in hand.

---

## 3. Heal hate keys off the spell's BASE value, not the amount healed

Same source, corroborated independently against Torven's 2015 live-EQ hate measurements across six
spells.

```
hate = floor(2/3 × min(spell BASE heal value, target's missing HP))
cap 800 if the HEAL TARGET is level ≤50, else 1500
applied at FULL value to every NPC already hating the target — not split among them
```

Remedy: base 483, healed 775, **measured 320 hate**. `2/3 × 483 = 322` fits; `2/3 × 775 = 516` does
not. Holds across five further spells.

**WHO IT CHANGES — anyone told that "whether healing generates threat is unpublished."** It is
published, and this is stronger than "unsourced": it explains *why the number the log prints is the
wrong quantity*. The log gives the amount healed; the formula wants the spell's base value.

**AND A POSSIBLE WAY OUT, flagged as hypothesis not result.** Heal lines have a two-number form,
`for A (B) hit points`, emitted only when overheal occurred. Across all 57,874 pair lines `A < B`
holds — 0 equal, 0 reversed — so **A is effective healing and B is the full amount**. Since the
formula wants `min(base, missing HP)` and A *is* `min(amount, missing HP)`, A may be exactly the
quantity needed, with no spell database. That depends on `B ≈ base`, which is **untested**.

---

## 4. Four log shapes that a reasonable search does not find

Each was a confident zero produced by searching for a remembered phrasing. All four are in
`threat/threatCore.js` with counts.

| Expected | Actual | Count |
|---|---|---|
| `X begins to cast` | **`X begins casting`** / `begins singing` | 65,238 over 820 spells |
| a taunt-success line containing "taunt" | **`X has captured Y's attention!`** | 537 (13 logs) |
| `…attention!` as the only ending | **`…'s attention with an unparalleled approach!`** | 25 of 537 |
| own DoT as `from <Spell> by <Actor>` | **`from your <Spell>`** | a separate first-person shape |

**WHO IT CHANGES — anyone parsing this log.** A parser grepping `taunt` sees only failures and
reports a **100% taunt failure rate**, which is exactly inverted. Successful taunts are never
identifiable *as taunts*; the capture line is a general aggro-gain event — measured, 11 of 25 actors
captured attention having **never once attempted a taunt**.

---

## 5. A RAW MOB NAME IS NOT A KEY — EQ capitalises the leading article line-initially only

**This is the item most worth your time if you read only one.** It has already been routed to two
other sessions as a hazard against their own work, and it is promoted to its own entry rather than
sitting inside a heading about something else — a row under the wrong heading is not findable by
someone scanning for it.

EQ capitalises a leading article at the **start of a line** and not **mid-sentence**, so a single
mob arrives under two spellings:

```
"A vis ghoul knight hits Avenrae for 33 points of damage."     line-initial
"You capture a vis ghoul knight's attention!"                  mid-sentence
```

**WHO IT CHANGES — anyone keying state on a raw name from this log.** Keying targets on the raw
string made those two different mobs. Every aggro capture created a target that was then never
attacked, while all the attacks accumulated on its twin.

**What it cost, measured:** it hid **255 of 600** ground-truth events behind a target that had
"never attacked anybody, ever", and fixing it moved a validation from **133 decidable events at
72.2%** to **385 at 86.8%**. Nothing about it is visible from a parse — every line parsed cleanly,
the counts all looked plausible, and the failure presented as *the game being quiet* rather than as
an error.

**The general form:** any key built from a raw name taken out of this log is subject to
line-position capitalisation. Canonicalise the key and keep the first-seen spelling for display.

---

## 6. The logging player arrives under three casings

Each found only by a failure, none of them by reading:

```
'You'   actor, first-person melee        89,395
'YOU'   target of mob MELEE              57,955
'you'   target of mob SPELL damage        6,101
```

**WHO IT CHANGES — anyone counting per-player anything.** Left unnormalised these are three rows
for one person. The third was found only when a validation pass disagreed 122 times out of 122 and
the disagreements all read `-> you`.

---

## 7. `You` means a different person in every log

`threat/threatCore.js` — `ingest()` now **requires** a `self` parameter.

Merging two characters' logs into one state without resolving `You` records one player under two
names. Measured: agreement sat at 63.2% with nearly every disagreement reading *"saw Avenrae
instead of You"* — while the ground-truth line came from Avenrae's **own** log, where Avenrae *is*
`You`. Resolving it moved 63.2% → 72.2%.

**WHO IT CHANGES — anyone merging multi-character corpora**, which is anyone using both the Shara
and Avenrae logs on this machine.

---

## 8. Things that make me look bad, which is the point

- **The same unquoted-shell-variable fault, twice, one message apart.** `grep -h "captured" $L` with
  `$L` unquoted word-split on the space in `EQL Source`. I published **244** capture events; the
  truth is **537**. I then made the identical error again one message after diagnosing it. The
  danger is not that it splits — it is that it splits into tokens *some of which resolve*, so the
  instrument returns a plausible number and cannot say "I read less than you asked".
- **A `s.replace` with no assertion silently did nothing**, and I re-ran believing a fix had
  applied. An edit that cannot report failure is the same instrument fault as a grep that cannot.
- **My published claim "the observer sees more" was false**, withdrawn. It rested on a zero my own
  regex produced.
- **Every reversal of mine tonight was a MECHANISM claim.** Not one measurement was overturned:
  `537`, `0.077%`, the co-presence table, `86.8%` all held; "the observer sees more", "written only
  for other actors" and "taunt is unusable" all fell. Worth knowing which kind of thing you are
  saying as you say it.

*Session C, 1 September. Nothing here is waiting on an answer.*
