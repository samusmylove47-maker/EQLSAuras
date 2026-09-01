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

## 8. THE ONE CLASS ALL OF TONIGHT'S FAULTS BELONG TO

**A true-looking output that is a statement about the INSTRUMENT rather than about the world.**

This is the general form, and it is worth more than any single finding in this file. It was named
across three sessions and three unrelated engines in one night, by people who were not looking for
it and did not know the others had hit it:

| session | the output | what it actually said |
|---|---|---|
| this one | a mob "never attacked anybody, ever" | *my key split it into two mobs* |
| D | a dedupe-horizon counter | *my window ended before the data did* |
| E | "no outgoing damage lines matched" | *my regex was anchored to the wrong person* |

Every one of them **parsed cleanly, counted plausibly, and read as a fact about the game.** None
raised an error. That is the whole danger: a defect that announces itself gets found on the day it
is written, and this class hides inside a correct-looking result until something independent
disagrees with it.

**MY OWN INSTANCES, all six, in one night:**

- `begins to cast` returned 0 — the string is `begins casting`, **65,238 lines**
- a search for `taunt` found only failures — the success line is `has captured …` and contains no
  such word, so a parser reports a **100% taunt failure rate**, exactly inverted
- own-DoT returned 0 — the shape is `from your <Spell>`, not `from <Spell> by <Actor>`
- `grep -h … $L` **unquoted**, word-splitting on the space in `EQL Source`: published **244**
  capture events against a true **537**. Then I made the identical error again *one message after
  diagnosing it*
- a `s.replace` with **no assertion** silently did nothing, and I re-ran believing a fix had applied
- a raw mob name as a key — item 5 — which hid 255 of 600 ground-truth events

**WHAT ACTUALLY CATCHES IT**, ranked by what worked here rather than by what sounds rigorous:

1. **An independent instrument that can disagree.** Every one of the six was found by a second
   measurement, never by re-reading the first. The validation pass against in-log ground truth found
   three of them in an afternoon.
2. **A re-implementation forced by a *different constraint*.** The drop-in module was written to fit
   Shara's one-file contract, not to check the engine — and agreeing within 1.5 points was worth
   more than a check built to be a check, because it could not be tuned toward the answer.
3. **Make the instrument state its own scope.** Any command reading a file set reports the count it
   opened. The unquoted-variable fault is dangerous precisely because it splits into tokens *some
   of which resolve* — so it returns a plausible number and cannot say *"I read less than you asked"*.
4. **Assert the mutation applied before believing the result.** Mutate line-wise by index and read
   the line back. A mutation that does not apply is indistinguishable from a guard that works.

**AND THE DIVIDING LINE WORTH CARRYING OUT OF THIS PROJECT — stated in its BOUNDED form, because
I first wrote it unbounded and that version is weaker than it looks.**

The rule is Session D's and it is this: **a measurement names its surface; a mechanism usually
cannot.** That is why the two fail at different rates — not because of any tally.

I originally wrote it as the tally: *every reversal any session made tonight was a mechanism claim,
and not one measurement was overturned.* That is true of one night in one project, and it is
**evidence for the rule, not the rule itself**. Stated alone it invites a reader to trust
measurements generally and distrust mechanisms generally, which is not what D established. A
measurement over the wrong surface fails exactly as hard — my own `244` capture events were a
measurement, and they were wrong because the surface was a shell variable that had silently
word-split.

So the usable test is not *"is this a measurement or a mechanism?"* but **"can this claim name the
surface it is true over?"**

- Mine that held name theirs: `537` over 13 enumerated logs; `0.077%` over 5.6M lines; `86.8%` over
  385 decidable ground-truth events.
- Mine that fell could not: *"the observer sees more"*, *"written only for other actors"*,
  *"taunt is unusable"* — each a story about how the log works, true over no surface I had checked.

**Applied to this project's own threat estimate**, which is the case that matters here: the EQEmu
hate model **cannot name its surface**. It describes EQEmu. EverQuest Legends is a different title,
launched 2026-07-28, whose own wiki has no Aggro or Hate Management page. Nobody in this project or
outside it can say whether EQL follows it. **That is why the estimate ships badged** — and the
downgrade rests on the rule, not on a tally that happened to come out that way tonight.

### And a corollary about the SENTENCES, which is the same fault one level up

**How that bound came to be missing from this file is worth more than the correction.**

Two people stripped it independently — the Director relaying D's rule upward, and me writing it
down here — and neither knew the other had. Two independent readers making the same edit is not
carelessness twice. **It is a property of the sentence.**

The tally form (*"every reversal was a mechanism claim"*) is short, concrete, and quotable. The
mechanism form (*"a measurement names its surface; a mechanism usually cannot"*) is the load-bearing
half and is none of those things. So the tally travels and the qualification does not.

> **A claim whose most quotable form is not its most correct form will shed the correct part every
> time it is passed on.** Not sometimes — every time, because each relayer keeps what is easiest to
> carry.

This is the class in item 8 applied to language rather than to code: *a true-looking sentence that
is a statement about what survives transport, rather than about what is true.* And it has the same
remedy as the code version — **make the truncation impossible rather than asking relayers to
remember**. Write the rule so the quotable part IS the qualified part, or so that removing the
qualification leaves something that reads as obviously incomplete.

That is the same move as the qualifier panel and the three mutually exclusive tiles elsewhere in
this project: a convention fails open the first time somebody transmits the object generically; a
shape cannot.

---

## 9. Things that make me look bad, which is the point

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
