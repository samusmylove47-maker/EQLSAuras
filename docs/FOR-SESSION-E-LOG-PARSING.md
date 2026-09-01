# Everything I know about reading an EQ Legends log — for Session E

**Session C, 1 September.** Written for the DPS/gap engine. Everything here is measured on 16 log
files / ~5.6M lines from two characters, or sourced with the source named. **Where a thing is
inferred rather than measured I say so**, because half of what follows would be worth less than
nothing if you took a story for a count.

**Read §1 first if you read nothing else. It is the one that would have saved me a day.**

---

## 1. A RESIDUAL OF ZERO DOES NOT MEAN CORRECT PARSING

I verified my verb lexicon at **"residual 0 over 642,043 lines"** and treated that as proof it was
right. It was not.

**A residual counts lines that FAILED TO PARSE. It cannot see a line that parsed into the wrong
fields.** `a gnoll elite frenzies on Grimtusk for 11 points of damage.` parsed perfectly — into
`actor="a gnoll elite"`, `verb="frenzies"`, `target="on Grimtusk"`. Zero residual, wrong answer,
20,305 lines.

**If your parser reports a clean residual, that is not a correctness check.** The check that finds
this is: sample parsed output and read the FIELDS, or compare against a second parser written by
somebody else. Shara's `src/shared/damageLines.js` found mine.

---

## 2. THE VERB LEXICON, and the one that is two words

19 stems, derived by fixpoint from three independent anchors (actor exactly `You`, target exactly
`YOU`, target beginning with an article), residual 0 over 642,043 lines containing `" for N points of "`:

```
hit slash cleave kick bash pierce strike punch crush smite
bite shoot claw backstab slice sting smash reave frenzy
```

**AND `frenzies on` IS ONE TOKEN — 20,305 lines.** Bare `frenzies` leaves `on <name>` sitting where
the target should be. Match multi-word verbs FIRST, longest-first, or you will silently mis-target
every one.

```
Sabertooth Overseer frenzies on Avenrae for 11 points of damage.
```

Shara's shipped parser carries four more that my corpus never produced — `gnaws`, `lashes`,
`flurries`, plus `slams`/`rends`/`gores`/`mauls`. Hers were measured on her logs. Accept the union;
tolerance is free and a 26th verb should be logged, not dropped.

**The hard melee/spell discriminator:** bare `hit` (43,374 lines) is ALWAYS a spell and always
carries `by <Spell>`; third-person `hits` never carries one.

---

## 3. THE DAMAGE SHAPES, with counts

```
MELEE          426,647   <actor> <verb> <target> for N points of [type] damage[ by <Spell>].
DAMAGE SHIELD  178,267   thorns 159,214 / flames 18,504 / frost 549 — FULLY ATTRIBUTED
DOT (3rd)      130,952   <target> has taken N damage from <Spell> by <Actor>.
SPELL DD        43,374   ... for N points of <type> damage by <Spell>.
DOT (1st)         —      <target> has taken N damage from your <Spell>.     <- SEPARATE SHAPE
```

**Damage types on spell damage:** magic 23,034 · prismatic 6,259 · fire 4,755 · poison 2,884 ·
unresistable 2,672 · cold 2,318 · disease 1,157 · physical 268 · chromatic 27.

**The 178,267 damage-shield lines are attributed and are usually discarded.** If your DPS numbers
exclude them, say so in the window note — it is a real damage stream with a named owner.

**Own DoT uses `from your <Spell>` and never `by <Actor>`.** I matched only the `by` form, got a
confident zero, and published "own DoT is not logged". It is. That retraction is in my findings
file as item 4.

---

## 4. HEALING — and the number that is probably what the hate formula wants

**Heal lines have TWO forms and the paired one is emitted only when overheal occurred:**

```
Avenrae healed herself for 2 hit points by Blessing of the Squire.
Avenrae healed Zonarer for 296 (412) hit points by Celestial Healing.
```

**Across ALL 57,874 pair lines, `A < B` holds — 0 equal, 0 reversed.** So **A is effective healing
applied and B is the full amount; overheal is B − A.** Corpus totals: 7,409,022 effective vs
2,936,733 overhealed — **28.4% waste**.

**IF YOUR HEAL REGEX ONLY MATCHES `for N hit points` IT UNDERCOUNTS BY 28.3%** — 145,669 matched
against 203,208 actual. That is the single largest silent undercount I found in my own work.

**317 distinct actors emit the pair form**, so it is not a first-person artifact.

**HoT TRAP:** `You healed Avenrae over time for ...` — parsed with the plain heal regex this yields
a phantom entity. Consume the over-time form first.

---

## 5. CASTS — the string is `begins casting`, not `begins to cast`

**`begins to cast` is genuinely ZERO. `begins casting` / `begins singing` is 65,238 lines over 820
distinct spells, from 1,127 casters including other players.**

I searched for the phrasing I remembered, got zero, and published *"you never see another player
start a cast"*. That was false and it nearly cost the entire flat-hate lane. **Casts by other
players ARE visible and carry the spell name.**

---

## 6. IDENTITY — the three that will bite you

**6a. THE LOGGING PLAYER ARRIVES UNDER THREE CASINGS:**

```
'You'   actor, first-person melee     89,395
'YOU'   target of mob MELEE           57,955
'you'   target of mob SPELL damage     6,101
```

Left unnormalised these are three rows for one person. I found the third only when a validation
disagreed 122 times out of 122 and every disagreement read `-> you`.

**6b. `You` MEANS A DIFFERENT PERSON IN EVERY LOG.** Merging two characters' logs without resolving
it records one player under two names. Measured: agreement sat at 63.2% with nearly every
disagreement reading *"saw Avenrae instead of You"* — while the ground truth came from Avenrae's own
log where Avenrae **is** `You`. Resolving it moved 63.2% → 72.2%. **Require a `self` parameter.**

**6c. A MOB NAME IS NOT AN IDENTITY, AND CANONICALISING IT IS NOT ENOUGH.**

Two separate problems stacked:

*The spelling one.* EQ capitalises a leading article at the **start of a line** and not
mid-sentence, so one mob arrives as both `A vis ghoul knight hits ...` and
`You capture a vis ghoul knight's attention!`. Keying on the raw string makes two entities. That
single bug hid **255 of 600** ground-truth events and moved a validation from 133 decidable at
72.2% to **385 at 86.8%**.

*The identity one, which canonicalising does NOT fix.* In group content the same name is many live
mobs at once:

```
"a dar ghoul knight"   slain 5 TIMES IN ONE MINUTE
                       201 kills of that one name across the corpus
                       up to 24 damage lines against the name in ONE SECOND
```

**This killed a measurement I tried to run for the Director.** I compared two players' vantages of
"the same fight" keyed on (name, second) and got a striking result — median 23.2% disagreement.
Then the control failed: each character's OWN damage appeared to disagree with itself by 27.9%,
which is impossible. It was my key merging several simultaneous mobs, each log summing a different
subset.

**FOR YOUR PER-ENCOUNTER DPS: any per-mob figure in group content is suspect for this reason.**
Named/raid bosses are unique and safe; trash is not.

---

## 7. THE FREE GROUND TRUTH nobody was using

The game states hate facts outright:

```
Avenrae has captured Guard Crucorn's attention!          537 (13 logs) — names actor AND mob
You capture a wan ghoul knight's attention!              600 — FIRST PERSON, names the mob
You already have your target's attention.                192 — binary "you are top of hate"
```

**Two endings, and anchoring on `attention!` misses the second** — 25 of 537 read
`...'s attention with an unparalleled approach!`.

**These are labelled events you can validate ANY hate/threat/aggro model against.** I used the
600 first-person ones to score an aggro board at 87.0% (335/385).

**A parser that greps `taunt` sees only failures and reports a 100% taunt failure rate** — successful
taunts are never logged as taunts, and the capture line contains no such word. Measured: 11 of 25
actors captured attention having never once attempted a taunt, so it is a general aggro-gain event.

---

## 8. TIMESTAMPS

**The day is ZERO-PADDED.** 1,270,007 lines carry a single-digit day and every one is `0N`; the
`ctime()` space-padded form `[Www Mmm  N ` occurs **zero** times. `\d{2}` is safe.

*Limit: days present are 04–09; 01–03 do not occur in my corpus, so 1–3 is inference from a
fixed-width formatter rather than a count. Your `\d{1,2}` widening is right-either-way — keep it.*

**No sub-second field exists.** Anything requiring finer resolution than one second is not
available from a log, at all.

---

## 9. THE HATE MODEL — sourced, and NOT this game's

**All of §9 is from EQEmu server source and live-EQ measurement. EverQuest Legends is a NEW OFFICIAL
DAYBREAK / GAME JAWN TITLE launched 2026-07-28 — not an emulator, source not public.** Its own wiki
returns `{"missing":""}` from the MediaWiki API for both `Aggro` and `Hate Management`; the `Threat`
page is a bare redirect to a page that does not exist. **There is no published threat formula for
this game at any tier.** Treat everything below as a calibration hypothesis from a different
codebase — by D's rule, it cannot name the surface it is true over.

```
MELEE     hate is charged PER SWING from the weapon's Damage stat, "regardless of a hit, miss,
          or block". The stat is not in any log line and misses are not logged.
          => LOGGED DAMAGE IS NOT A NOISY THREAT SIGNAL. IT IS A DIFFERENT QUANTITY.

HEAL      hate = floor(2/3 × min(spell BASE heal value, target's missing HP))
          cap 800 if the HEAL TARGET is level <=50, else 1500
          applied at FULL value to EVERY NPC already hating the target — not split
          each NPC rolls its own ~50% witness check
          Keys off the spell's BASE value, NOT the amount healed the log prints.
          Verified against Torven's live measurements across six spells: Remedy base 483
          healed 775 measured 320 hate — 2/3×483=322 fits, 2/3×775=516 does not.

STUN      NOT flat 200/400. clamp(target_max_HP / 15, 25, 1200) for Stun/Blind/Mez/Charm/Fear.
          Root is the flat exception at 10. The "400" is MaxScalingProcAggro, a PROC cap.
          No corroboration for 200 exists anywhere I searched.

TAUNT     new_hate = (top_hate - own_hate) + bonus + TauntOverAggro + 1; 12 if already top.

DECAY     none gradual. A 10-minute wholesale forget removes the entry entirely.
```

**Note what this means for a DPS meter too:** if melee hate is per-swing on a weapon stat, then
anything deriving *threat* from *damage* is wrong in kind, not degree. Your `refusals` output is the
right home for that.

---

## 10. THE IN-GAME AGGRO METER EXISTS AND IS UNREACHABLE

EQ Legends ships one. Evidenced from a real character's UI ini and the 25 Aug patch notes:

```
AggroMeterWnd      EQType 302 target name · 149 gauge · 305 YOUR hate % · 303 top hater NAME · 307 its %
GroupWindow        GW_AggroPctPlayer1..11 bound to EQType 1301..1311 — ELEVEN per-member percentages
ExtendedTargetWnd  EQTypes 314..333 — twenty per-target hate percentages
```

**The value never reaches disk.** It is a data binding onto a gauge, never a chat message, so `/log`
cannot emit it — an enumerated absence with a mechanism, not a failed grep. Every `%` in 3.9M lines
is experience gain. The only programmatic accessors read client memory, which Daybreak ToS §7.1
forbids and which this project will not do.

**So coefficients cannot be fitted against ground truth. Do not spend time looking for a route; I
already did and this is the answer.**

---

## 11. METHOD — the two-vantage instrument, which is reusable

Two characters logged the same hours from two clients. Restricted to **demonstrated co-presence**
(both logs recording activity against the same target within ±2s):

```
melee damage    99.8%      spell damage   100.0%
healing        100.0%      casts          100.0%
```

**A client sees essentially ALL of a co-present player's actions.** That answers "can a one-client
log support a multi-player meter" — it can, when they are together.

**THE NUMBER I DID NOT PUBLISH, and why it matters to you:** over the raw 23.24-hour overlap the
same comparison gave **42.2%**. That is the wrong denominator — it includes hours the two were in
different zones, so it measures how much of one player's playtime was near the other, not
visibility. **If you compute a coverage figure, check what your denominator is actually a
denominator of.**

**Encounter window:** coverage saturates at **15s** (5s→339 events, 15s→385, flat to 900s), and
widening past that DEGRADES agreement 72.2%→63.4% because a distant observation is less relevant.
Chosen because the curve flattens, not because it felt right.

---

## 12. WHAT SHARA ALREADY HAS, since you will be replacing it

Her DPS meter is **app code, not a module**: `src/main/damageEngine.js` + `src/shared/damageLines.js`
+ `test/damage-parser.test.js` + `test/damage-parser-unlock.test.js`.

`damageLines.js` is good and you should read it before writing another parser. Every pattern carries
its measured count, and it documents a trap worth having: **the apostrophe-s in
`"A pledge familiar has taken 32 damage from Denon's Disruptive Discord V by Baxa."` belongs to the
SPELL, not the caster — 44,508 lines are shaped that way, and reading the possessive as the attacker
would be confidently wrong on every one.**

**After we both land there will be three parsers reading the same lines — hers, yours, mine.** Mine
is deliberately self-contained so it drops in with zero dependencies, and that is exactly the
property that let it disagree with hers about `frenzies on` for a day. Worth a conversation.

---

*Session C, 1 September. Nothing here is waiting on an answer. If any of it is wrong, it is wrong in
a way I would rather know about — every claim above names what it was measured on.*
