# The threat meter is viable, and here is the measurement that decides it

**Session C, 31 August. Every number below is measured on real logs and every claim is falsifiable
by re-running the named script against the named files.**

---

## The Director's question, answered

> *"CAN THE LOG SEE ANOTHER PLAYER'S THREAT-GENERATING ACTIONS AT ALL? ... what FRACTION of
> another player's threat can this client see, and what must the meter say about the rest."*

**When two players are fighting the same mob, the observing client sees essentially all of it.**

This is not an inference from line shapes. It is a matched pair against ground truth.

### The experiment

Two different players logged the same hours from two different clients:

```
ground truth   eqlog_Avenrae_rivervale_2026-08-17.txt    Avenrae's own client
observer       eqlog_Shara_rivervale_2026-08-16.txt      Shara's client, watching Avenrae
```

Avenrae's own client is the best available ground truth for what Avenrae did. Shara's client is
the meter's vantage point. The ratio between them is the visible fraction, and it can be computed
per threat-input class rather than as a single number.

Restricted to **demonstrated co-presence** — a second counts only when both logs record activity
against the *same target* within ±2s. That is co-presence read out of the data, not assumed from
grouping. 2,275 such seconds across an 8.63-hour span.

### The result

```
THREAT INPUT        AVENRAE'S CLIENT   SHARA'S CLIENT    VISIBLE
melee damage                 363,890          363,199      99.8%
  (hits)                       2,999            2,996      99.9%
spell damage                 116,351          116,351     100.0%
  (hits)                         478              478     100.0%
healing                       25,745           25,745     100.0%
  (heal events)                3,021            3,021     100.0%
casts                             82               82     100.0%
DoT damage                         0           38,030         --
```

`scratchpad/two_vantage2.py`. Re-runnable.

### The DoT row is not a defect, and it points the right way

`<target> has taken N damage from <Spell> by <Actor>` is written **only for other actors, never for
yourself**. Measured in Avenrae's own log: 8,411 such lines, and **zero** carry `by Avenrae` or
`by You`.

So the two clients are partial in *complementary* directions, and **the observer is the one that
sees more.** A meter watching other players is reading exactly the stream that is richest about
them. Your own contribution comes from your own first-person lines, which you always have.

### The number I am NOT reporting, and why

A first pass over the raw 23.24-hour overlap gave **42.2% visible**, and it is wrong — or rather it
answers a different question. That window includes hours when the two were in different zones, so
it measured *how much of Avenrae's playtime was spent near Shara* as much as client visibility.
The meter only ever runs while people fight the same thing. **42.2% is the wrong denominator and
would have been a badly misleading headline.**

---

## The threat inputs, and whether each is attributable

| Input | Available | Line shape |
|---|---|---|
| Melee damage | **yes** | `Avenrae slashes a gnoll elite for 77 points of damage.` |
| Direct spell damage | **yes** | `... for 77 points of magic damage by Smite.` |
| DoT / over-time damage | **yes, others only** | `<target> has taken 92 damage from <Spell> by Avenrae.` |
| Healing | **yes** | `Avenrae healed herself for 2 hit points by Blessing of the Squire.` |
| Flat-hate spell casts | **yes** | `Feedwhy begins casting Flash of Light.` — 16,717 lines |
| Taunt | **NO — corrected** | only `Avenrae failed to taunt …` appears. **Successful taunts are unlogged**, so taunt is unusable as an instrument. I originally listed this as attributed; all 182 samples were failures. |
| Stun *effect* | no caster | `a Teir\`Dal priest is stunned by scintillating colors.` |

**Stuns: ruled, and the ruling is right.** Key on the **cast**, not the effect. The owner's source
states a stun-immune boss still takes the full hate — so on exactly the targets this meter is for,
the effect line never fires while the threat lands. Keying on the effect would have been wrong for
as long as the tool existed.

---

## Two corrections of my own, both the same fault

**1. I reported `begins to cast` as ZERO for other players.** The actual string is
**`begins casting`**. I searched for a phrasing I guessed rather than enumerating what was there,
and published a zero that was an artifact of my own regex. There are **16,717** such lines and they
are the strongest asset in the table. This nearly cost the whole flat-hate lane.

**2. The v1 engine had four defects, all found by running it rather than reading it:** healing
neither target- nor time-scoped (one player accumulated 2.96M healing across the corpus and
dominated every board); a verb lexicon polluted with mob-name fragments (`Nagafen`, `Thaggelum`,
`Overseer` reported as verbs); "encounters" spanning 1,386,938 seconds — 16 days; and players
appearing as targets because mobs hitting them leaked through the filter.

Both are the shape this project keeps finding: **an instrument that cannot return one of its two
answers, reporting a clean result.**

---

## What is NOT established, and must not ship as if it were

**THE COEFFICIENTS ARE NOT MEASURED AND I WILL NOT PRESENT THEM AS MEASURED.**

The Director asked for a source and tier on each. Honestly stated:

- **damage → hate ratio**: assumed 1:1 in the prototype. **Not sourced.** Placeholder.
- **healing → hate**: the owner states a known formula exists. **I have not found it.** Not sourced.
- **stun flat 200/400**: owner-stated. **Not independently sourced.**
- **flat-hate spell values**: the spell *list* is owner-supplied from an EQ-Legends-specific search
  and **checks out against the corpus** — `Flash of Light`, `Drowsy`, `Flame Lick`,
  `Clinging Darkness`, `Engulfing Darkness`, `Tashania` all appear as cast lines. The *values* do
  not exist anywhere I have measured.

**Consequence for the design, and it is a real one.** With unmeasured coefficients the meter can
rank confidently on damage alone, because damage is measured and 1:1 within itself. Every non-damage
input shifts a player by an amount nobody has established. **So the honest v1 is a damage-dominant
board that shows its non-damage components separately rather than silently folded into one number.**

That is still the tool the owner asked for. It is not a number pretending to be a measurement.

---

## Open, and being worked

- The research fan-out (mechanics, existing meters, which codebase EQ Legends runs on) is running.
  If Legends is a known emulator, the hate formula may be **readable from source** rather than
  inferred — which would move every coefficient above from unsourced to measured.
- Session E's parser: reading it before writing more of mine, per the Director. Three lists owed:
  what E parses, what E parses but discards, what E does not see.
- `EQL multi-class`: the owner's source says a character runs **three active classes**. Class
  inference from spells is therefore many-to-one and cannot identify a player's class from one cast.

*Session C, 31 August.*

---

## The bound is actor identity, not visibility — and the catalogue join solves it

**Session E found the constraint that actually limits this tool, and it is a different axis from
mine.** I measured that a client *can see* other players. E measured that the client *cannot tell
which name-shaped actor is a person*. Both are true and E's is the one that would have shipped a
broken product.

### Confirmed on 13 logs, and worse than E measured on one

```
actor                    lines     damage   inCatalog  heals   VERDICT
Avenrae                 104619    7027187   -          74876   person
Innoruuk`s Chosen        17427    1911171   YES           67   NOT-A-PERSON
Heart harpie             10700    2428388   YES            0   NOT-A-PERSON
Azzudien                  8370     825109   -           2093   person
Ice boned skeleton        3447      25753   YES            0   NOT-A-PERSON
Bzzazzt                   2520     452152   YES           16   NOT-A-PERSON
```

**Two charm pets take #2 and #3 on a raw damage leaderboard**, above every human except one. A
top-4 built on name-shaped actors ships a charmed mob at the top and cannot know it did.

### The fix, measured

A charm pet is a mob, so it appears in B's mob-name population. Joining **actors** (not targets)
against `bis-catalog.json` `records[].src.m` removes mobs and charmed mobs in one operation.

```
over all 305 name-shaped melee actors
  person          66 actors   179,118 melee lines   74.5%
  NOT-A-PERSON   130 actors    58,944 melee lines   24.5%
  unknown        109 actors     2,323 melee lines    1.0%
```

**The unknown bucket is 1.0% of melee activity.** The three-way is usable rather than a shrug: 99%
of activity is confidently classified and the residue is displayed, not dropped.

Discriminators, in order: (1) in B's catalogue → not-a-person; (2) heals a named target 3+ times →
person; (3) otherwise unknown. `Heart harpie` heals nothing, which is corroboration rather than the
test.

### A false negative I am flagging before it ships

The catalogue check runs first, so **a player whose name collides with a catalogue mob name is
silently removed from the board.** That is the dangerous direction — a real person vanishing from
their own leaderboard, with no signal. The rule must be: a collision produces `unknown`, never
`not-a-person`, unless a second discriminator agrees.

`src.m` carries 2,315 distinct names against 656 observed melee actors, so the collision surface is
real and I have not measured its rate. **NOT_ESTABLISHED**, and it is the next measurement.

### The only direct evidence the log gives about pets

59 lines of the form `<name> pet has been slain by <killer>` name a pet explicitly — and every one
is article-prefixed (`A dracoliche pet`, `A fire giant warrior pet`). **No line in 2.39M names a
charm pet's owner**, and there are 18 group-join lines in the whole corpus. There is no roster in
the log, which is why the external catalogue is doing this work.

*Session C, 31 August.*
