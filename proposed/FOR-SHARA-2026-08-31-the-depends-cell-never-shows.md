# The "depends" cell can never appear in the shipped app — 31 August

**Low priority, not a bug, and nothing here should touch Tuesday's release.** It is a design
question you may already have decided, and if so this is just me writing down that I checked.

---

## What I found

You have a complete UI for a lockout cell state called `conditional`:

```
main-window.js:4818   conditional: { text: 'depends',
                        title: 'Falls either way depending on the reset hour, which has never been measured.' }
main-window.js:4939   (grid.conditionalCount ? ` · ${grid.conditionalCount} depends` : '')
main-window.css:2302  .lockout-conditional { background: rgba(232, 176, 75, 0.22); }
```

Amber cell, a "depends" label, a tooltip that explains itself, and a count in the summary line.

**Nothing in the app can produce it.** Four links, each read from source:

1. `lockoutService.js` passes `boundaryCivil` on every call, and says so in its own comment —
   *"ALWAYS pass boundaryCivil ... lockoutCore's resetWeekday/resetHour math path is only correct
   on a machine whose clock IS US Eastern. Production must never rely on it."*
2. `lockoutCore.js:1710` — `const hourKnown = !!opts.boundaryCivil || hour !== null;` So
   `hourKnown` is **always true in production**, whatever the hour is.
3. `lockoutCore.js:1725` — `const boundaryDayEnd = hourKnown ? boundaryDayStart : boundaryDayStart + 86400000;`
   With `hourKnown` true the boundary-day window is **zero width**, so no kill is ever "on the
   boundary day" and the `s: 'conditional'` return at `:1876` cannot be reached.
4. `lockoutCore.js:1818` — `const onBoundaryDay = !hourKnown && ...` is always false, so
   `cellState = 'conditional'` at `:1946` cannot be reached either.

I enumerated **every** occurrence of `conditional` in `lockoutCore.js` — 18 of them — rather than
searching for the two I expected, so those are the only two assignment sites there are.

**Honest limit: this is a source-level conclusion, not a runtime one.** I wrote a probe to
demonstrate it by running your module, and the probe could not produce a `conditional` cell in
*any* configuration, including the one where it should appear. A test that cannot produce the thing
it is looking for proves nothing about its absence, so I am not offering it as evidence and I am
telling you it failed rather than quietly leaning on the source read alone.

## Why it is not a bug

**It follows from a decision you made deliberately, and the decision looks right.** `lockoutCore`
refuses to invent a reset hour — `RESET_RULE.hour` is `null`, `provenance: 'stated'` — and emits
`conditional` on the boundary day to say "this falls either way." Your host supplies a
user-editable default of 11:00 instead, so the player gets an actual answer and can correct it if
they know better. A cell that says *depends* is worse than a cell that says *open* if the player
can just set the hour.

So the state is dead because the ambiguity it exists to express has been resolved by a default.

## The question, which is yours

**Either the UI is dead code, or the app never shows an uncertainty it was built to show.** Both
readings are defensible and I am not recommending one:

- **If the default is the right answer** — remove the three UI fragments, or leave them as the
  landing place for the day the hour is measured. Session D notes its own module keeps the dormant
  path *tested*, as a matched pair, so the cost of the hour arriving is editing one constant.
- **If you would rather the app could say "depends"** — the host would need to pass `hour: null`
  when the player has not explicitly set one, which means distinguishing "defaulted to 11" from
  "the user chose 11". Today those are the same value and nothing can tell them apart.

The tooltip you wrote — *"the reset hour, which has never been measured"* — is the most honest
sentence in the lockouts UI, and it is the one string a player can never see. That is the whole of
why I am mentioning it.

---

## Unrelated, and it confirms something of yours

Session D measured the unstamped-line rate independently, on a different corpus:

```
D's corpus     749,255 lines     22 unstamped     0.003%
your comment   1,761,090 lines   10 unstamped
```

Two independent measurements on different logs, both around three per hundred thousand. **Your
splitter alarms at 5% with a 200-line minimum — roughly a 1,600x margin over the observed floor**,
which is a wide enough gap that the alarm will not cry wolf. D's phrasing of the same point is
worth having: *"a host that alarms on `dropped.unstamped > 0` will alarm on every real log."* You
did not do that; you picked a rate and a minimum. That was the right call and now it has a second
corpus behind it.

*Session C, 31 August. Nothing here is waiting on an answer, and nothing here is for Tuesday.*
