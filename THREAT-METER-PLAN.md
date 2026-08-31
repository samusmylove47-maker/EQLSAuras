# The threat meter: what can be built, what cannot, and the plan — for approval

**Session C, 31 August. 14 research agents, an adversarial pass that reproduced every core number
independently, and 2,390,293 lines of real log. Nothing below is inferred where it says measured.**

---

## The verdict, stated plainly

**The meter as specified cannot be built to the accuracy you described, and the reason is not the
log — it is that three of its four inputs are the wrong quantities.**

You said: *"threat is based on damage dealt, with a few other factors weighed."* That is the
universal community understanding and it is what every guide says. The EQEmu server source says
something different, and it says it in a comment rather than by implication:

```c
// Hate Generation is on a per swing basis, regardless of a hit, miss, or block,
// its always the same.
hate = (weapon->GetItem()->Damage + weapon->GetItem()->ElemDmgAmt);
```

**Melee hate is per SWING, and the amount is the WEAPON's base damage stat.** Not the damage
dealt. A fast weak weapon and a slow heavy one generate hate on completely different schedules from
their damage. The weapon's Damage stat never appears in any log line, and neither does a swing that
missed — the log only prints hits.

So **logged damage is not a noisy version of melee threat. It is a different quantity.**

Two more, same source:

- **Stuns are not flat 200 or 400.** Stun, blind, mez, charm and fear all take
  `clamp(target_max_HP / 15, 25, 1200)` — it scales with the target. Root is the flat exception at
  10. The 400 is real but it is `MaxScalingProcAggro`, a cap on *proc-sourced* hate. **I found no
  corroboration for 200 anywhere.**
- **Heal hate keys off the spell's BASE value**, not the amount healed that the log prints.
  Verified against Torven's live-EQ measurements across six spells: Remedy, base 483, healed 775,
  measured 320 hate — 2/3 × 483 = 322 fits; 2/3 × 775 = 516 does not.

### The caveat that cuts both ways

**EQ Legends is not EQEmu.** It is a new official Daybreak / Game Jawn title, launched 2026-07-28,
five weeks before this corpus ends. Its own wiki's `Aggro` and `Hate Management` pages return
`"missing": ""` from the MediaWiki API — enumerated through the API, not guessed at. **There is no
published threat formula for this game at any tier.**

So the EQEmu findings are a *calibration hypothesis from a different codebase*, not this game's
rules. The staff are P99/Quarm/TAKP veterans, which makes an EQEmu-family model a reasonable prior
— but that is inferred from a staff list, not established.

**Which means: I cannot tell you the formula is wrong for EQ Legends. I can tell you nobody in or
out of this project can tell you it is right, and that the one authoritative source available says
the premise is a different quantity.**

---

## What the log *does* support, and it is better than an estimate

While establishing the above, the corpus gave up something the specified meter does not contain:
**direct observation of who the mob is actually attacking.**

Measured on the full 13-file corpus:

```
10,553   mob attacks a NAMED player, third person   "A spectre slashes Avenrae for 23"
 1,169   mob attacks the logging player             "... hits YOU for ..."
   244   EXPLICIT AGGRO CAPTURE, fully attributed   "Avenrae has captured Guard Crucorn's attention!"
```

That last line is the only unambiguous hate event in EverQuest's log vocabulary, it names **both**
the actor and the mob, and its top actors are all players: Avenrae 73, Kekab 59, Valestia 31,
Jeeve 29, Doraleous 28.

**A parser that greps for `taunt` never sees it** — and separately, *successful taunts are
unlogged*, so a taunt-based parser reports a 100% failure rate. I had `taunt: attributed` in my own
first table and it was wrong.

**This is not a proxy for threat. It is the consequence threat exists to produce.** Who has aggro,
when it changed hands, and how often the tank lost it.

---

## The recommendation

**Build an AGGRO BOARD as v1, and offer the threat estimate as a clearly-badged second column —
not as the headline number.**

| | the specified threat meter | the aggro board |
|---|---|---|
| Inputs | damage, healing, stuns, flat-hate casts | who the mob is swinging at |
| Needs a coefficient nobody has | **yes — three of them** | **no** |
| Falsifiable by the player | only against a hidden server value | yes, instantly, by looking |
| Wrong-name-at-rank-1 risk | high | it is a direct observation |
| Shippable this week | no | yes |

The board answers *"is the tank holding it, and who pulled it off them"* — which is the question a
raid actually asks. **A tank losing aggro nine times in a fight is the most actionable fact in this
data, and the specified meter does not contain it.**

If you want the threat estimate anyway — and it is your call — it ships as an **estimate**, badged,
in its own column, with the three unmeasured coefficients named on the face of it.

---

## Four things that must be in whatever gets built

Each was found by measurement, and each would be a silent defect otherwise.

**1. Actor identity, three-way, never boolean.** Two **charm pets** rank #2 and #3 by damage in this
corpus — `Innoruuk's Chosen` 1,911,171 and `Heart harpie` 2,428,388, above every human but one. A
leaderboard on name-shaped actors ships a charmed mob at the top. Joining actors against B's
catalogue mob names classifies 305 name-shaped actors as **66 person / 130 not-a-person / 109
unknown**, with unknown only **1.0%** of melee activity. A name collision must yield `unknown`,
never `not-a-person` — dropping a real person silently is the dangerous direction.

**2. Per-target, not per-moment.** "All damage from the moment a boss engages" is wrong for raids:
one 60-second window held 33,256 events across many simultaneous mobs. Hate lists are per-mob.

**3. Overheal is distinguishable, and this may rescue the healing lane.** Heal lines have a
two-number form `for A (B) hit points`, emitted only when overheal occurred. Across all 57,874 pair
lines, `A < B` holds — 0 equal, 0 reversed. **A is effective healing, B is the full amount.** Since
the hate formula wants `min(base, missing HP)` and A *is* `min(amount, missing HP)`, A may be the
quantity the formula needs, with no spell database required. **Hypothesis, not result** — it
depends on B ≈ base, which is untested. 317 distinct actors emit the pair form, so it is not a
first-person-only artifact.

**4. Damage shields are a real, attributed hate source being discarded.** 178,267 lines — thorns
159,214, flames 18,504, frost 549. Whether a shield generates hate for its owner is
**NOT_ESTABLISHED** and 178k lines hang on it.

---

## The build plan — `threatCore.js`, modular, for =Auras

Written to satisfy the same contract as the rest of the project: **lines and an explicit `now` in,
JSON-clonable state out. No Electron, no DOM, no filesystem, CommonJS.** Then it is the same
artifact in a browser page or vendored into Shara's app, and the delivery question stops blocking
the build.

**Phase 1 — the parser (mine, not E's).** E's engine is first-person only: every damage regex
anchored `^You`, no pet handling, no per-mob segmentation, no threat code. Its third-person regex
misses **31.7%** of this corpus's third-person melee; its own proposed relaxed version still misses
22.9%. What transfers is technique and four hard-won fixes, credited to E: anchor-and-enumerate
over positional splitting; the kill join keyed on `(timestamp, target)` not timestamp alone (38%
over-marking otherwise); a monotonic day index (a month boundary ran backwards and halved a DPS
figure); and publishing the window rule as a sibling field.
The verb lexicon is **closed at 19 stems with residual 0 over 642,043 lines**, established by
fixpoint from three independent anchors and reproduced by a second agent.

**Phase 2 — the aggro board.** Mob→player attack attribution, aggro-holder tracking, switch
detection, and the `has captured … attention!` event as the one hard signal.

**Phase 3 — actor identity.** The catalogue join, three-way, with the collision rule.

**Phase 4 — the overlay.** One line per your spec — the holder and the challenger — in =Auras.

**Phase 5, only if you approve it — the badged threat estimate**, with its coefficients named as
unmeasured on the face of the display.

---

## What it can never show, and the display must say so

- **A threat magnitude.** The hate list is server-side and never printed. No log will settle it.
- **Anything sub-second.** The log clock has no sub-second field.
- **A complete picture.** Combat messages are radius-limited, so every number is a lower bound of
  unknown tightness. *(Though: measured across two clients in demonstrated co-presence, an observer
  sees 99.8% of melee, 100% of spell, healing and casts — and MORE DoT than the actor's own client,
  because `X has taken N damage from SPELL by ACTOR` is written only for other actors.)*

---

**This answers a smaller question than you asked. I believe it is the largest question this log can
answer, and the one you asked needs a coefficient nobody in this project has measured. Your call,
and I will build either.**

*Session C, 31 August.*
