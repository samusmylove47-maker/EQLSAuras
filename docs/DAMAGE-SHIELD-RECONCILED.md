# 193,765 against 178,267 — settled, and one of them was never a damage-shield count

**Session C, 3 September 2026.** Reproducible: `scripts/damage-shield-reconcile.py`, committed
beside this file. It prints the file count it opened and the dedup rule it applied, every run.

**Short version: `193,765` is the count of `thorns` lines. I published it as the whole
damage-shield family. `178,267` cannot be reproduced at all and I am withdrawing it.**

---

## THE VERDICT

| Published | Where | Verdict |
|---|---|---|
| **193,765** "damage-shield lines" | `DAMAGE-FAMILY-AUDIT.md:70` | **Reproduces exactly — as `thorns` alone.** It is not the family. |
| **178,267** thorns 159,214 / flames 18,504 / frost 549 | `FOR-SESSION-E-LOG-PARSING.md:56` | **Does not reproduce and cannot. Withdrawn.** |
| **137,017** Avenrae's shield damage | `DAMAGE-FAMILY-AUDIT.md:73` | **Reproduces exactly — as Avenrae's `thorns` alone.** |
| **70.7%** "of ALL shield damage" | `DAMAGE-FAMILY-AUDIT.md:73` | **Arithmetically right, factually wrong. True figure 59.0%.** |
| **206** distinct owners | `DAMAGE-FAMILY-AUDIT.md:70` | **333** under the full grammar. |

**The true family, over 16 files and 4,291,746 lines:**

```
thorns   193,765     pierced
flames    41,414     burned
frost        496     tormented
          -------
TOTAL    235,675
```

---

## WHAT ACTUALLY HAPPENED, AND IT IS NOT A REGEX BUG

I expected to find two different regexes over one corpus. **It is worse and simpler than that:
the audit computed the numerator AND the denominator over `thorns` only, and then wrote a
sentence about "ALL shield damage" beside them.**

```
published :  137,017 / 193,765  =  70.7%   thorns numerator / thorns denominator
true      :  139,160 / 235,675  =  59.0%   family numerator / family denominator
```

**Both halves were internally consistent, which is exactly why nothing looked wrong.** A ratio of
two thorns-only figures is a perfectly good number. It just is not the number the sentence
claimed, and **no residual, no total, and no internal check can catch a correct ratio with a
wrong label.** The only thing that catches it is capturing the shield noun instead of enumerating
it — which is what the committed script does, and why its regex captures `(?P<noun>...)` rather
than matching a fixed alternation.

**The concentration claim was the entire point of GAP A.** I argued damage shields must be
declared because one actor is 70.7% of the family, and that excluding them under-credits the
tank. **The direction of that argument survives — 59.0% is still enormous concentration — but the
figure was overstated by 11.7 points, and it was overstated in the direction that made my own
case stronger.**

**41,910 lines, 17.8% of the family, were silently outside a count that said "ALL".**

---

## WHY 178,267 CANNOT BE SETTLED, ONLY WITHDRAWN

```
published 1 Sep :  thorns 159,214   flames 18,504   frost 549
measured  3 Sep :  thorns 193,765   flames 41,414   frost 496
```

**Thorns and flames went UP. Frost went DOWN.** No addition or removal of whole files from the
present corpus can raise two counts and lower a third at the same time. **So 178,267 was measured
over a population that no longer exists** — a different file set, or files since rotated. =Auras
itself splits and archives logs, and the game install carries a `Logs/Split/` directory, so a
moving corpus is the expected condition here rather than a surprise.

**It is not wrong. It is unverifiable, which is a different and worse thing, because a wrong
number can be corrected and an unverifiable one can only be withdrawn.** I am withdrawing it
rather than restating it, and **nobody should quote it, including me.**

---

## THE PART THAT GENERALISES

**Every figure I published this week was defensible and not one was reproducible**, because
`scratchpad/correlation.py` was never committed. The Director named that as the transferable
lesson before either of us knew what it was hiding. **It was hiding a mislabelled denominator
that had already travelled into another session's shipped engine** — E's patch P-4 is a
damage-shield exclusion note attributed to me.

**Two rules I am adopting, and they are cheap:**

1. **Commit the script, or do not publish the number.** An uncommitted script makes a figure
   unfalsifiable by anyone, including its author. It took one committed file to find an 11.7-point
   error that had survived a week and a hand-off.
2. **Capture the category, never enumerate it.** A count that matches a fixed list cannot report
   what it excluded. Capturing the shield noun turned "how do these two numbers differ" into a
   three-row table that answered it immediately.

**And a third that only applies here:** a corpus of live log files is a moving target. **Any
figure measured over it needs the file list and line count printed beside it**, which this script
now does, so the next disagreement is a diff rather than an excavation.

---

## FOR SESSION E, SPECIFICALLY

**Your P-4 is unaffected in direction and affected in magnitude.** Damage shields should still be
excluded or declared rather than modelled — the concentration argument holds at 59.0%. But
**if you quoted 193,765 or 70.7% anywhere, both need replacing with 235,675 and 59.0%**, and
**178,267 must be dropped rather than corrected.**

**The damage-shield family on this corpus is `thorns`, `flames`, `frost` and nothing else** — 333
distinct owners, three verbs (`pierced`, `burned`, `tormented`). **That is now a measured closed
set rather than my earlier enumeration, and the script prints the census so you can see there is
no fourth noun rather than taking my word that there isn't.**

---

*Session C, 3 September 2026. `python scripts/damage-shield-reconcile.py` — 16 files,
4,291,746 lines, dedup by size + first 64KB.*
