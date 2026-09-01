# Replace `modules/aggro-board.js` before release — 1 September

**One file swap. `proposed/modules/aggro-board.js` → your `modules/aggro-board.js`. Nothing else
changes.**

You merged the module in PR #32 about an hour ago. **I found three defects in it after you took it,
and fixed them.** The version on your master has all three.

---

## The one that matters

**Your current copy names a tank after a single mob swing.** Verified by running both files:

```
her copy on master : aggro-holder     "Grimtusk"
corrected file     : aggro-watching   "Aggro — watching (1 swing)"
```

One swing is not a reading. A player glancing at the overlay two seconds into a pull would see a
confident name built on one observation, with nothing to tell them so.

## And two smaller ones

**The tile showed a bare name, so 4 observations looked exactly like 4,000.** The counts are now on
the tile, always:

```
"Grimtusk (4)  ▸ Nyssara (1)"        reads thin
"Grimtusk (312)  ▸ Nyssara (48)"     reads solid
```

No threshold, no setting, nothing to tune — the evidence is shown rather than judged.

**`(+3)` rendered identically to `(+3000)`.** In a raid a three-swing lead is noise and it looked
like a finding. That setting is gone; the counts replace it. **Your settings page loses
"Show the lead over second place" and keeps the stale-seconds slider.** That is the only visible
change to your UI.

## And a fourth, which YOUR parser found in mine

**Your `src/shared/damageLines.js` lists `frenzies on` as one token. Mine had bare `frenzies`.**

That is **20,305 lines** in this corpus, 407 of them from article-prefixed mobs — and my module was
**silently dropping every one of those aggro observations**, because after matching `frenzies` the
pattern looked for a target and found `on Avenrae`. Not mis-attributed. Invisible.

**My own residual check could not see it.** I had verified the verb lexicon at "residual 0 over
642,043 lines" — but a residual counts lines that FAILED to parse, never lines that parsed into the
wrong fields. The claim was true and did not mean what I took it to mean. Your parser had the right
answer and a comment explaining why.

I have also taken the four stems you carry that my corpus never produced — `gnaws`, `lashes`,
`flurries`, and the rest — since yours were measured on your own logs and tolerance costs nothing.

---

## Verified against your code, not against my reading of it

I ran **your `ModuleHost`** — your `validateModule`, your `loadModules`, your registry — against
the replacement file:

```
registered: 1    errors: 0    id=aggro-board  hasAura=true  page controls=1
speed: 0.87us/line over 354,786 real log lines; worst call 11.5ms against your 50ms guard
exactly one live tile across all 4,614 emissions
agreement with the game's own aggro line: 85.3% (139/163)
```

`require()` calls: **0**. Still one self-contained file.

## One thing you should know rather than act on

The module deliberately shows **no threat number** — only who the mob is actually swinging at. A
threat magnitude cannot be computed honestly from an EverQuest log: melee hate is charged per swing
from the weapon's damage stat, which never appears in a log line, and misses generate hate and are
never logged. The reasoning is in the file's header if you ever want it.

*Session C, 1 September. If you have already shipped, this is still a straight swap — no state, no
migration, no settings lost except the one control named above.*
