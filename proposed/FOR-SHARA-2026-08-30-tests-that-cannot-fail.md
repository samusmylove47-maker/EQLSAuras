# Three tests in your suite pass when the thing they test is switched off — 30 August

**Nothing here is a request, and the first section is me telling you that you already fixed the
thing I wrote to you about this morning, and fixed it better than I asked.**

---

## First: the reset comment. Done, and you went further than the note

I sent a note saying the provenance comment in `src/main/logRotation.js` overclaimed — that it
called the 11:00 hour *measured* when the two Alt+Z readings actually describe a six-day rolling
instance lockout, and that 4, 5, 6 and 7-day periods all fit them equally well.

**Measured on your `master` at `508c5e72`, that is done.** `lockoutCore.js` now reads:

```js
hour: null,                    // not recorded
provenance: 'stated',          // NOT 'measured'. We did not observe this.
```

And three things you did that I did not ask for and would not have thought to ask for:

- **`src/shared/easternReset.js`.** The reset is now an *Eastern* wall-clock time resolved to an
  absolute instant through `Intl`, with the daylight-saving change handled and the spring-forward
  gap given an explicit answer. **My version used `setHours` in the machine's local zone**, so a
  player in London or on Pacific got a boundary hours away from the server's. Yours is correct and
  mine was not.
- **You collapsed `rotationCutBefore` back into `resetBoundaryBefore`** and left the reason in the
  file — naming commit `6834d78`, what its bug was, and the instruction to re-introduce the split
  *there* if the grid ever goes back to an unknown hour. That is the finding kept where it would be
  needed again rather than in a changelog nobody reads.
- **The rule became a parameter** rather than a module constant, wired through `lockoutReset` to a
  user-editable setting.

**One thing I checked and want to tell you came out clean, because it is the kind of thing that
usually does not.** I thought the two might have drifted apart again — the rotation defaulting to
hour 11 while `lockoutCore`'s `RESET_RULE.hour` is still `null`, which would silently re-open the
gap your own comment warns about. It cannot happen: `lockoutService` seeds `{ weekday: 2, hour: 11 }`
and its setter falls back to *the existing hour* rather than to null, as does the rotation's. There
is no path through the tree that drives either to `null`. **The guard holds because of how it is
built, not by luck.**

**And you should not take my integration branch.** `session-c/feat-lockouts-wip` is four commits
away from a merge-base of `6834d78` — the commit your comment names as the bug — while your master
has forty-nine. Its only `src/` change is to the file you have since rewritten properly. Merging it
would regress the timezone handling.

---

## The one thing still live, and it matters more if you add the test gate

**Three tests in `test/log-splitter.test.js` pass against a splitter that has been switched off.**

They assert only that no alarm fired. Nothing fired, so they pass. Measured on your `master` by
making `_processOnce` return immediately — a splitter that reads nothing at all:

```
a normal log with a wrapped broadcast raises nothing   ok     <- on a splitter that read NOTHING
a tiny batch is not enough to accuse the parser        ok
a quiet window resets rather than accumulating         ok
```

The load-bearing line was `assert.ok(s.getStatus().unstampedRatio < 0.01)`, and **`0/0` is `0`**, so
it is satisfied by having done nothing.

**And `test/log-rotation.test.js` has one measured by the length of a comment.** The test
`both host guards are wired to record` reads a fixed 260-character window from each guard name and
looks for `noteHostSkip` inside it. It only works because a long comment block sits between your two
guards. Shorten that comment and delete the first guard's own `noteHostSkip`, and:

```
the 260-char version   ok       66 passed
```

A guard that returns without recording, and the test says fine.

### Why this is worth more than it looks

**If you add `- run: npm test` to the release workflow** — the one-line gate from my other note —
these four tests become part of what stands between a push and a 78 MB installer. A gate built on
tests that pass on inert input is the failure that looks most like success. I would rather hand you
this before the gate than after.

## The patch, and what it does

`proposed/tests-that-cannot-fail-2026-08-30.patch`, 130 lines, **test files only — no source
changes.** It applies cleanly to `508c5e72` with `git apply`, and I ran it on a fresh copy of your
tree to check that rather than assuming it.

It does two things:

1. **Adds proof-of-work assertions** to the three quiet tests — that the lines actually got read —
   so a switched-off splitter fails them.
2. **Adds the matched half of each pair**: the same log, same batching, same generator, differing
   *only* in the unstamped rate, asserting the alarm *does* fire. A detector is shown to work by a
   pair differing in the one thing being detected, never by a negative alone.
3. **Replaces the 260-character window** with a span ending at the guard's own `return;`, plus an
   assertion that the function contains exactly two `noteHostSkip` calls, so neither guard can
   borrow its neighbour's.

### The evidence that it works, which is the only reason to take it

Run on your tree, not mine. Green first:

```
log-splitter:  19 passed  ->  22 passed
log-rotation:  66 passed  ->  66 passed        (no test lost, none rewritten)
```

Then each thing broken deliberately, to check the new tests can actually fail:

```
splitter made inert            -> the 3 quiet tests FAIL   (they pass on master today)
alarm handler disconnected     -> the 3 new halves FAIL
first host guard silenced      -> the guard test FAILS     (it passes on master today)
```

## What it costs, because a patch offered without its cost is not an offer

**Three more tests to run, about a second, and one behaviour change worth knowing:** the new
`the same rate over enough lines` test writes 300 lines to a temp file. If your CI ever runs with a
read-only temp directory it would fail there — as would several tests you already have, so this
does not add a new class of problem.

**And it will make a real failure noisier.** That is the point of it, but it means if the splitter's
alarm is ever *deliberately* disabled, six tests go red rather than none. If you would rather keep
the quiet tests as they are, the proof-of-work lines alone — three assertions, no new tests — get
most of the value. Take the whole thing, half of it, or none.

*Session C, 30 August. Nothing here is waiting on an answer.*
