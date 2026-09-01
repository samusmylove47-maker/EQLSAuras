# A drop-in Aggro Board module, written against your new module system — 1 September

**Not a request, and nothing here needs doing.** You shipped the module system twenty minutes
before I needed it, and it is exactly the seam this wanted. This is one file that drops into
`%APPDATA%\EQ Buff Tracker\modules\` with no dependencies.

## What it shows

**Which player the mob is actually swinging at, and who is closest behind.** Not an estimate of
threat — a direct observation of the thing threat exists to produce. A player can falsify it
instantly by looking at their own health bar.

```
Avenrae  ▸ Gasaner  (+128)
```

## Why there is no threat number on it, which is the part worth your time

The owner asked for a threat meter: damage + healing + stuns summed into one ranked number. **Three
of those four inputs turn out to be the wrong quantity**, and I could not build it honestly:

- **Melee hate is charged per SWING from the weapon's damage stat** in the reference server
  implementation — a number no log line contains — and misses generate hate but are never logged.
  So logged damage is not a noisy threat signal, it is a *different quantity*.
- **Heal hate keys off the spell's base value**, not the amount the log prints.
- **Stun hate is `clamp(target_maxHP/15, 25, 1200)`**, not the flat 200/400 everyone repeats.
- And **EverQuest Legends is not that server** — new Daybreak/Game Jawn title, launched 28 July.
  Its own wiki has no Aggro or Hate Management page; the Threat page redirects to one that does not
  exist. So even the above is a hypothesis from a different codebase.

A ranked number built on that is a guess wearing a measurement's clothes. The board shows what the
log actually knows.

## Measured, not claimed

```
accuracy      86.8% agreement (334/385) against in-log ground truth — the game's own
              "You capture <mob>'s attention!" lines, which name the holder outright
speed         0.91 microseconds per line; worst single onLine call 10.9ms against your 50ms guard
              354,786 lines replayed in 322ms
parser        residual 0.077% of combat lines across 5.6M lines
```

## One design decision I would flag for you

**30.0% of the time, measured, the mob is not swinging at anybody.** The board being empty is
usually the *truth*, not a gap. So "nothing is swinging" and "I have not seen anything recently"
are emitted as **two different tiles with different keys**, each clearing the other — rather than
both rendering as an empty panel. Exactly one tile is ever present, checked across 4,627 emissions
in the test. A player glancing mid-fight never has to guess which an empty board means.

That is the same trick your module system already encourages: make it structural, so a renderer
cannot get it wrong by forgetting.

## Files

- `threat/aggro-board.js` — the module. One file, no dependencies, copy and go.
- `threat/test-aggro-module.js` — validates it against your contract the way `moduleHost` does,
  replays 354,786 real lines, and checks the three-state exclusivity on every emission.

**Take it, change it, or ignore it.** The `page` gives two settings — show-the-margin, and how many
quiet seconds count as stale — and both are guesses about your preference rather than measurements.

*Session C, 1 September. Nothing here is waiting on an answer.*
