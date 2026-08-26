# The engine contract

**What a log-reading module must satisfy to drop into EQLS Auras.**

Seven clauses. Every one exists because something broke, and every one names the breakage.

---

> **Keep it a contract, not a style guide. Every clause exists because something broke, and each
> names the breakage. The moment one is added because it seems tidy, it stops being evidence and
> the next author will be right to ignore it.**

That is the rule this document is governed by, not a slogan about it. If you are about to add a
clause, you owe it a breakage — a real one, with the shape of the failure written down. If you
cannot name one, the thing you want is a convention, and conventions belong somewhere else.

---

## Why this document exists

The owner's direction is that when =Auras reaches 1.0, every tool built alongside it folds into
it. These clauses were written for one module against one host and they are now the standard for
all of them. They lived inside one session's handoff, which is where a standard goes to be
forgotten.

Nothing here is a request to the owner of =Auras. It binds the modules we write, not her
application. If a clause makes a module worse for her, the clause is wrong.

## Scope

Applies to any module that reads EverQuest log lines and is intended to be integrated: lockouts,
damage, buffs, timers, anything later. The shape assumed throughout is the one both existing
engines already have — lines and an explicit `now` in, JSON-clonable state out, no Electron, no
DOM, no filesystem in the core, CommonJS.

## The numbering is frozen

Clauses 1–6 keep their numbers permanently. `EQLSLockouts/src/lockoutCore.js` carries this contract
at the top of the file with **one test per clause**, keyed to these numbers; renumbering would
silently invalidate every one of those references. New clauses append. A retired clause is struck
through and keeps its number.

---

## Clause 1 — Take the raw line, prefix and all

**Rule.** `handleLine(line)` accepts exactly what the watcher emits:
`[Wed Aug 19 19:17:52 2026] <text>`. Strip the timestamp inside the module if you do not want it.
Never require the host to strip it first.

**The breakage.** Both of the host's existing engines — `BuffEngine.handleLine` and
`CustomTimerEngine.handleLine` — take the raw line and call `stripTimestamp` internally. A module
wanting pre-stripped lines forces a transform between the watcher and every caller, and the replay
harness has to grow one too.

The sharper failure is what happens when two code paths disagree about whether a line still carries
its prefix. Building note 9's all-of conditions I passed the *timestamped* line to a matcher that
compared against the *stripped* one. Every exact-match condition would have silently never fired —
no error, no warning, nothing in the log, just a feature that does not work. It was caught before
it shipped, but only by looking. This clause removes the ambiguity rather than relying on care.

For a lockout module the timestamp is not noise at all: it **is** the measurement.

**How to test.** Feed a verbatim line with its prefix and assert the module handles it. Assert the
module exposes no entry point that requires a pre-stripped line. If the host's other engines answer
the same line, assert the answers agree.

---

## Clause 2 — Never read the clock; `now` is the only time source

**Rule.** No `Date.now()`, no `new Date()`, no `setInterval`, no `setTimeout` inside the module.
Time enters through the signature. **If you need the passage of time, expose `tick(now)` and let
the host own the interval.**

**The breakage.** The replay harness pushes 1,521,971 real lines through the real engine in seconds.
It is the only reason anything about detection can be proved rather than asserted, and its baseline
— 129 distinct buffs, 211,546 landings, 840 ally landings, 27 prompts, 91 unknown texts — must be
reproducible exactly. A module that reads the wall clock produces different answers replayed than
live, and the harness stops being evidence.

**Why the amendment.** As first written — "never read the clock, and never hold a timer" — this
reads as a ban on anything time-based, which is not what it means and is what the next author will
hit. The damage meter genuinely needs time to pass: a fight that ends in silence produces no log
line to notice it with. It satisfies this clause by exposing `tick(now)` while `main.js` owns the
one-second `setInterval`. The engine stays clockless; the host holds the clock. Where a module can
go further and keep `now` out of accumulated state entirely — as `lockoutCore` does — that is
stronger and better, because then replay and live are byte-identical by construction rather than by
discipline.

**How to test.** Grep the core for `Date.now`, `new Date`, `setInterval`, `setTimeout` — expect
zero. Replay a fixture twice at different wall-clock times and assert identical state. Drive
`tick(now)` from the test, never from inside the module.

---

## Clause 3 — One-second resolution, and no ordering within a second

**Rule.** Every timestamp in these logs is a whole second. Two events sharing a second arrive in an
order the log does not guarantee. Nothing may depend on "A before B" within one second.

**The breakage, found independently on both sides.** A mez break and its wear-off line share a
timestamp in the buff engine's data. The Voidling's closing line arrives *before* the task line it
answers in the lockout corpus. Neither was predicted; both were hit within days of the clause being
written down.

The shape that survives it: record on arrival, classify later with the whole window visible.
`applyLine` should not decide anything that a second line in the same second could change.

**How to test.** Take a group of events sharing one timestamp, run **every** permutation of their
order, and require the same output from all of them. `lockoutCore` does exactly this with all six
orderings of a same-second exchange.

---

## Clause 4 — Exported state is JSON and only JSON

**Rule.** Anything crossing `serialize()`, a renderer boundary, or IPC must survive
`JSON.parse(JSON.stringify(x))` unchanged: plain objects, arrays, strings, finite numbers, booleans,
null. **Private fields are yours** — use whatever you like inside.

**The breakage.** A `Map`, `Set` or `Date` in exported state passes every unit test in the process
that created it and then silently empties on the first reload, because `JSON.stringify` renders a
Map as `{}`. There is no error. The state simply comes back hollow, and the failure surfaces as
lost data long after the change that caused it.

**Why the amendment.** Read as a blanket ban on `Map` and `Set` this costs real work for nothing.
`damageEngine` uses both throughout its internals and emits plain objects, which is correct and must
stay legal. The rule binds the boundary, not the implementation.

**How to test.** A structural walk over **exported** state rejecting `Map`, `Set`, `Date`,
functions, `undefined` and non-finite numbers. Then `assert.deepEqual(x, JSON.parse(JSON.stringify(x)))`.
Do not walk private fields.

---

## Clause 5 — Hand back a plain config object; own no file

**Rule.** The core references no `fs`, no `path`, no `process.env`, and persists nothing. Defaults,
backfill and migration belong to the host.

**The breakage.** `widgetStore.normalizeWidget` owns defaults and backfill in the host, and that
single ownership is the only reason four new config fields added this session needed no migration
at all — they simply appeared with their defaults on every existing aura. A module that persists its
own config splits that ownership and re-creates the updater problem the host has just finished not
having.

**How to test.** Grep the core for `require(`, `fs`, `process.env` — `lockoutCore.js` has zero
`require`s, not even builtins, which is the standard to aim at. Construct the module from a plain
object and assert it writes nothing.

---

## Clause 6 — State is per-character, and re-feeding a line is safe

**Rule.** State is keyed by character and refuses to be shared. Feeding the same line twice must be
safe — and if it is not, say so in the module's own documentation. **Undecided is what hurts.**

**The breakage, per-character.** Run over the corpus with one shared state, Avenrae's and Shara's
grants — four seconds apart, because they were grouped — read as *one task granted twice*, and the
module reported a **four-second reset bracket**. This was originally an open question I attached to
this clause, asking whether lockout state was per-character or global. It was settled by a bug
rather than by anyone's preference, which is the better kind of answer. `createState(character)` now
requires the name; `restore()` rejects a snapshot whose character does not match.

The host's watcher follows whichever `eqlog_*.txt` changed most recently, which is right for buffs
and wrong here — a folder scan picks up every character on the machine.

**The breakage, idempotence.** Voidling replies were exempt from dedupe, and the exemption was
documented as deliberate and harmless. It was not: replaying a stream doubled the array. Against a
watcher that can re-read a tail, and a one-time backfill that overlaps the live stream, that would
have drifted silently and been very hard to attribute later.

**How to test.** Assert `createState(character)` requires the name and that `restore()` rejects a
mismatched snapshot. Feed the same stream twice and assert identical state — not merely
"no crash".

---

## Clause 7 — Bounded state, with the bound stated

**Rule.** State the order of growth of your state, and cap anything that grows with the **length of
the log** rather than with the **number of real entities**.

**The breakage.** The one-time backfill measurement: **434 MB, 5,253,948 lines across 15 files, in
7.0 seconds**. That is a single call, on the main process, immediately after streaming a 112 MB
file. Any per-entity state with no eviction is at its maximum precisely when the user presses the
button. `damageEngine` caps its pending buffer at 400 entries for exactly this reason and says so
in the file.

**It found a defect within days of being written.** `lockoutCore`'s Voidling replies are a set of
seconds — the right shape for clause 6, and unbounded over months of history. That is now being
bounded.

**The tension with clause 6, which is where the next bug will be.** Clause 6 demands idempotence.
The cheapest way to be idempotent is to remember every input you have seen. That is precisely what
clause 7 forbids, and the Voidling set is that collision already made concrete. The resolution is to
**dedupe on something keyed by entity — a per-entity last-seen marker — rather than on the stream**.
A set of every timestamp encountered is unbounded even when the thing it guards has thirty-six rows.

**How to test.** Declare the order of growth for each field in state. Then run the corpus, run it
again ten times over, and assert state size is a function of entity count and not of line count. A
module whose state is bounded by construction passes this trivially, and should still carry the
test, because "bounded by construction" is a claim and this is what checks it.

---

## Appendix: what is not in here

Two things were considered and left out because they have no breakage behind them yet, which is the
document's own test.

**Per-line cost is shared.** The host's `logService.watcher` now carries six independent `'line'`
listeners — buff engine, custom timers, damage engine, zone detection, share-code detection, travel
command. Every consumer sees every line, so a module doing heavy work per line taxes all of them.
True, worth knowing, cheap to fix later, and nothing has broken because of it. Not a clause.

**Encoding.** The logs are CRLF and UTF-8, both measured — exactly 9 bytes ≥ 0x80 across 434 MB, all
of them `EF BF BD`. This belongs in the host's tailer rather than in a module contract. Recorded
because a standing internal ruling that these logs were Windows-1252 was wrong, and because the
earlier LF finding was wrong for an instructive reason: the hexdump that established it was piped
through `grep`, which strips the file's terminator and appends its own. It measured the instrument
rather than the file.

---

*Authored by Session C from six clauses written against the =Auras tree, amended and extended
25 August 2026 on the Director's adoption. Clause 7 is new; clauses 2 and 4 are amended; clause 6's
open question is closed.*
