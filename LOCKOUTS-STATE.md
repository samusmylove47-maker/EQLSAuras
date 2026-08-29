# Lockout integration — state of the work

**Written 27–28 August 2026 by Session C, immediately before a context compaction.**
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
| head | `f0f185c` |
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

### The three commits, and why they are separate

1. `9fd8723` — the integration.
2. `c4ff4b0` — **auto-detect finds EverQuest Legends.** Independent of the lockout work on purpose.
3. `f0f185c` — the two bugs the adversarial audit found.

---

## 3. HOW TO VERIFY IT, AND WHAT THE ANSWERS SHOULD BE

```
node test/run.js            -> all 63 suites, 972 cases         (hers: 62; mine adds 1 suite / 20 cases)
node tools/smoke-render.js  -> renderer ERRORS 0, and a PROBE line
node tools/replay-log.js    -> 124 / 210,185 / 838 / 23 / 91
```

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

**j. Two duplicate element ids on master** — `widget-text-size-slider`, `widget-text-size-value`,
each twice in `index.html`. `getElementById` returns the first, so one is unreachable. Pre-existing,
untouched.

---

## 5. WHAT IS LEFT

**Blocking nothing, but wanted before 1 September:**

1. **THE OWNER'S ALT+Z MEASUREMENT.** Still the top item, still ten seconds, and the only thing
   requiring a person. Open Alt+Z, note the wall-clock minute and the remaining time on any one boss
   row. Twice. Reset instant = when you looked + time remaining. The client does **not** print the
   table to the log — verified independently across 1.5M lines, zero hits. 1 September is itself a
   reset day, so boundary-day cells will be visible on release day without it.
2. **Shara has not seen any of this.** The branch is unpushed and unreviewed by her. Her direction
   governs; nothing here is a condition.
3. **Report (d), (e), (f) to Session D** — (d) is the one that matters to them soonest.
4. Decide with her whether (g) and (h) get fixed, and by whom.

**Not started, and not required:** persistence of lockout state. Deliberately omitted — the scan is
~2.5 s over 1.5M lines, so rebuilding on demand is cheaper than a migration path. `serialize()`
would also carry 5,000 dead `events` objects.

---

## 6. FACTS THAT WOULD BE EXPENSIVE TO RE-DERIVE

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

## 7. STANDING RULES, UNCHANGED

- **DO NOT BREAK HER APP.** It is published and installed. Where the lockout feature and her
  existing behaviour conflict, hers wins and the conflict gets reported.
- **Never drive the app with synthetic clicks.** EverQuest runs on this machine and a stray click
  has landed in the game window before. `smoke-render.js` touches no mouse — everything happens
  inside our own renderer.
- **`PERSONAL COPY DO NOT TOUCH.md`** is off limits, in `.gitignore`, never opened.
- **Push only to `samusmylove47-maker/EQLSAuras`.** `LoxyBee/EQLS-Auras` is read-only to us.
- **Findings and working code, never conditions.**
- **A green suite is not a rendered panel.** Run it.

*Session C, 28 August 2026.*
