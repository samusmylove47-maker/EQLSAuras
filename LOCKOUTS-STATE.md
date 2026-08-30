# Lockout integration — state of the work

**Written 27–28 August 2026 by Session C. Updated 29 August with the weekly log rotation.**
Read this first if you are picking the lockout work back up with no memory of doing it.

`HANDOFF.md` items 12 and 13 are the Director-facing reports and carry the reasoning. This file is
the operational one: where the work physically is, how to get back to it, and what is left.

---

## 1. WHERE THE WORK IS, AND HOW TO GET IT BACK

**The work is safe.** It is three commits on a branch in Shara's own repository, on her real disk.
A wiped temp directory does not lose it.

| | |
|---|---|
| branch | `feat/lockouts` |
| based on | `origin/master` @ `764b16d` (her published build) |
| head | `6834d78` (thirteen commits) |
| lives in | `C:\Users\Lindsey\EQ tracker\.git` — ref at `refs/heads/feat/lockouts` |
| checked out at | a **temp** worktree under `…/scratchpad/integrate` — **this path may not survive** |
| pushed | **nowhere.** No push access to `LoxyBee/EQLS-Auras`, and it must not go to the band repo |

**If the temp worktree is gone**, from `C:\Users\Lindsey\EQ tracker`:

```
git worktree prune
git worktree add <some-path> feat/lockouts
```

Then link node_modules so the tests can run (the suite needs Electron present, though it never
launches it):

```
cmd /c mklink /J "<some-path>\node_modules" "C:\Users\Lindsey\EQ tracker\node_modules"
```

**DO NOT check this branch out in her working copy.** Her checkout is at
`C:\Users\Lindsey\EQ tracker` on `feat/eql-roster-and-backlog`, tree clean, and has been left
untouched throughout. Keep it that way.

**Session D's module** is a public repo, re-clonable at any time:
`https://github.com/samusmylove47-maker/EQLSLockouts` (read `docs/CANON.md` **before** any source).

---

## 2. WHAT THE BRANCH CONTAINS

**Eleven files, 3,276 insertions, ZERO deletions.** Nothing was removed or rewritten; every change
is additive. That was deliberate — the app is published and people have installed it.

| file | what it is |
|---|---|
| `src/main/lockoutCore.js` | **THEIRS**, vendored verbatim, 2,175 lines. Zero requires, no clock, no filesystem. **Do not edit it here** — fixes belong upstream or the next version silently reverts them |
| `src/main/lockoutService.js` | **MINE.** The host side: folder scan, one state per character, streamed backfill, projection, error containment |
| `src/main/main.js` | +37: construct, wire onto the line bus, inject the two lookups, debounced broadcast, two IPC handlers |
| `src/main/mainWindow.js` | +60: `EQLS_SMOKE` renderer-console forwarder and the fixed probe. Off unless the env var is set |
| `src/preload/preload-main.js` | +6: `getLockouts`, `rescanLockouts`, two listeners. Read-only from the renderer |
| `src/renderer/main-window/index.html` | +51: nav button and the `page-lockouts` section |
| `src/renderer/main-window/main-window.js` | +206: the grid renderer |
| `src/renderer/main-window/main-window.css` | +41: five cell-state styles plus the gap warning |
| `test/lockouts.test.js` | **MINE**, 20 cases |
| `tools/smoke-render.js` | **MINE.** Launches the real app, opens the page, reports what rendered |
| `src/main/eqLocator.js` | +10, **its own separate commit** so it can be taken or dropped independently |
| `src/main/logRotation.js` | **MINE**, 465 lines. The weekly rotation. Zero Electron, injectable clock and folder |
| `test/log-rotation.test.js` | **MINE**, 50 cases, every guard mutation-checked |
| `src/main/logSplitter.js` | +16 −1, **its own commit.** The stamp pattern, and one export |
| `tools/smoke-render.js` | `EQLS_SMOKE_HOLD_MS` so a timer-driven feature can be observed |

### The five commits, and why they are separate

1. `9fd8723` — the integration.
2. `c4ff4b0` — **auto-detect finds EverQuest Legends.** Independent of the lockout work on purpose.
3. `f0f185c` — the two bugs the adversarial audit found.
4. `2bf1e1a` — **the splitter's timestamp pattern.** A bug in her *shipped* Split feature, separate
   so she can take it alone. See (k).
5. `725e3ea` — the weekly log rotation. See §8.

---

## 3. HOW TO VERIFY IT, AND WHAT THE ANSWERS SHOULD BE

```
node test/run.js                              -> all 65 suites               (hers: 62)
node tools/smoke-render.js                    -> renderer ERRORS 0, and a PROBE line
EQLS_SMOKE=rotation EQLS_SMOKE_HOLD_MS=95000 \
  node tools/smoke-render.js                  -> the rotation card, after a real check
node tools/replay-log.js                      -> 124 / 210,185 / 838 / 23 / 91
```

The rotation probe needs the long hold because the check runs on a sixty-second timer; at the
default 22 s it reports a card that has not been told anything yet. Against the live log on
29 August it reads:

```
PROBE: setupVisible=true checkboxPresent=true checked=true
       statusText=" Waiting for a quiet moment - the game is writing to the log right now."
       lastCheck.reason="the log is being written to right now; will try again shortly"
       boundaryDate="2026-08-25"
```

**That run does not rotate anything and must not.** Her live log spans the boundary (first line
19 Aug, last line today), so the spans-boundary guard refuses it — predictable in advance by
reading the first and last stamps, which is worth doing before ever letting the real app run a
check against a real folder.

**The replay figures are NOT the old baseline.** Mine was 129 / 211,546 / 840 / 27 / 91. The
current numbers come from **her** P0 detection rework in the 27 commits she made after my handover.
Verified with a control: pristine `origin/master` and my branch give **identical** figures, so the
integration moves detection by exactly zero. **Her README still records the old baseline and it is
stale** — that is a reported finding, not a regression.

The smoke probe against the live log should read roughly:

```
PROBE: visible=true rows=6 cells=25
       states={"lockout-open":14,"lockout-completed":10,"lockout-conditional":1}
```

`node --test test/` is broken on Node 24 / Windows in D's repo — run their suites individually
(`node test/lockout.test.js` etc.; 93 tests, 0 fail).

---

## 4. DEFECTS — FOUND, FIXED, AND OUTSTANDING

### Fixed on the branch

**a. Change detection died at the event cap (MINE, would have shipped).** I used
`state.events.length !== before`. `events` is capped at 5,000 and trimmed push-then-shift, so once
full **the length never changes again** — and a backfill of her corpus fills it exactly. The live
grid would have frozen the moment the app finished loading. Now fingerprints the five collections
the projections actually read (`kills`, `requests`, `grants`, `tasks`, `instances`, `seenCount`).
Regression test saturates the cap and fails if a real change is silent.

**b. Unmapped cell state (MINE).** I mapped the UI to `uncertain` — the name of the *count* — where
the state the core sets is `unknown`. Unmapped states print their raw key unstyled. The test now
derives the state list from the core.

**c. Tolerated coverage gaps were invisible (THEIRS, surfaced by me).** A hole under 24 h is marked
`tolerated` and the cell still reads **open**, whose own `because` says "coverage spans the period".
Their page renders `coverageHoles`, which **excludes** exactly those. Measured on the live log:
**7 gaps, 54.9 hours, all tolerated, under 14 confident "open" cells.** The page now states this
above the grid; a test requires the UI read `coverageGaps` and **not** `coverageHoles`.

### Fixed on the branch — the weekly rotation, all found by attacking it before shipping

Five independent attackers plus mutation testing. **Three of the five are mine.**

**l. It would have emptied the CURRENT week out of the live log (MINE).** The head check only
caught a log that was *entirely* current. One that started before the reset and carried on past it
was archived whole — and the grid reads the live log, never `Archive/`. Measured end to end: three
bosses killed on a Tuesday night, then a late rotation, and the grid afterwards read **open for all
three with no uncertainty markers** — confidently telling the player to re-clear raids they are
locked out of. A control with the feature switched off gave the honest `conditional`. **The feature
turned a correct answer into a confident wrong one.** Now refuses any log holding both weeks
(`skippedSpansBoundary`) and says so on the card.

**m. A failed attempt left its archive behind (MINE).** The archive filename is the only record of
whether a week was done, so a half-finished attempt answered "already done" for the rest of the
week. Four routes in, all demonstrated: the log grew during the copy; the truncate threw EPERM on a
read-only log; the disk filled mid-copy leaving **100 bytes of a 1,060-byte log as that week's
permanent archive**; a directory at the archive path. In every case `lastError` read `null`. A
failure now removes what it left, records itself, and the next check retries.

**n. The startup rotation could not tell quiet from ignorance (MINE).** `logWatcher` opens the log
**at the end** and emits nothing for existing content, so at launch nothing had ever been heard and
`Date.now() - lastLogLineAt` was vacuously enormous — every log read as silent, including one the
game was writing to. On this machine, on the day it was found, **launching =Auras would have
emptied a 143 MB log mid-session.** The clock now starts at launch and the check runs on a timer.

**o. Rotation dragged the watcher onto another character.** Rotating renews every log's mtime and
the watcher follows the newest file, so emptying a mule's log after the played one moved the tailer
to the mule — losing every line until the next 3-second directory scan, for buffs and everything
else on that feed, not just lockouts. The watched log is now rotated **last**. Each file is also
judged on its own mtime, because a boxed second account writes to a log the tailer never sees.

**p. A check that decided nothing said nothing.** Found by running the app for ninety-five seconds:
a check had certainly happened and the card was blank, because the commonest outcome of all — the
game is writing right now — returned before recording anything. **Working-and-waiting looked
exactly like dead.** Every exit now records itself and the card names the state.

**Two tests that proved nothing, rewritten.** The daylight-saving test sampled dates whose
look-back never crossed a transition — three mutations replacing calendar arithmetic with fixed
24-hour days survived it. The copy-before-truncate test forced its failure with a *file* where
`Archive/` had to go, so `mkdirSync` threw a line before the truncate: it passed against code that
truncated first. Both now fail for the right reason.

### Outstanding, reported, not fixed — Session D's module

**d. `lockoutEngine.js:55-61` has bug (a).** Their optional adapter, same shape. 5,200 accepted
observations → 5,000 emissions, **200 missed**, arriving after ~17 days of persisted state. **Their
core is fine**; the adapter is the defect. `FOR-AURAS.md` should say "call the core directly".

**e. Clause 6 breaks at `MAX_SEEN` (200,000).** 260,000 distinct observations fed twice →
**159,999 accepted a second time**, `dropped.beyondDedupeHorizon` reading **0**. The guard meant to
announce it is unreachable: `seenCount++` then `pruneSeen` halves it before the L1208 comparison, so
it is live only on the single line where `seenCount === 200000` exactly. Reachable at ~681 days of
accumulated per-character state at the measured 293.6 observations/day; state persists, so it
accumulates.

**f. Clause 7: five collections have no cap at all** — `grants`, `tasks`,
`tasks[].assignments`, `spans`, `instances`, all read. Her real corpus is nowhere near (grants 3,
tasks 3, instances 23, spans 12). A principle failure, not a live one.

**Neither (e) nor (f) blocks 1 September.**

### Outstanding — her published build, nothing to do with lockouts

**g. An unreadable settings file is replaced with defaults.** `src/main/store.js` `loadJson` has one
`catch` for every failure, so "missing" and "present but unreadable" both return defaults — and the
next save writes those defaults **over the real file**. Consequence: silent total loss of every
aura. Trigger: antivirus, cloud sync, backup software, or a half-written file after a crash. **Low
probability, worst-case consequence.** Fix: tell missing from unreadable; on unreadable, refuse to
save over it, rename the damaged file aside and say so.

**h. Duplicating an aura copies its timers' identities.** `importCode` gives the copy a fresh
**widget** id but copies `customTimers` verbatim, and the engine keys running timers by the timer's
own id. **Verified by running it: two auras that should each show a timer, only one appears.** The
copy silently does nothing. Fix: regenerate nested timer ids on duplicate — one line.

**i. Auto-detect could not find EverQuest Legends.** `CANDIDATE_PATHS` held eight classic paths,
none of them `C:\Users\Public\Daybreak Game Company\Installed Games\EverQuest Legends` — which
`isValidEqFolder()` accepts and whose Logs folder holds the files. A fresh install watched nothing
until the user found the picker. **Fixed in commit `c4ff4b0`**, additive and separate.

**k. RETRACTED — the wrong-day filing never happened.** I reported that `logSplitter`'s stamp
pattern rejected the space-padded day EverQuest writes, so the first nine days of every month were
filed under the previous month. **EverQuest Legends zero-pads.** It uses
`strftime("%a %b %d %H:%M:%S %Y")`, not `ctime()`; the formats look alike and I reasoned from the
wrong one, then wrote it up as fact.

Measured afterwards over every EQ log on this machine, **deduplicated by content hash** (67 files
on disk, 34 distinct): **9,026,690 stamped lines, 1,381,716 of them on days 1–9, and the ORIGINAL
pattern misread none of them.** The client's own line, byte for byte:
`[Tue Aug 04 13:33:15 2026] Logging to 'eqlog.txt' is now *ON*.`

**The first correction was itself over-counted** — "28 logs, 9,621,621 lines" globbed a tree holding
worktree duplicates. Dedup by content hash before quoting a corpus figure here; twelve of those
twenty-eight files were copies.

I had written "no log on this machine covers a single-digit day". There were 1.96 million such lines
in `C:\Users\Lindsey\Desktop\EQL Source` throughout — I checked the live log's folder, found only
19–29 August, and reported the limit of my search as a fact about the world. **`HANDOFF.md` §14.4
has the full account of how the claim was reached; it is the more useful half.**

Commit `2bf1e1a` and its message are wrong about the mechanism and about the damage. The **change**
is kept: zero disagreements over a million real lines, it costs nothing, and it is now commented as
tolerance rather than a repair. `test/log-splitter.test.js` is kept too — the module having no suite
at all is the one real finding, and it now tests the client's real format first.

**Still open:** `lockoutCore.js:211`'s "classic EQ space-pads" is unsourced and I cited it as
corroboration. Session D should be told — not to change the tolerance, which is right, but because
the comment reads as a measurement and is being used as one.

**l. The splitter counts what it cannot read.** Not a defect, the response to one. An unstamped line
is filed under the day of the line before it, which is correct — EQ wraps server broadcasts onto
continuation lines — and measured at **ten lines in 1,761,090 (0.0006%)**. That rarity makes the
rate a sharp alarm: a pattern that stops matching fails on nearly every line at once. The splitter
now raises once when a batch of 200+ lines is over 5% unreadable, and `logService` says so, naming
the day those lines were filed under. Had this existed, the claim in (k) would have been settled in
minutes instead of surviving into two documents.

**j. Two duplicate element ids on master** — `widget-text-size-slider`, `widget-text-size-value`,
each twice in `index.html`. `getElementById` returns the first, so one is unreachable. Pre-existing,
untouched.

---

## 5. THE WEEKLY ROTATION — HOW IT DECIDES

Commit `725e3ea`. `src/main/logRotation.js`, wired in `main.js`, switch on the Setup page's
Archive log card.

**RETRACTED 30 August. It is an EXPIRY, not an established boundary, and the surface it was read
from is not identified.** What survives: an expiry instant at `2026-09-01T15:00:15Z ± 3 s` for
whatever the thirty-six rows in that window were. What does not: that it is a *reset*, that the
period is *weekly*, or that the boundary is *Tuesday*.

Sweeping the period against the same two readings, **4, 5, 6 and 7 days are all self-consistent to
the same six seconds** — only three days is excluded — and six days puts the anchor on a
**Wednesday**. Worse, `lockoutCore.js:795-804` records that window as **28 rows plus 8 rows** — the
signature of the *instance-lockout* surface, which that file's own heading calls object 2 of
**"THREE DIFFERENT OBJECTS. DO NOT MERGE THEM"** and describes as *"A SIX-DAY ROLLING TIMER … There
is no weekday and no boundary."* And "all rows the same" excludes nothing: `commonOrigin: true` in
that same file records 14 locks across 6,133 s rendering one value with zero spread.

`HANDOFF.md` §15 carries the corrected scoring. **The rotation ships OFF by default, which is now
doing more work than it was when I turned it off.** Local wall clock,
deliberately, so the 1 November change is a non-event. Correct for a player whose machine is on the
server's clock and wrong by the offset for anyone else; the module header says so.

**It rotates a log only when ALL of these hold.** Any one of them failing is reported, not hidden:

| condition | if not |
|---|---|
| the feature is on | `turned off` |
| a Logs folder is resolved | `no logs folder` |
| the watched log has been silent 10 s | `the log is being written to right now` |
| this file itself untouched for 10 s | `skippedBusy` — a boxed account writes where the tailer cannot see |
| no archive already exists for this week | `skippedAlreadyDone` |
| the log is not empty | `skippedEmpty` |
| its first line carries a readable stamp | `skippedUnreadable` |
| that first line predates the boundary | `skippedAlreadyCurrent` |
| its **last** line also predates the boundary | `skippedSpansBoundary` — see defect (l) |
| the copy exists and matches byte for byte | `failed`, archive removed, retried next minute |
| the log has not grown since the copy | `failed`, archive removed, retried next minute |

Then, and only then, `truncateSync(live, 0)`. **Truncate rather than delete** because EverQuest
holds the file open and Windows will not delete it — the same choice `logService.archiveNow()`
already made, reused rather than reinvented.

**The filesystem is the record of whether a week happened**, not a settings marker, because
`store.js` returns defaults on any read failure and a default of "never rotated" would rotate twice
mid-week. That is also why defect (m) mattered so much: if a failed attempt leaves a file, the
record lies.

**Checked once a minute**, not at startup — see defect (n).

### What this does NOT do

- **It does not remove the guessing the Lockouts page still does.** `lockoutCore`'s `RESET_RULE`
  has `hour: null`, so boundary-day cells still read *depends on the reset hour* even after a
  perfectly timed rotation. The Setup copy was rewritten to stop claiming otherwise.
- **Archived weeks are invisible to the grid.** `lockoutService` scans the Logs folder only, never
  `Archive/`. "Nothing is deleted" is true of the file and false of what the tool can see — the card
  now says this outright.
- **A player who raids across Tuesday 11:00 with the app closed never rotates**, by design: the log
  then holds both weeks and (l) refuses it. They sit at the app's existing behaviour, and the card
  tells them so rather than looking broken.

### Defects found by the ship-readiness audit, and fixed — 29 August

Six audits plus two judges, run against the finished feature. **Every one of these is mine.**

**m. The readability alarm could not fire during play.** The ratio needs 200 lines and I required
them within one batch — one poll, one second. Measured across 177,399 seconds of her real play:
median 6 lines a second, p99 60, **peak 182**. A live batch never reaches 200, so the alarm could
only ever fire on a startup backfill, and a format breaking mid-session was 100% unreadable and
silent. The window now accumulates across batches.

**n. It named the wrong day, and reached nobody.** `_checkReadability` read `lastDateKeySeen` two
statements before it is assigned, so it reported the previous batch's day or the word `null`. And
the alarm went only to a `console.warn` the owner cannot open, with `getStatus()` having no caller
anywhere in `src/`. **A counter nobody reads is not an improvement on not counting.** Now goes to
`debugLog` and rides the settings payload the Setup page already reads.

**o. The watcher anchor only worked when the watched log was rotated.** Sorting it last does
nothing for a SKIPPED file, which never gets a new mtime — and the ordinary multi-box case is
exactly that: hers straddles the reset and is refused, a mule's rotates and takes the newest mtime,
and the tailer follows it. Lines lost to buffs and the damage meter, not just lockouts. Then the fix
was wrong a second way, caught by running the test six times: `Date` is millisecond-precision and
the filesystem is finer, so stamping "now" landed *behind* a file truncated in the same
millisecond — **one run in three**. Now takes the newest rotated mtime and adds a millisecond.

**p. The host reintroduced the blank card.** The module records every exit; then the host grew two
guards that return before calling it. Same defect one level up. Both now call `noteHostSkip`.

**q. The manual Archive button did not tell the grid.** Pressed during a scan it lost **300,001 of
600,002 lines** while the service reported done with no errors. Degrades toward `not_looked` rather
than a false `open`, so the important property held — but silently. It now rebuilds the grid.

**r. Three sentences the app contradicted itself with.** The gap line said "N of them short enough
that the cells above still read open" under a summary saying **0 open** — the guaranteed state of
the page for the first days after this ships. The open tooltip claimed "the logs cover the whole
period" while the line below it said 68 of 113 hours were unobserved. And the Setup card asserted
the reset hour while the Lockouts page said it had never been measured. All three fixed and pinned
by tests.

**s. A NUL run longer than the search window stopped the feature for ever.** `firstStampMs` gave up
at 2 MB; a writer keeping its offset across a truncation pads with the whole previous week — 147 MB
here. Now steps over the run: 150 MB of padding, 580 ms, rotates.

**t. THE CUT WAS ELEVEN HOURS OUT FROM THE GRID THAT READS IT.** The worst defect found in this
work, and mine. The reset is Tuesday 11:00 and the rotation cut there — but `lockoutCore`'s period
starts at the boundary **DAY**, midnight (`boundaryDayStart`, `lockoutCore.js:1686`), deliberately,
because `RESET_RULE.hour` is `null`. So the rotation removed eleven hours the grid still counts, and
to the grid that is a **gap** rather than an archive. `PERIOD_GAP_TOLERANCE_MS` is 24 h, so an
11-hour gap is **tolerated** — and a tolerated gap leaves the cells reading `open`, not `not_looked`.

A boss killed at 08:00 on a Tuesday was archived away and the grid then reported the raid available,
with no hedge. **Confidently wrong, in the direction that sends her to re-clear a lockout she
holds** — the exact failure the feature exists to prevent.

*Verified against her real log, not a fixture:* simulating the rotation turned a 10.1 h tolerated gap
into an 11.0 h one, `coverageSpansPeriod` still true, and **no cell changed** — 10 completed / 14
open / 1 conditional either way. It bit nothing only because she has not raided between midnight and
11:00 in the recorded weeks. Latent, not firing, and reachable by any Monday raid past midnight.

**Fixed** by cutting at `rotationCutBefore()` — the boundary day's midnight — so the live log holds
exactly the core's period. The archive is still *named* for the reset; the report carries both
instants so they cannot be conflated again.

**u. The rotation is now OFF by default.** It is the one thing in the app that modifies her game
files on a timer, no rotation has ever run on a real machine, and (t) was found late. Her choice is
persisted; an old settings file with no key does not count as consent. One line restores the old
default once it has been watched working.

### Known limits, documented rather than fixed

- **A wrong clock that later corrects can mark a week done that was not.** An RTC running a week
  fast writes next week's archive name; the real week then reads `skippedAlreadyDone`. Nothing is
  lost from disk; the by-construction claim is false for that week.
- **Changing the machine's timezone between checks can rotate twice** and pre-create a future
  week's archive.
- **A `Logs/Archive` junction pointing elsewhere lets the archive be written outside the Logs
  folder.** Write-only, no data loss, needs a pre-existing junction.
- **~100 µs between the copy completing and the truncate** is closed by a re-stat but not by a
  lock. Measured exposure at real write rates: one to thirteen bytes, and only if the game writes in
  that window while writing nothing during the 1–72 ms copy.
- **WHICH FILE-HANDLE MODE EVERQUEST USES IS UNMEASURED, and cannot be settled from this machine.**
  An append handle survives an external truncation cleanly; a handle keeping its own offset pads the
  file with NULs. `Logs/Archive` **does not exist** here — the manual archive has never been run —
  so no truncation has ever happened to these logs, and **the absence of NUL bytes in the corpus is
  not evidence either way.** I briefly presented it as if it were. Defect (s) means either answer is
  now survivable.
- **Nothing prunes `Archive/`.** At her measured ~94 MB a week, eighteen weeks is ~1.7 GB, on top of
  `Split/` holding the same content again. No warning, and the Lockouts page cannot read any of it.
- **The rotation discards last week's context along with last week's lines.** A kill whose
  instance zone-in line was written before the reset, and whose kill lands after it, loses the tier
  the zone-in established — the grid then reads `open` for every tier rather than `completed` for
  the right one. Under-reports rather than over-reports, which is the safe direction, but it is a
  real consequence of the by-construction approach.
- **A pre-existing defect worth knowing, unchanged from master:** if `splitProgress.json` is lost,
  corrupt, truncated or zero-length, `store.js` returns defaults and the splitter re-splits from
  zero — measured at **every line exactly 2.00×**. Same on `764b16d`. It is defect (g) wearing a
  different hat.

---

## 6. WHAT IS LEFT

**Blocking nothing, but wanted before 1 September:**

1. **~~THE OWNER'S ALT+Z MEASUREMENT.~~ DONE.** She supplied it on 29 August: two readings, plus a
   third screenshot showing every row sharing one reset. That is where Tuesday 11:00 comes from.
   **It is now EDT by assumption and will need confirming once daylight saving ends** — her own
   instruction: if it proves an hour out, fix it then.
2. **Shara has not seen any of this.** The branch is unpushed and unreviewed by her. Her direction
   governs; nothing here is a condition.
3. **Report (d), (e), (f) to Session D** — (d) is the one that matters to them soonest.
4. Decide with her whether (g) and (h) get fixed, and by whom.
5. **~~Tell her about (k).~~ RETRACTED — there was no bug.** See (k). What is worth telling her is
   the opposite: her splitter was fine, it now has a test suite it never had, and it will say so if
   it ever stops being able to read the log.
6. **The first rotation will look alarming and be correct.** Whenever it does fire, the live log
   goes to zero and the Lockouts page reads `not_looked` across the board until she plays. That is
   the honest answer for a period nothing has been observed in, but it is worth her expecting it.

**Not started, and not required:** persistence of lockout state. Deliberately omitted — the scan is
~2.5 s over 1.5M lines, so rebuilding on demand is cheaper than a migration path. `serialize()`
would also carry 5,000 dead `events` objects.

---

## 7. FACTS THAT WOULD BE EXPENSIVE TO RE-DERIVE

- **There are FIVE cell states**, not four: `completed`, `open`, `conditional`, `unknown`,
  `not_looked`. The brief said four.
- **`state.events` is capped at 5,000 and read by NOTHING.** Only written and trimmed. Every
  projection runs off `tasks`, `kills`, `requests`, `grants`, `instances`.
- **`RESET_RULE.weekday: 2` is a hardcoded Tuesday** — but attributed: `provenance: 'stated'`,
  `source: 'owner, first-hand, 23 Aug 2026'`, `hour: null`. That is the one attributed field. The
  claim in `FOR-AURAS.md` that "no reset day is hardcoded anywhere" is too strong.
- **`new Date(x)` with an argument is calendar arithmetic, not a clock read.** The core has three
  such calls and zero argument-less ones. A naive grep for `new Date` on that file will alarm you.
- **The `'line'` event carries only the string** — not the file. Character attribution comes from
  `logService.watcher.getStatus().currentFilePath` at the moment the line arrives.
- **Her `logSplitter.js` writes per-day files by design**, so the folder scan is not defensive, it
  is required. She manufactures the split continuously.
- **Nine `'line'` listeners existed on master before mine** (one inside `LogService`'s own
  constructor, first in emit order), not the six I first counted.
- **Shara's corpus yields 3 weekly tasks, each assigned once**, so `projectReset` is honestly
  `not recorded`. Not a cap artefact — verified.
- **Her app had no `config.json`** in userData, so it depended entirely on auto-detect, which is why
  (i) mattered.

---

## 8. STANDING RULES, UNCHANGED

- **DO NOT BREAK HER APP.** It is published and installed. Where the lockout feature and her
  existing behaviour conflict, hers wins and the conflict gets reported.
- **Never drive the app with synthetic clicks.** EverQuest runs on this machine and a stray click
  has landed in the game window before. `smoke-render.js` touches no mouse — everything happens
  inside our own renderer.
- **`PERSONAL COPY DO NOT TOUCH.md`** is off limits, in `.gitignore`, never opened.
- **Push only to `samusmylove47-maker/EQLSAuras`.** `LoxyBee/EQLS-Auras` is read-only to us.
- **Findings and working code, never conditions.**
- **A green suite is not a rendered panel.** Run it.

- **`logSplitter` writes to `Logs/Split/` and archives to `Logs/Archive/`** — both subfolders, so
  the rotation's non-recursive scan sees only current-week live logs, and the archive filename
  `eqlog_X_week_YYYY-MM-DD.txt` *would* match the lockout scan's pattern if that scan ever became
  recursive. Only the subfolder saves it.
- **`logWatcher` starts at the END of the file** (`offset = statSync().size`) and emits nothing for
  existing content. This is what made defect (n) invisible to reasoning and obvious to running it.
- **`copyFileSync` of a 142 MB log measured 209 ms cold, 31 ms warm; `truncateSync` 9 ms.** The
  first rotation is not a startup stall on this hardware.
- **Node on Windows ignores the `TZ` environment variable**, so no test here can exercise a
  non-Eastern timezone. Where that matters, the tests assert on the *source* instead.
- **Her live log covers only 19–29 August** (1.5M lines, 143 MB) — and it spans the boundary, which
  is why the real app currently refuses to rotate it.
- **THE OTHER LOGS ARE IN `C:\Users\Lindsey\Desktop\EQL Source`.** 28 files, 9.6M stamped lines,
  4–19 August, including 1.96M lines on single-digit days. Not under the game folder and not under
  either repo, so a search scoped to those misses them entirely — which is exactly the mistake
  behind retracted defect (k). `find "C:/Users/Lindsey" -iname "eqlog*"` finds them.
- **EverQuest Legends stamps with `strftime("%a %b %d %H:%M:%S %Y")`** — zero-padded day, one space,
  `Aug 04`. It is NOT `ctime()`, which right-aligns to `Aug  4`. The resemblance has now cost real
  time twice; `lockoutCore.js:211` repeats the ctime assumption as an aside.
- **The client DOES pad other columns**, so "EQ never emits a double space" is wrong: `/who` output
  for an AFK player has two spaces after the closing bracket (37 lines on disk). Only the day is
  never space-padded.
- **`C:\Users\Lindsey\Desktop` holds several trees of the same logs**, including
  `.claude/worktrees/...` copies. 67 files, 34 distinct. **Deduplicate by content hash before
  quoting any corpus total** — not doing so is how the first correction to (k) was itself wrong.
- **Ten lines in 1,761,090 of her live log carry no stamp** (0.0006%) and every one is a
  continuation of a wrapped server broadcast. That is the baseline the splitter's readability alarm
  is set against.

*Session C, 28 August 2026. Rotation added 29 August.*
