# Correction: the one-line CI gate I recommended would break every release — 30 August

**This corrects my own note from this morning, and it matters before you act on it rather than
after.** I told you the remedy for the untested release was one line — `- run: npm test` between
`npm ci` and `npm run dist`. I also said I had not verified the suite passes on a clean runner, and
that if it turned out fragile the honest answer might be to leave the pipeline alone.

**I have now measured it. Added today, that line would fail your very next release.**

---

## What happens

Your suite passes on your machine and fails on a CI runner, because your machine is in US Eastern
and GitHub's runners are UTC. Measured on your `master` at `508c5e72`, same tree, same command, the
only variable being the clock:

```
TZ=America/New_York    exit 0    log-rotation: 66 passed
TZ=UTC                 exit 1    log-rotation: 58 passed, 8 FAILED
```

Deterministic, and the eight are all in `test/log-rotation.test.js`. They are **real assertion
failures**, not a missing module — the diffs read `+ '2026-08-25 15:00'` against
`- '2026-08-25 11:00'`, and `15 !== 11`.

## Your code is right. The tests are the problem

**15:00 UTC *is* 11:00 Eastern.** `easternReset.js` returns the correct absolute instant in every
zone. What fails is the tests: they build inputs with local `new Date(y, m, d, h, mi)` and read the
result back with `getHours()` and `boundaryKey()`, both of which report **the machine's** zone. On
an Eastern machine those coincide with the reset's zone. Nowhere else.

**So nothing your users see is wrong.** This is entirely about whether the suite can be trusted as
a gate.

## Why it was never caught, and it is one wrong word

`test/log-rotation.test.js:117` and `:408` both say:

> *"Node on Windows ignores the TZ environment variable, so there is no way to run the difference
> here."*

**Half right, and the half that is wrong is the one that matters.** Measured on this machine:

```
TZ=UTC                 -> node resolves: UTC                  <- HONOURED
TZ=Europe/London       -> node resolves: America/New_York     <- ignored
TZ=Australia/Sydney    -> node resolves: America/New_York     <- ignored
TZ=America/Los_Angeles -> node resolves: America/New_York     <- ignored
```

Node on Windows ignores **IANA zone names** but honours **`UTC`**. So the difference *can* be run
here, in exactly the one direction that matters — because UTC is what CI uses.

**That belief cost more than these eight tests.** You wrote source-reading substitutes where you
could not run the real thing — `the week is named from local fields, never UTC ones` reads
`boundaryKey`'s source for `getUTC` rather than running it, and says why: *"a mutation no run on
this machine can catch."* That reasoning was sound given the premise. The premise was wrong, and
several of those can now be real tests.

## The fix, and it is your own convention

`proposed/tests-pass-only-in-eastern-2026-08-30.patch` — **155 lines, `test/log-rotation.test.js`
only. No source changes, no test removed, no test renamed.**

I did not invent a style for this. **Your own `test/eastern-reset.test.js` already states it:**

> *"Node on Windows ignores TZ, so these tests do not fake a zone — they check the ABSOLUTE
> INSTANTS the helper returns, which is what every consumer actually compares against."*

That suite passes under UTC today. The patch applies the same convention to the eight stragglers:
`Date.UTC(...)` for inputs, `.toISOString()` for expectations. `'2026-08-25 11:00'` becomes
`'2026-08-25T15:00:00.000Z'` — the same instant, named in a way that does not depend on where it is
read.

**One test needed more than a rewritten assertion.** `a post-reset Tuesday kill keeps the file this
week` hardcodes a log line at `14:30`. A log stamp is the *player's* wall clock — that is what EQ
writes and what `logSplitter` parses back — so on a UTC runner `14:30` is 10:30 Eastern, *before*
the reset, and the file correctly rotates, failing a test about a kill after the reset. The patch
derives that stamp from the boundary the module actually computed, so the relationship under test
holds in any zone.

### Verified, not assumed

```
applies to 508c5e72 with git apply           CLEAN
TZ=America/New_York   exit 0   66 passed     (unchanged from today)
TZ=UTC                exit 0   66 passed     (8 failures before)
whole suite, both zones: the only failure is visibility.test.js, Cannot find module 'electron'
```

And because rewriting assertions is an easy way to make a test vacuous, I checked the rewritten
ones can still fail. Freezing the DST offset at -4 year-round:

```
TZ=America/New_York   FAIL the boundary survives the daylight-saving change
TZ=UTC                FAIL the boundary survives the daylight-saving change
```

Still catches it, in both zones. Not weakened.

## Order of operations, and one thing I could not verify

**Fix the tests first, then add the gate.** The other way round breaks your release on the next
push.

**Do not reach for `env: TZ: America/New_York` on the test step instead.** It is tempting and I
cannot tell you it works: your runner is `windows-latest`, and the measurement above shows Node on
Windows ignoring IANA zone names. It may well be ignored there too, leaving the runner on UTC and
the tests still failing. **I have no Windows CI runner to test that on, so I am telling you it is
unverified rather than guessing.** Fixing the tests does not depend on which way that falls.

---

## Three other things in the release pipeline, measured while I was in there

None of these is urgent and none is a request.

**1. The `latest-dev` tag has not moved since 26 August.** The `.exe` is current — it was
re-uploaded at 20:52:49Z on the 30th, 73 seconds after the PR #22 merge, so your download link is
correct and my earlier claim about it holds. But:

```
refs/tags/latest-dev  ->  37f25eae        master is 76 commits ahead
```

`softprops/action-gh-release` refreshes an existing release's assets and body but never moves an
existing tag. So the release page's **source-code links point at a 26 August tree** beside a 30
August installer.

**2. There is no `concurrency:` group.** Enumerated — the workflow's only top-level keys are `name`,
`on`, `permissions`, `jobs`. Two pushes close together run two builds that both publish to the same
tag, and the later-finishing one wins regardless of which commit is newer.

**3. `fail_on_unmatched_files` is never set, and it defaults to false.** So a build that produces no
`.exe` still succeeds, and still rewrites the release body to name the new commit — **leaving the
previous installer in place under a description of the new one.** That is a guard that cannot fail:
the release would announce a version it does not contain, and nothing would go red. One line —
`fail_on_unmatched_files: true` — closes it, and it is worth more than it looks precisely because
the failure is silent.

## Still open from my earlier notes

- **Session D's coverage bug is still there.** The comment audit touched `lockoutCore.js` but all
  four hunks were comment lines; the arithmetic is untouched. Coverage still has two definitions —
  `state.spans` and `state.firstSeen`/`lastSeen` — and `projectGrid` binds the covered window to one
  and the gaps to the other. Reproduced on the module directly: 40 minutes of trailing chat after
  the last kill leaves `coverageTo` at 21:00 while the span reaches 21:40. **Still invisible in the
  app**, exactly as before.
- **One retracted phrase survives.** `test/log-rotation.test.js:55` still heads a section
  *"The boundary, which is a measurement"*, with the two Alt+Z readings quoted beneath it. The
  `.js`-side comment audit did not include the test files. My patch does not touch that line — it is
  wording, it is yours, and I did not want to bundle a retraction of mine into a test fix.
- **The fonts are unchanged**, which is your call and I am still not asking.

*Session C, 30 August. Nothing here is waiting on an answer, but the first section is worth reading
before you add that line.*
