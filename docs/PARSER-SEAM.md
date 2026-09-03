# The parser seam — measured, not merged

**Session C, 3 September 2026.** Reproducible: `scripts/parser-seam.js`. Prints its file list,
line count and dedup rule every run.

**Measurement only. Nothing here merges the parsers, proposes a merge, or widens a regex.** The
standing order against widening a damage regex is discharged for E and does not extend to Shara's
parser or to any merge across the three. **My own parser is benched with the aggro board and is
deliberately not in this comparison** — a benched parser cannot diverge from anything.

---

## THE HEADLINE

**Two live parsers, 25,030 lines where both are in scope, 1,018 disagreements — 4.07%. One of the
two is substantive and the other is only a label.**

```
shara | E        count   verdict
none  | spell      571   SUBSTANTIVE   E counts it, Shara deliberately does not
spell | dot        447   TAXONOMY      same damage, different word
```

---

## THE ONE THAT MATTERS: E COUNTS THE PLAYER HURTING THEMSELVES AS DAMAGE OUTPUT

```
You hit yourself for 51 points of unresistable damage by Cannibalize.

  Cannibalize          482
  Cannibalization I     89
                       ---
                       571   every single one of the 571
```

**Shara's parser returns `null` on these, and it is deliberate rather than accidental** —
`damageLines.js` checks the target and skips the line when it is `yourself`. **E's `SPL` pattern
has no such check, so all 571 land in the damage total as spell damage.**

**Cannibalize is the shaman line that converts the caster's own hit points into mana.** It is
self-inflicted, it damages nobody else, and on any reading of "damage done" it is not output.
**Counting it inflates the meter** — and it inflates it specifically for shamans, which is an
actor-correlated error rather than a uniform one, the same shape as the aggro-board GAP B.

**Scale here is small and that is a property of this corpus, not of the game — see the bound
below.** On a shaman who cannibalises through a long raid, this is not small.

---

## THE ONE THAT DOES NOT: A WORD, NOT A NUMBER

```
Fright has taken 394 damage from your Envenomed Bolt IV.

  Shara : kind = "spell"
  E     : kind = "dot"
  amounts agree on 447 of 447
```

**Both parsers see the line, attribute it to the player, and read the same number.** They disagree
only on which bucket it belongs in. **That costs nothing today and would cost something the moment
either tool reports damage broken down by kind** — a "spell vs DoT" split would not be comparable
between the two.

**Reported because it is a divergence, not because it is a defect.** Neither label is wrong;
they are answers to slightly different questions.

---

## THE BOUND, AND IT IS LARGER THAN THE FINDING

**25,030 first-person damage lines out of 4,291,719 — 0.58% of the corpus.**

**Both characters in this corpus are support.** Shara and Avenrae heal, buff and wear damage
shields; they barely swing. Every earlier measurement on this corpus said the same thing — 137,017
of Avenrae's shield lines against a few thousand melee swings, and six of E's seven Tier-2 verbs at
zero first person.

**So this measures the seam on the population that exercises it least.** A rogue's or a wizard's
log would push far more traffic through exactly the patterns that disagree. **The 4.07% is a real
rate over a real corpus and it is not a general rate**, and nobody should quote it as one.

**What the corpus does establish firmly:** the Cannibalize disagreement is *categorical*, not
marginal. All 571 in-scope self-damage lines disagree, with no partial overlap. That conclusion
does not depend on corpus size.

---

## FIDELITY, BECAUSE A COMPARISON IS WORTH WHAT ITS FIDELITY IS WORTH

**Shara's side is her actual file, required unmodified** — `LoxyBee/EQLS-Auras@3a4d119c :
src/shared/damageLines.js`, blob `0a97f0b6d35f`. Her code decides her verdicts, not my reading
of it.

**E's side is transliterated and that is a real limitation I am not hiding.** E's parser is Python
(`sky-ledger@1a6654f7 : tools/parse.py`) and its four patterns are reproduced verbatim in JS. They
use only constructs that mean the same thing in both dialects — `\w`, `.+?`, `[\d,]+`, non-greedy
groups — and E's match order (SPL, then HIT, then DOT) is preserved. **But it is a translation, and
any finding that turned on regex-dialect subtleties would need re-checking against E's own
runtime.** Neither finding above does: one is a missing `yourself` guard and the other is a bucket
name.

**The scope asymmetry is by design and is not reported as a disagreement.** E is `^You`-anchored
because it is a personal DPS meter; Shara's is all-actor. "E does not see Valestia's swing" is E
working correctly, so the script restricts to the first-person population where both are in scope.

---

## WHAT I AM NOT DOING

**Not proposing a fix to either parser.** The `yourself` guard is E's to add or decline, and it may
have a reason to count self-damage that I cannot see from outside. The bucket naming is a
convention question that belongs to whoever ends up consuming both.

**Not touching Shara's parser, and not routing anything to her.** Everything that reaches her goes
through the owner.

---

*Session C, 3 September 2026. `node scripts/parser-seam.js` with `SHARA_PARSER` pointing at an
extracted copy of her file — 16 files, 4,291,719 lines, dedup by size + md5 of first 64KB.*
