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
| head | `725e3ea` |
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
node test/run.js                              -> all 64 suites, 1,022 cases   (hers: 62)
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

**k. The first nine days of every month are filed under the wrong day.** `logSplitter.js`'s stamp
pattern required exactly one space before the day. EQ's format is C's `ctime()`, which right-aligns
the day in two columns — `Sep  1`, not `Sep 01`. `extractDateKey` returned null for all of them,
`lastDateKey` kept its previous value, and **nine days in thirty were written into the previous
month's file.** Nothing lost, filed wrongly, silently. **Fixed in commit `2bf1e1a`**, separate.

*Not confirmed from the corpus* — no log on this machine covers a single-digit day (all 1.5M lines
are the 19th to the 29th). Two things argue for it: ctime's format, and `lockoutCore.js:211`
accepting both spellings deliberately with a comment saying classic EQ space-pads. Accepting both
costs a zero-padded log nothing, so the change is harmless if that is wrong and fixes two bugs if it
is right. **The second bug was in the rotation**, which reads that parser to decide whether a log
predates the reset: a log whose head fell in the first nine days read as unstamped, which that code
treats as do-not-touch — so it would never have rotated again. 1 September is one of those days.

**j. Two duplicate element ids on master** — `widget-text-size-slider`, `widget-text-size-value`,
each twice in `index.html`. `getElementById` returns the first, so one is unreachable. Pre-existing,
untouched.

---

## 5. THE WEEKLY ROTATION — HOW IT DECIDES

Commit `725e3ea`. `src/main/logRotation.js`, wired in `main.js`, switch on the Setup page's
Archive log card.

**The boundary is Tuesday 11:00 local, and it is a measurement.** Two Alt+Z readings 10.84 hours
apart landed six seconds from each other and both within eighteen seconds of 11:00:00 on Tuesday
1 September — and every row of that window showed the same remaining time, which is what
establishes that all the locks share one reset rather than each running its own. Local wall clock,
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
5. **Tell her about (k)**, the splitter's wrong-day filing. It affects her *shipped* app, it is on
   its own commit, and it cannot be confirmed from any log on this machine — a log from the first
   nine days of any month would settle it in one grep.
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
- **Her live log covers only 19–29 August** (1.5M lines, 143 MB) — so it cannot answer any question
  about single-digit days, and it spans the boundary, which is why the real app currently refuses to
  rotate it.

*Session C, 28 August 2026. Rotation added 29 August.*
