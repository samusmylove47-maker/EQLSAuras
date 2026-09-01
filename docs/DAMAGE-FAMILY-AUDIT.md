# D's damage families run against my parser — and the misses are actor-correlated

**Session C, 1 September.** Three questions from the Director, answered in order. **The short
version: two gaps, both actor-correlated, and my published 85.3% was measured through one of them.**

D's families read at source, `EQLSLockouts:docs/UNREPORTED-FINDINGS.md` on `main` (PR #13 merged),
not from a relay. **D's bound travels with the number and I repeat it: 84–86% is against D's own
definition of "damage-shaped" — its instrument, its denominator, not an absolute.**

---

## Q1 — WHICH FAMILIES DOES MY PARSER HANDLE?

A list, not a judgement.

| D's family | `threatCore` | `aggro-board` module (mob→player only) |
|---|---|---|
| F1 `You frenzy on X for N points of damage.` | **handles** | n/a — wrong direction |
| F2 `Valestia frenzies on X …` | **handles** | **handles** |
| F3 melee shape + spell suffix `… by Puma Maw.` | **handles** | **MISSES** |
| F4 `X is pierced by Y's thorns … non-melee damage.` | **MISSES** | n/a — wrong direction |
| F5 `A gorgon cleaves X …` | **handles** | **handles** |

**F1/F2 I fixed this afternoon**, hours before D published, from Shara's `damageLines.js` — and D
and E each found the same shape independently. Three sessions, three corpora, one verb.

**F3 in the module is a NEW gap this audit found.** `MOB_HIT` lists `hits` but not bare `hit`, and
mob **spell** damage on a player uses the bare form:

```
a gorgon hit Grimtusk for 113 points of magic damage by Smite.     <- the module does not see this
```

**F4 is real and unmodelled in `threatCore`.** It affects the threat *estimate*, which is computed
from damage.

---

## Q2 — ARE THE MISSES ACTOR-CORRELATED? **YES. BOTH. BADLY.**

This is the question that decides whether it is a scale error or a wrong answer.

### GAP B — mob spell damage on a player, missed by the shipped module

```
observations the module CATCHES : 196,927
observations the module MISSES  :  13,388     6.37% overall

per-actor miss rate
  Shara      580 caught    248 missed    30.0%   <-
  Stankie  1,037            124          10.7%
  Whopper  1,076            125          10.4%
  Ceriph   1,057            113           9.7%
  Horse      682             72           9.5%
  Cavity     892             89           9.1%
  Avenrae 126,279         7,475           5.6%
  Fright     852             23           2.6%
  Onomar     844             15           1.7%

  SPREAD: 1.7% to 30.0% — a 28-point range across actors in the same fights.
```

**A uniform 6.37% would shift every actor equally and change no ranking. This is not uniform.**
An actor losing 30% of their observations is systematically under-credited against one losing 1.7%,
and the board ranks by observation count — so **this can flip ranks**, which is the wrong-answer
case rather than the scale-error case.

### GAP A — damage shields, unmodelled in `threatCore`

```
193,765 damage-shield lines, 206 distinct owners
  Avenrae  137,017   70.7% of ALL shield damage
  next 9 owners       9.2% combined
```

**One actor is 70.7% of the entire family.** This is the Director's exact concern realised:
damage shields are worn by whoever is being hit, which is the tank, which is precisely who a threat
meter exists to rank. Excluding them under-credits that role by a large and concentrated amount.

---

## Q3 — WAS 85.3% MEASURED BEFORE OR AFTER THE FILTER? **After. Through it.**

The module's 85.3% ground-truth agreement is computed on mob→player observations — **exactly what
GAP B filters.** So it was measured on a corpus my own instrument had already reduced.

**And I nearly reported that it was not.** My first correlation table showed the logging player at
**0.0% miss**, which would have meant the ground-truth events were clean even if the rankings were
not. That was wrong, and the cause was mine:

```
target YOU   caught(melee) 46,561   missed(spell)     0
target you   caught(melee)      0   missed(spell) 3,888
```

**`YOU` and `you` were separate keys in my counting script**, so the logging player's observations
were split across two rows and one of them showed zero. **The true rate is 3,888 / 50,449 = 7.7%.**

This is the three-casings defect from item 6 of my own findings file — *reappearing inside the
instrument I built to check for filtering*. I documented that shape, routed it to two sessions, and
then wrote it again the same day. **Knowing a failure shape does not protect you from it; only a
guard in the code does.**

---

## WHAT I AM NOT DOING

**Not widening the regexes.** The module shipped inside a launch this afternoon and is in front of
readers now; changing what it counts changes published behaviour under them. Same ruling D was
given, same reason, and D's additional reason applies here too — E's meter is calibrated against
shapes, and a third repository silently recalibrating is the fault we have all been naming.

## THE PROPOSAL, which is the Director's to rule on

**1. GAP B is the urgent one and the fix is one token** — add bare `hit` to `MOB_HIT`'s
alternation. It recovers 13,388 aggro observations and, more importantly, **removes a 28-point
actor-correlated bias from a live ranking.** Small change, large correctness effect, and it makes
the board see *more* rather than differently.

**2. GAP A should stay unmodelled, and be declared rather than silently absent.** Damage-shield
damage is real hate, 193,765 lines, 70.7% one actor. But the estimate already ships badged as a
ranking with unsourced weights, and adding a family that is 70% one person would change the
ordering on grounds I cannot calibrate. **Per E's own ruling on my stun gap: it belongs in
`refusals` as `no_log_evidence` with the count attached, not as silent absence** — absence and zero
look identical to a reader and mean opposite things.

**3. The ground-truth number needs re-stating either way.** 85.3% is agreement measured through a
7.7% filter on the very actor the ground-truth events are about. It is not invalidated — the events
that survive are still events — but it cannot be quoted as though the instrument was neutral.

---

*Session C, 1 September. Reproducible: `scratchpad/correlation.py`, which prints the file count it
opened. D's families read at `EQLSLockouts@main:docs/UNREPORTED-FINDINGS.md`.*
