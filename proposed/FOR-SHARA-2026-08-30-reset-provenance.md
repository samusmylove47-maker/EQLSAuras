# The comment I gave you about the reset is wrong — 30 August

**Your setting is fine. The paragraph justifying it is mine, and I retracted it today.** Nothing
here needs doing tonight and none of it is a request.

**One thing I did not know when I first wrote this, and it is why I am not sitting on it.** It is not
only in `master` — it is in the **published installer**. `.github/workflows/build-installer.yml`
triggers on every push to `master`, and the `latest-dev` asset `EQLS-Auras-Setup.exe` rebuilt at
**18:51:07Z**, seventy-three seconds after your PR #20 merge at 18:49:54Z. So anyone who downloads
"Latest build" gets a copy of the paragraph.

**To be exact about what that does and does not mean:** the *code* is fine and behaves correctly.
What ships is a wrong **explanation** of where a number came from. Nobody is misled by the app; a
person reading the source is.

---

## What is in your tree

`src/main/logRotation.js`, lines 24–28 and 42, in the build you merged:

> `// THE RESET, MEASURED RATHER THAN TYPED. Tuesday, 11:00 US Eastern. Two Alt+Z readings 10.84`
> `// hours apart ... a measurement, not a constant somebody typed.`
>
> `// 0 = Sunday, so 2 = Tuesday. Measured (Alt+Z, see the header); overridable by the user`

**I wrote that. It overstates what those two readings show, and I withdrew it earlier today.**

## What the two readings actually establish

They are real and they agree to six seconds. What they give is an **expiry instant** — for whatever
the thirty-six rows in that window were. They do **not** establish a reset, a weekly period, or a
Tuesday boundary. Three things went wrong with my reasoning:

**The rows are the wrong object.** Session D's module documents that window as **28 rows plus 8
rows**, under a heading that says *"THREE DIFFERENT OBJECTS. DO NOT MERGE THEM."* The 28 are the
**instance lockout** — described there as *"A SIX-DAY ROLLING TIMER from when it is taken. There is
no weekday and no boundary."* The arithmetic settles it: 518,285 s − 3,485 s = **514,800 s**, which
is exactly the figure D measured from that same window. A player in General chat that week said it
plainly: *"alt+z is instances."*

**Two readings of one countdown cannot disagree.** They extrapolate to the same zero *by
construction*. The six-second agreement measures clock drift — about 154 parts per million — and
nothing about what the counter counts. I presented it as corroboration; it is arithmetic.

**Four different periods fit equally well.** Sweeping the same two readings, **4, 5, 6 and 7 days are
all consistent to the same six seconds.** Only three days is excluded. Six days puts the anchor on a
**Wednesday**.

## What this does and does not mean for your setting

**It does not mean 11:00 Eastern is wrong.** It may well be right — it is inside the bracket the
lockout work measured independently, and it matches the value the one other public tool uses. It
means **nobody has established it**, and the comment should not say we have.

**Your design is better than mine and that is the part worth saying.** You made the hour an *option*
— `resetWeekday` / `resetHour` / `boundaryCivil`, with `hourKnown` gating the behaviour and
`RESET_RULE` as the fallback — and you left `RESET_RULE.hour` as `null`. So the number is a default a
user can correct rather than a fact baked into the parser, and a player in another timezone can fix
it themselves. My version hardcoded it. Yours does not, and it also solved something I had reported
as an open problem: I had found that the hour had nowhere to go, because nothing in the parser read
it. You built the path.

## Suggested replacement wording, if you want it

Only the comment. No code change.

> `// THE RESET. Tuesday, 11:00 US Eastern, and this is a DEFAULT rather than a measurement.`
> `// Two Alt+Z readings agree on an expiry instant to six seconds, but that window is the`
> `// six-day rolling instance lockout, not the weekly reset - 4, 5, 6 and 7 day periods all fit`
> `// the same two readings. The value is consistent with the independently measured bracket and`
> `// with the only other public tool, and it is overridable by the user, which is why it is safe`
> `// to ship as a starting point. It is not something anyone has observed.`

## One more thing, unrelated to the wording

Session D found a real bug in the lockout parser today: **coverage had two definitions and the grid
read both.** On your logs it under-reports the covered window by about 45 minutes at the end. It does
**not** change any cell, any count, or the gap figures — and the two affected fields are not shown
anywhere in the app — so nothing you can see is or was wrong. Fixed in D's tree at `fe14728` if you
re-take the parser.

*Session C, 30 August. Nothing here is waiting on an answer.*
