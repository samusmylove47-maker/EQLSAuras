===== agent af9908ed3168b8551 =====
All 29 runs complete, tree verified byte-identical to the shared copy, suite back to 59 passed.

## Result: 23 of 25 primary mutations RED. **One dead guard, and it is the one not on your list.**

**Setup.** Copied to `C:\Users\Lindsey\AppData\Local\Temp\claude\C--Users-Lindsey-EQLS-Auras\2cc2d853-d38b-45a3-8d0f-3b2d5ce2406e\scratchpad\mutwork\integrate`, junctioned `node_modules`. Every mutation applied to a fresh copy of pristine, suite run as `node test/log-rotation.test.js` in a subprocess, restored by file-copy, SHA-256 verified after each. Final check: all four scanned source files hash-identical to the untouched shared tree. **The junction still exists — do not recursively delete that directory without `rmdir` on `mutwork\integrate\node_modules` first.**

Your brief named nine tests. There are **ten** source-scanning tests in the file. The tenth — `the renderer names the week from the local date, never from the UTC string` (line 419) — is the dead one.

### THE FINDING

`test/log-rotation.test.js:419` — both of its source assertions survive the exact defect the test is named for.

```
MUTATION B4:  src/renderer/main-window/main-window.js:4339
  -        `week of ${last.boundaryDate}.`;
  +        `week of ${new Date(last.at).toISOString().slice(0, 10)}.`;
VERDICT: GREEN.  59 passed, 0 failed.
```

That is the wrong-day bug, in the renderer, written out in full: it names the week by slicing a UTC ISO string, so at UTC+12 the card reads Monday for a Tuesday reset. I evaluated the two asserts by hand against the mutant:

```
body.includes('boundaryDate')            : true
!/last\.boundary\b(?!Date)/.test(body)   : true

every line of the sliced body containing 'boundaryDate':
  // `boundaryDate` is the LOCAL calendar day of the reset. `boundary` beside it is a UTC string,
```

**The only surviving occurrence of `boundaryDate` in the scanned body is the comment above the code it was written to protect.** The assert `body.includes('boundaryDate')` is anchored by its own documentation, so it can never fail. The sibling assert is a negative on the literal string `last.boundary`, which any other spelling of the same bug walks past.

Reduced separately, mutation B2 isolates it: `${last.boundaryDate}` → `week that just closed.` — the renderer reads `boundaryDate` nowhere at all — **GREEN**.

Only one spelling is caught. B3 (`${last.boundaryDate}` → `${last.boundary.slice(0, 10)}`) went RED. The guard detects one string, not the property.

### The other nine: all live

| Mutation | Assertion | Verdict |
|---|---|---|
| A1 `function boundaryKey(` → `const boundaryKey = (boundary) =>` | anchor | RED |
| A2 local getters → `getUTCFullYear/getUTCMonth/getUTCDate` | `!/getUTC/` | RED |
| A3 body → `boundary.toISOString().slice(0, 10)` | `/getFullYear\|getMonth\|getDate/` | RED |
| B1 rename `renderLogRotationStatus` to arrow form | anchor | RED |
| C1 `let lastLogLineAt = Date.now()` → `= 0` | startup quiet check | RED |
| C2 insert `runLogRotation('startup');` | `!/runLogRotation\('startup'\)/` | RED |
| C3 `60 * 1000` → `5 * 60 * 1000` | cadence | RED |
| D1 `function runLogRotation(why) {` → arrow | anchor (fails 3 tests) | RED |
| D2 delete the 4-line backfill guard | `/backfillState === 'running'/` | RED |
| D3 move backfill guard below `rotateIfDue()` | ordering | RED |
| E1 delete `logRotationService.setCurrentFileFn(...)` | wiring | RED |
| F2 delete the 4-line `bytesBehind()` guard | `/bytesBehind\(\)/` | RED |
| F3 move `bytesBehind()` guard below `rotateIfDue()` | ordering | RED |
| G1 rename both handlers off the `logRotation:` prefix | `handled.length > 0` | RED |
| G2 add `logRotation:runNow` handler, no preload bridge | preload reachability | RED |
| H1 delete backfill guard's `noteHostSkip` line | 260-char window | RED |
| H2 delete splitter guard's `noteHostSkip` line | 260-char window | RED |
| I1 `'log:archiveNow'` → `'log:archiveNowManual'` | anchor | RED |
| I2 delete `lockoutService.states.clear();` from handler | grid rebuild | RED |
| I3 delete `lockoutService.backfillState = 'idle';` from handler | scan re-arm | RED |
| J1 append `function auraDir(app) { return app.getPath('exe'); }` | `!/getPath\(/` | RED |
| J2 append `path.join(app.userDataPath, 'auras')` | `!/userData/` | RED |

The ordering asserts (D3, F3) are real, not decorative — moving a guard four lines down trips them.

### Three fragilities, same shape as the finding

Green, but these are text-proximity heuristics rather than defects today:

- **P3 (GREEN), the closest to a real one.** Delete the backfill guard's `noteHostSkip` **and** the six comment lines separating the two guards. The splitter guard's `noteHostSkip` then falls inside the backfill guard's 260-char window and answers for it. H1 alone is RED only because a comment block currently holds the two guards apart. A comment trim re-arms the bug.
- **P1 (GREEN).** `app.paths['user' + 'Data']` in `logRotation.js` reaches userData past both asserts in `rotation writes nothing outside the logs folder`. Also note that assert strips only whole-line `//` comments, so a trailing comment mentioning `userData` would false-**fire** it.
- **P4 (GREEN), a coverage gap rather than a dead assert.** `setIsQuietFn(() => Date.now() - lastLogLineAt > 10000)` → `> 0` makes every log read quiet the instant a line lands. Nothing in the file asserts on the quiet window's size, only on `lastLogLineAt`'s initialiser — under the test named *the host does not rotate before it has had a chance to hear the log*.

### Suggested repair for the finding

Slice the body past the comment, or assert on code rather than prose. The cheapest correct form is to require the property read positively and forbid the class of bug rather than one spelling:

```js
assert.ok(/last\.boundaryDate\b/.test(body), 'the renderer does not read boundaryDate');
assert.ok(!/toISOString|last\.boundary\b(?!Date)/.test(body), 'the renderer derives the day from a UTC string');
```

Under that pair, B4, B2 and B3 all go RED. Artifacts left in place at `C:\Users\Lindsey\AppData\Local\Temp\claude\C--Users-Lindsey-EQLS-Auras\2cc2d853-d38b-45a3-8d0f-3b2d5ce2406e\scratchpad\mutwork\` (`mutate.js`, `mutations.js`, `explain.js`, `results.json`).
===== agent aaba6dcb7e3362bf6 =====
**FILE: `test/log-splitter.test.js` — 30 mutation runs, 17 baseline tests. 4 findings (3 dead guards, 1 latent).**

Worked in my own copy at `C:\Users\Lindsey\AppData\Local\Temp\claude\C--Users-Lindsey-EQLS-Auras\2cc2d853-d38b-45a3-8d0f-3b2d5ce2406e\scratchpad\splitmut\integrate` (robocopy `/XJ`, own `node_modules` junction). The shared tree at `...\scratchpad\integrate` was never written to — hashes re-verified unchanged at the end. All four touched files restored byte-identical after every mutation; final baseline back to 17/17 green.

---

## FINDINGS — mutations that stayed GREEN

**F1. `bytesBehind()`'s `!this.filePath` guard is untested.** `src/main/logSplitter.js:180`
```
- if (!this.enabled || !this.filePath) return 0;
+ if (!this.enabled) return 0;
```
→ **GREEN, 17 passed.** The assertion that names this exact case, `assert.equal(s.bytesBehind(), 0, 'an unattached splitter claimed a backlog')` (line 269), cannot detect the loss of the guard it is written for: with the guard gone, `fs.statSync(null)` throws and `catch { return 0; }` hands back the same 0. Two independent paths to the same value, one of them silent.
Matched pair confirming it is masked rather than inert — same guard removal **plus** `catch { return 42; }` → **RED**, `an unattached splitter claimed a backlog / 42 !== 0`.
And `catch { return 42; }` with the guard **intact** → **GREEN**: nothing in the suite exercises the catch arm at all.

**F2. The renderer source-scan is satisfied by a comment.** `test/log-splitter.test.js:219`
```js
assert.ok(/formatAlarm/.test(renderer), 'nothing in the renderer reads the alarm');
```
`main-window.js` contains exactly one occurrence, at line 665. Replacing the real read with a stub plus a comment that merely mentions the word:
```
- const alarm = state.split.formatAlarm;
+ // TODO: we used to read state.split.formatAlarm here. Removed for now.
+ const alarm = null;
```
→ **GREEN, 17 passed.** The alarm display is fully severed and the guard says nothing. (Renaming the identifier outright → RED, so the scan is live for a rename but blind to deletion-with-comment — the common way this actually regresses.)

**F3. The alarm's "once" is untested; the sticky guard is load-bearing and unguarded.** `src/main/logSplitter.js:276`
```
- if (this.formatAlarm) return;
  this.windowStamped += stamped;
```
→ **GREEN, 17 passed.** Yet a subprocess probe shows the guard changes behaviour:

| | after 1st unreadable batch | after 2nd |
|---|---|---|
| pristine | 1 alarm | 1 alarm |
| guard removed | 1 alarm | **2 alarms** |

`assert.equal(alarms.length, 1, 'the alarm did not fire exactly once')` (line 313) only tests *at least once*. Neither alarm test can see a second firing: `'a log it can no longer read raises an alarm, once'` runs a single `_processOnce`, and `'a format that breaks during play…'` does `if (alarms.length) break;` the instant the first one lands. The word "once" in the test name, the comment, and the failure message is not backed by anything.

**F4. LATENT — the `debugLog` scan searches a 900-char window that is 55% unrelated code.** `test/log-splitter.test.js:224-225`
```js
const handler = main.slice(start, start + 900);
assert.ok(/debugLog\(/.test(handler), 'the alarm never reaches the log file the owner can find');
```
Measured: handler body is 409 chars, so **491 of the 900 chars are unrelated code** that happens to contain no `debugLog(` today. Gutting the handler alone (`debugLog(` → `console.warn(`) → **RED**, so it works right now. But gutting the handler *and* adding one unrelated `debugLog('…')` just below the handler's closing `});` → **GREEN, 17 passed.** The guard passes by accident of layout; any nearby logging call added to `main.js` silently kills it.

**F5. STRUCTURAL — three tests pass against a completely inert splitter.** Making `_processOnce` return immediately (`if (this.filePath !== ' never') return;`) → 10 RED, and these survive:
- `a normal log with a wrapped broadcast in it raises nothing`
- `a tiny batch is not enough to accuse the parser`
- `a quiet window resets rather than accumulating forever`

All three are negative-only (`alarms` empty, `formatAlarm` null, `unstampedRatio < 0.01` — which 0/0 satisfies). They are **not dead** — M9 reddens the 1st and 3rd, M8 the 2nd — but none carries a positive control proving its fixture was read. The model to copy is already in the same file: `'a splitter that is turned off never holds up the rotation'` has `assert.ok(s.bytesBehind() > 0, 'the fixture did not create a backlog')` and is the only rotation test that survives inertness for an honest reason. One line each would close it (e.g. `assert.equal(s.getStatus().stampedLines, 500)`).

---

## THE READABILITY ALARM — fix confirmed by matched pair

Reverting the accumulate-across-batches fix, i.e. requiring the 200-line minimum *within one batch*, `src/main/logSplitter.js:282`:
```
  const total = this.windowStamped + this.windowUnstamped;
- if (total < UNSTAMPED_ALARM_MIN_LINES) return;
+ if (stamped + unstamped < UNSTAMPED_ALARM_MIN_LINES) return;
```
→ **RED, exactly one test, 16 others green:**
```
FAIL a format that breaks during play is noticed, not only one broken at startup
     A MID-SESSION FORMAT BREAK WENT UNANNOUNCED
     0 !== 1
```
Sixty one-second batches of six lines never reach 200 individually, the alarm never fires, and the right test — and only that test — catches it. The fix is real and the guard on it is real.

`UNSTAMPED_ALARM_MIN_LINES` 200→1 → RED on `it judged the ratio on too few lines` **and** `two lines were treated as a format change`. `UNSTAMPED_ALARM_RATIO` 0.05→0.005 → RED on `it cried wolf on an ordinary log` and `a normal log with a few broadcasts tripped the alarm`. Both thresholds are pinned from both sides.

## Vacuity audit (b) and (c)

- No `.every()`, `.some()`, `skip()`, `try/catch`, early `return`, or conditionally-guarded assertion anywhere in a test body. The only three `return`s are in the `store()`/`tempLog()`/`split()` helper factories.
- Every loop is fixed-count except `for (second < 60)`, whose `break` is compensated by the assertion after it (proved: M7 exits the loop at 60 and fails `0 !== 1`).
- Empty fixtures are caught, not tolerated: under an inert splitter the `deepEqual` assertions fail with `+ []` rather than passing.
- `settle()`'s own guard has teeth — removing `this.processing = false;` from the `rl.on('close')` handler → **RED on all 14 async tests** with `the splitter never finished a batch`. No test proceeds silently on an unfinished batch.

## Assertions individually reddened (live)

Lines 74, 75, 84, 86, 89, 90/91, 104, 109, 118, 127, 146, 148, 181, 182, 183, 195/198, 201, 213, 219, 223, 225, 248, 249, 269 (only with F1's second path also broken), 273, 278, 292, 294, 313, 314, 315, 316, 330, 331, 332, 343, 351, 352, 353.

Line 111 (`!includes('Nagafen')`) and 110 (`includes('Yael')`) I could not isolate — every mutation reaching them trips 104 or 109 first. Not dead, just shadowed.

Probe scripts kept at `...\scratchpad\splitmut\probe-once.js` and `probe-slice.js`. My copy is left in place undeleted; its `node_modules` is a junction to `C:\Users\Lindsey\EQ tracker\node_modules` and must be removed with `rmdir` before any recursive delete.
===== agent af3737aa3f1676d59 =====
All restored, suite green, working copy left in place (junction intact, nothing deleted).

## Result: no dead guards in `test/lockouts.test.js`. 33/33 source-scanning assertions go RED. Two scope holes found in one regex.

**Working copy:** `C:\Users\Lindsey\AppData\Local\Temp\claude\C--Users-Lindsey-EQLS-Auras\2cc2d853-d38b-45a3-8d0f-3b2d5ce2406e\scratchpad\workD` (node_modules junctioned; **do not recursive-delete without `rmdir` on the junction first**). Baseline and final: `lockouts: 26 passed`, exit 0. All six touched files verified byte-identical to the untouched `integrate` tree after every mutation.

### Control-character scan — CLEAN
Scanned all 67 files in `test/` for 0x07/0x08/0x0b/0x0c/0x1b (plus every other C0 byte except TAB/LF/CR, plus 0x7f): **0 stray control bytes**. Same scan over `src/main` and `src/renderer/main-window`: **0**. My first attempt at this used `od -c | grep` and was garbage — `od -c` prints ordinary `a`/`f`/`v` letters, so it "found" hits in all 67 files. The real scanner is `scratchpad\ctlscan.js`. Worth knowing, since a bad scan here is the same class of error as the bug being hunted.

### The nine named tests — every assertion mutated, every one RED

| Test | Assertions | Representative mutation | Verdict |
|---|---|---|---|
| the vendored core stays pure | 4 | `const _vendorPath = require('path');` / `new Date()` / `Date.now()` / bare `require('fs');` into `lockoutCore.js` | 4/4 RED |
| the rotation never claims a stronger provenance | 2 | `const RESET_WEEKDAY` → `const RESET_DAY_OF_WEEK`; comment → `Measured across the owner's corpus` | 2/2 RED |
| every state the core can emit is mapped | 2 | `cellState = 'conditional'` → `'contested'`; refactor both `cellState` sites to `STATES.*` constants | 2/2 RED |
| not_looked and open are rendered as different things | 5 | `not_looked:` → `notLooked:`; `text: 'not looked'` → `text: 'open'`; drop `NOT the same as open`; rename `.lockout-not_looked`; make both CSS bodies `rgba(90,150,235,0.18)` | 5/5 RED |
| there is no countdown anywhere in the lockout UI | 5 | one banned token per run: `setInterval(...)`, `requestAnimationFrame(...)`, `hoursRemaining`, `countdownEl`, `timeLeft` | 5/5 RED |
| tolerated coverage gaps are shown | 3 | `coverageGaps` → `gapList`; add `coverageHoles` source *while leaving `coverageGaps` present*; delete `Anything that happened in a gap is not in the grid.` | 3/3 RED |
| the reset rule reaches the UI with its provenance and its null hour | 4 | drop `grid.resetRule.provenance`; `'never measured'` → `'11:00'`; `period.provenance` → `period.atLeastDays`; drop `a floor and not a value` | 4/4 RED |
| the tolerated-gap clause is not shown when there are no open cells | 2 | `const tolerated` → `const toleratedCount`; drop the `grid.openCount > 0 ?` guard | 2/2 RED |
| the open cell does not claim the logs cover the whole period | 3 | `open: {` → `open:{`; tooltip → `the logs cover the whole period`; drop `see the note under the grid` | 3/3 RED |
| the reset hour names where it came from | 3 | `Tuesday at 11:00` → `Tuesday at 11am`; drop `taken from your own reading of the in-game`; drop `never measured` | 3/3 RED |

The single most important one: setting `not_looked: { text: 'open', ... }` — the exact failure this file exists to prevent — fails the suite. That guard is real.

### The two ratchet tests also bite now
Injecting the historical pair into `RESET_RULE` (`hour: 11`, `provenance: 'measured'`) produced **2 failures** — `RESET RULE: the only permitted constant` and `the rotation never claims a stronger provenance`. The file header records that this same injection produced **ZERO** failures here before D's two tests were carried over. The carry-over landed. Isolated: `hour: 11` alone → RED (`the owner gave a day, not an hour - do not invent one`); `weekday: 3` → RED; `source` → `'community wiki'` → RED; `measuredBracketContainsRule: false` → RED. All four `NO RESET CONSTANT` assertions → RED (weekday added to `projectReset`; `resetWeekday` added to the per-boss view; `weekday` added to `grid.period`; `value` set to an instant).

### FINDINGS — two scope holes, same assertion

Both are in `test/lockouts.test.js:102-106`, the assertion that *was* the dead guard found today. It is now live for the canonical form, but its window is narrower than its name reads.

**1. A "Measured" claim on the declaration line itself is invisible.** The test does `lines.slice(Math.max(0, at - 3), at)` — which excludes line `at`, the declaration. Mutation applied to `src/main/logRotation.js`:

```js
const RESET_WEEKDAY = 2; // Measured across the owner's corpus; provenance: measured.
```
→ **GREEN, 26 passed.** The most natural place to write a provenance claim about a constant is a trailing comment on that constant, and that is precisely the one place not scanned.

**2. A lowercase "measured" claim is invisible.** The regex `/(^|[^a-zA-Z])Measured([^a-zA-Z]|$)/` is case-sensitive. Mutation to the scanned comment block:

```js
// 0 = Sunday, so 2 = Tuesday. measured across the owner's corpus, provenance: measured - see
// the header for the scoring; lockoutCore.js:821 is more conservative than the evidence requires.
```
→ **GREEN, 26 passed.**

The case-sensitivity is not simply a bug — the honest comment contains the words "not measured", so a case-insensitive `/measured/` would fire on the correct file. But that means the guard is keyed to *capitalisation* rather than to the claim, and the fix is to widen the slice to include the declaration line and match a claim shape (e.g. `/provenance:\s*'measured'/i` plus `/(?<!not )measured/i`) rather than a capital letter.

Neither hole is a dead guard — the assertion does fail on the exact regression it was written for (the 29 August `logRotation` vs `lockoutCore` disagreement). They are narrowness, the project's named signature failure: a check whose scope is smaller than the claim it appears to defend.

### Method note
One mutation I ran was invalid and I re-ran it. Reformatting `open: {\n text: 'open',` to `open: { text: 'open',` came back GREEN — but the anchor string `open: {` was still present, so nothing was actually removed. Corrected to `open:{`, which removes the anchor, and it went RED. A GREEN from a mutation that did not mutate is the same trap as a green from a check that cannot fire.