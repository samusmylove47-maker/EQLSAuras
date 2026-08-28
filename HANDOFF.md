# HANDOFF — EQLS Auras (Session C)

The exchange below holds only what is still live. Applied rulings move into the standing sections
underneath and are deleted from the exchange.

Session A and Session B can read this file directly:
`curl -s https://raw.githubusercontent.com/samusmylove47-maker/EQLSAuras/main/HANDOFF.md`

---

## From the Director

*Status request of 21 August answered below. Standing correction on the NO-GO's scope applied —
it governs our page, not her ship date. Nothing outstanding.*

---

## To the Director

### 0. The finding is accepted, and it is the right one

The file sat at 18 August through three days of work and still said "standing by for the archive,
the plan and her prompt". A, B and you were reading that as current. That is on me, and the
correction is the one you gave: **the file gets written when the state changes, not when you ask.**

The cause is worth naming so the fix is real rather than a promise. I was treating HANDOFF.md as
something to write at the end of a piece of work, and the work did not end — it ran continuously
from the archive arriving on the 20th to tonight. There was no natural finish, so there was no
write. From here I write on the same trigger as a commit that changes an answer any other session
would act on: the two release blockers closing, the fonts item moving, the installer figure moving.
Not on completion.

**Resolved, same day.** Shara and Avenrae have granted push access to this repo and asked that
the information-share stay current, so this file is now pushed and the
`raw.githubusercontent.com` route above serves it. A and B can read it directly again.

The grant is to **this** repo. `LoxyBee/EQLS-Auras` remains read-only to me; her application
source is still hers to land, and nothing here changes that.

---

### 1. What landed with Shara

Since the 20th: **51 commits** on `feat/eql-roster-and-backlog`, **21 test suites, 283 cases**,
green. All local — see the push note above and item 6.

**Hers. Decisions, corrections and design calls that are not mine to claim:**

- **The loadout-swap correction, which is the important one.** I told her she was factually wrong
  about EQ Legends loadout swaps printing nothing, on the strength of 1,816 `You forget X.` lines.
  She was right and I was wrong: those are *manual* unmemorises. A full loadout swap prints
  nothing at all. I had measured a signal and inferred its cause. The gem list is therefore
  knowingly unreliable, which is exactly why it sits low in the disambiguation order. She has the
  game; I have the file.
- **The volume slider stays 0–100.** She declined the re-range to 0–200 outright (`27c5adf`).
- **Instants belong on sound and text auras, never on duration tiles.** Her rule, quoted in the
  code where it is enforced.
- **Some zero-duration spells genuinely never end** — Yaulp and Fury as her worked examples. She
  asked for infinite-duration tiles and for it to be easy to add more; it is a named field in
  `tools/roster-overrides.json`.
- **The spellbook file is a sanity layer, not a nicety** — her call that it should be added because
  there must be as many ways to disambiguate as possible.
- **The instant dwell time is a user setting**, defaulting to 6s because someone will forget to
  change it. Her wording.
- **Text auras are a *type*, chosen at creation — not a fourth display radio.** Her reasoning,
  adopted; the dwell rules she had sketched were dropped as unnecessary.
- **Note 31's split**: unlocking *one* aura by hand forces it on screen, "Unlock all" does not.
  Hers, and it is the clause that makes the feature usable rather than a screen full of auras.
- **Promised Renewal reuses in 18s and Yaulp in 18s** — both verified in game against mined data
  that says 21.5s for the first and is simply wrong.
- **The mez lines were already provided.** She told me I had no reason to treat notes 11/16/17 as
  blocked. She was right; see item 2 and the correction landed at `a366fe3`.

**Mine. Engineering, and where I got it wrong:**

- Roster rebuilt from her EQL spreadsheet: 11,337 generic entries → **1,052 real ones**, every one
  categorised, the old roster archived rather than deleted.
- A replay harness (`tools/replay-log.js`) that measures detection against 1.5M real log lines
  before and after any change. **It had a defect I found tonight**: `rivervale4` is a byte-identical
  prefix of `rivervale5`, so 79,352 lines were replayed twice. Regression comparisons were
  unaffected — both sides double-counted — but every absolute count the tool has ever printed was
  about 5% high. Fixed.
- An earlier version of that harness counted landing *attempts* rather than landings, and reported
  "no regressions" when the true answer was **157 regressions across 67 spells**. That is the second
  time an instrument of mine flattered a change; both are now guarded.
- Detection reorder (spellbook above gems), instants and infinite durations separated, merged
  tiles, visibility precedence, sound-only auras, coloured category edges, enemy debuffs, the
  RESIST flash, three premades.
- A full status page for all 39 of her notes, `NOTES-STATUS.md`, checked against source and tests
  rather than against what the notes claim about themselves.

**Declined by her:** the 0–200 volume re-range. Nothing else.

**~~Still open~~ — closed the same day, and she was right to reject both my options.** I had put
two to her: an ally's debuff without a countdown, or not at all. She chose a third — make it a
**warning** rather than a tracker. "A text alert to be careful, and not a standalone timer that may
be inaccurate."

That is a better answer than mine and it is worth saying why, because the same move is available
elsewhere. I was trying to decide how much of a broken thing to ship. She changed what the thing
is. A warning has no duration to be wrong about, so the missing end-line stops being a defect and
becomes irrelevant. Built and committed at `13a3304`; 52 commits, **22 suites, 306 cases** green.

Two decisions inside it are mine, are argued in the code, and are hers to overrule:

- It fires on the **cast** line, not the landing. Costs a false warning on a resist, about one in
  ten. Buys roughly two seconds of notice — 96% of landings in her logs arrive exactly two seconds
  after the cast — and for a warning meaning "do not break this mez", arriving before it lands is
  the whole point.
- It **names the caster** instead of saying "a party member". Measured: half the third-person mez
  and charm casts in her logs are mobs, so that phrasing would have been wrong about half the time
  it fired. Filtering to the group roster would be worse than either — membership is only learned
  from join and leave lines seen live, so the feature would go silently dead whenever the app
  starts mid-session. Depending on that was already a bug in this engine once.

---

### 1b. Since that report: three more notes closed, and the state of play

Written on the changed-answer trigger, not on completion. **56 commits, 24 suites, 346 cases**
green, working tree clean, nothing pushed to `LoxyBee/EQLS-Auras`.

- **Note 16 closed** — see the item above.
- **Note 17 closed** — the RESIST flash, at the 1.4s she asked for.
- **Note 15 closed** — the cooldown premade. Its blocker ("recast times do not exist anywhere in
  this project") was stale; the roster rebuild brought them in on 989 of 1,052 entries. Its Risk
  section was not stale and shaped the whole thing.
- **Note 21 mostly closed** — the loadout label. Everything except the auto-create, which I left
  out deliberately and put to her as a question.

**One measurement in there is worth passing to A, because it retires a correction we published.**
The installer figure aside, this file previously recorded that Promised Renewal's mined recast of
21.5s was simply "wrong" against her in-game 18s. It was not wrong - it was recast plus cast time.
Her 18s recast has a 3s cast, and the gap between her consecutive casts across 1.5M log lines
peaks at exactly 21s. The mined data was right and I had mis-read what it measured. Nothing on the
site depends on it, but "the game data is wrong here" was my claim and it should not stand.

---

### 1c. 22 August: notes 21, 26 and 27 move, and a detection bug worth A's attention

**61 commits, 26 suites, 382 cases** green, tree clean.

- **Note 21** rebuilt as a global setting rather than an aura, on her correction.
- **Note 27** first half done — "Buffs shown" is a top-level card now. The gem-slot half is held
  pending her explicit go-ahead, because it changes how auras store their picked spells.
- **Note 26 mostly closed**, and the research is worth passing on.

**The stacking research settles something the site may one day want to state.** There are no buff
"types" in EverQuest. "HP type 1" is player shorthand for the Courage/Center/Daring/Bravery line.
The engine models twelve numbered effect slots per spell, and two spells conflict only when they
put the same effect id in the same numbered SLOT; the calculated values in that one slot then
decide, ties going to the newcomer. Sources are emulator source code — EQMacEmu's
`FindAffectSlot` (a decompile of the classic client) and EQEmu's `CheckStackConflict` — and the
two differ: classic decides on the first conflicting slot, modern requires the newcomer to be
better on all of them. **If anything on eqlsource.com ever describes buff stacking, it should not
repeat the "types" framing, and it should say which era it is describing.**

Also confirmed against her logs, resolving something the external research listed as unverified:
**EQ Legends does emit the modern "(Blocked by X.)" suffix** — 184 instances. That form was added
to live EverQuest in July 2015 and classic-era servers do not have it, so EQL added it
deliberately. That is a small, checkable, era-dating fact about the server.

**One finding is a plain defect and I would rather A heard it than not.** Nine of the twelve
"this cast failed" patterns in her app matched nothing whatsoever across 1,521,971 real log lines.
They had been written from memory of EverQuest's wording rather than counted: the game says "Your
`<Spell>` spell fizzles!", not "Your spell fizzles"; "did not take hold", not "would not take
hold". 570 failed casts per corpus were running on until they timed out. Fixed, and every pattern
now carries the count it was measured at. **The general lesson is ours as much as hers: a pattern
nobody has counted is a pattern nobody knows is working**, and that applies to the site's
generator gates too.

---

### 1d. 22 August, later: a shipped bug that only launching the app could find

Notes 21, 26 and 27 are closed, note 38 is scoped. But the finding worth A's and B's attention is
methodological.

Shara asked me to check the app actually launches rather than trusting the test suite. It did -
and it was throwing on startup while doing it. `globalShortcut.register('Pause')` **throws** in
Electron: 'Pause' is not a valid accelerator. Not "returns false" - which matters, because the
graceful "another application owns this key" branch sat directly beside it and never ran. The
hide-auras hotkey had never once worked, and the top bar said "or press Pause" the whole time.

**27 green suites and 396 passing cases did not notice, and structurally could not: not one of
them starts Electron.** The test that covered it asserted `register('Pause')` and its own comment
stated the false belief that made it wrong. Nine seconds of running the real binary found it.

There is now `tools/smoke-launch.js` in her tree - start the app, hold it, report what it printed.
**The same gap exists on our side.** `gate.py` checks the built HTML; nothing checks that a page
renders in a browser without throwing. I am not proposing we build that today, only naming it: a
test suite that never runs the artefact cannot see the class of failure that only the artefact
has.

---

### 1e. 23 August: note 38 lands, and a testing habit worth copying

**68 commits, 28 suites, 418 cases** green. App launches clean, `npm run dist` builds.

Zone-gated auras shipped. Of interest to A rather than the feature itself: **one person in
1,521,971 log lines typed "You have entered Everfrost." into General chat while telling a story.**
An unanchored match on that line silently relocates the app to a zone the player has never been
in. Anchoring the pattern on the log timestamp drops it — 225 matches instead of 226. The general
shape is worth carrying: *user-authored text can imitate system output*, and any pattern that
reads one must be anchored on something the user cannot type.

**And a habit I am now confident is a real defect generator, not a style quibble.** Four suites in
her tree were written against a REPRODUCED COPY of a rule that lived somewhere the test could not
import from. Mutation testing showed every one of them passing while the real rule was inverted —
a flipped default, a reversed comparison. The fix is not better copies: it is moving the rule into
a module with no framework dependency so the test calls the actual function. Done for the zone
rule; the other three are pinned with source-level assertions as a weaker substitute.

If any of `gate.py`'s checks re-implement a rule that also exists in the generator, they will have
the same failure mode.

---

### 1f. 23 August, later: notes 10 and 38 land; 25 of 39 notes done

**71 commits, 29 suites, 435 cases** green. App launches clean; `npm run dist` builds.

Backlog now 25 DONE, 11 PART, 1 NOT STARTED, 2 BLOCKED. Both blocked items need something only
Shara can supply, and both are named in her `NOTES-STATUS.md`.

**One pattern worth carrying to the site, because it has now produced three separate defects in
her tree.** A capability existed, was correct, was tested — and was unreachable, because one
layer in the chain did not pass it through:

- `contains` trigger matching worked in the engine and could only be reached by a premade; the
  form never sent a mode, so every hand-built timer was silently exact.
- `cooldownSec` was in the form, the store and the engine and did nothing, because the two IPC
  handlers destructure named fields and neither listed it.
- `castOf` was whitelisted out by the store's own validator, so any timer routed the normal way
  was silently downgraded to a mode that would never fire.

None of these is a logic error and none would fail a unit test of the component that owns them.
They are all the same shape: **a value crossing four layers where one layer enumerates fields.**
The check that finds them is an end-to-end assertion naming every layer, which is now standard in
this tree. `build1.py` has the same shape wherever a page value crosses generator → template →
gate.

---

### 1g. 23 August, evening: 27 of 39 notes done, and a report I nearly dismissed

**76 commits, 30 suites, 451 cases** green. App launches clean, installer builds.

**The finding worth carrying.** Shara reported that the app's detection log "doesn't exist", and it
did — it had been written continuously for days. The tempting response was to tell her where it
was. The correct one was that she was right: it sat as a loose file in `%APPDATA%/EQ Buff Tracker`
among `Cache`, `Code Cache`, `DawnGraphiteCache`, `GPUCache`, `Local Storage` and `Network`. Note
28 stayed blocked for days on evidence that existed the whole time, because no one could
reasonably find it.

**A file nobody can reach is a file that does not exist**, and "but it is there" would have closed
the report while leaving the problem. It now has its own folder, one file per day, and a button
that opens it. The same test applies to anything we publish that a reader is expected to go and
find.

Also closed: notes 12 and 18 (counting mobs that share a name), note 10 (timers that roll into a
cooldown). Note 2 is SKIPPED at her instruction — she has solved first-aggro elsewhere and will
bring it herself.

---

### 2. The two release blockers — both closed

**(a) The Quick-Buff burst dropping buffs with no in-session recovery. CLOSED.**

`src/main/buffEngine.js:828`. A landing during a burst the player triggered is now **queued for the
user** rather than dropped or guessed — `_queueAmbiguousCast(stripped, candidates, true)`. A
remembered answer applies straight away without asking. Answering the prompt calls
`resolveAmbiguousCast`, which ends in `this._land(known)` (`:1361`), so the buff appears
immediately: **that is the in-session recovery the finding said did not exist.** The answer is
remembered against the profile that was active when it was queued, not whichever is active when it
is answered.

One caveat I would rather state than have found. `_land` starts the duration from the moment of
resolution, so a buff answered twenty seconds late shows twenty seconds too much. Recovery exists;
the timer is optimistic by the answer delay. That does not reopen the blocker, and it is worth a
note on her list rather than a fix tonight.

**(b) Profile-scoped aura visibility, called backwards, mutating persisted data with no updater.
CLOSED, and the second half turned out not to be true.**

Note 31 shipped 20 August (`cf5e5ef`), built as one change with note 4 exactly as the coupling
warning said it had to be, and **with her own suggested split adopted**. So the semantics are
agreed, by the person who called them backwards.

The persisted-data half does not apply: **`forceShown` is an in-memory `Set`** declared at
`widgetManager.js:47` and written nowhere — no store, no file, no key. `masterHidden` is a
module-level boolean. The fix mutates **no persisted data at all**, so there is nothing for an
updater to update. The pre-existing `activeProfileIds` is backfilled on read by `normalizeWidget`
(`widgetStore.js:74`), which is this tree's established pattern. 15-case suite.

---

### 3. The Google Fonts fetch — not self-hosted. A's sentence is still correct

**Do not change the landing page.** As of tonight the app still fetches Poppins from Google at
launch: `src/renderer/main-window/index.html:13–15`, a `preconnect` pair and the stylesheet link.
No font files anywhere in the tree.

Two details that sharpen the disclosure rather than soften it. The fetch is in the **main window
only** — the overlay windows and the ambiguous-cast popup do not fetch, and never did. And the
main window opens at launch, so "each time it launches" is exactly right. The CSS falls back to
`'Segoe UI', system-ui, sans-serif`, so a blocked fetch degrades quietly rather than breaking.

The item remains hers and remains free: self-hosting Poppins renders identically, and the change is
three lines removed, two `woff2` files added and one `@font-face`. **The moment she does it I will
write here the same day**, and you can tell A.

---

### 4. The NO-GO — the original basis is gone, and I am still not asking you to lift it

The correction is noted and I had it wrong in the earlier phrasing: **the ruling governs our page,
not her ship date.** The date is hers. What follows for us is that we print no date and do not
describe it as released.

Both findings that produced the NO-GO are closed on my own evidence (item 2). So the ruling as
argued in August no longer has its evidence behind it.

I am not asking for it to be lifted, because a plainer reason has replaced it: **there is nothing
released to point at.** No tag, no GitHub release, no publish target, and the canonical remote does
not even have the last 92 commits (51 when this was written; the remote has not moved since). On
the only question our page actually asks — is this released —
the answer is still no, and it is now checkable rather than argued. See item 6.

---

### 5. The residue list — one closed, two live, and one of ours is stale

**`EQBT2-` share-code prefix — CLOSED, and closed before codes circulated.** The prefix is now
`EQLSAURAS1-` (`widgetStore.js:395`). `EQBT2-` is retained in `LEGACY_SHARE_CODE_PREFIXES` so the
import UI can eventually say "this code is from an older version" rather than "invalid code". Old
codes referenced spells from the retired 11,337-entry roster and could not have been honoured
anyway, so they fail cleanly at the door instead of importing an aura whose buffs silently never
fire. **Breaking them was agreed with her, not assumed.** This was the expensive one and it is done.

**`appId` — still `com.eqlsource.eqlsauras`.** `proposed/B-naming-residue.patch` moves it to
`com.eqlsource.auras` and **still applies cleanly** against her current tree; I re-checked tonight
with `git apply --check`. Hers to take. Note for whoever takes it: it is safe with respect to
stored state, because userData is pinned by hand and does not derive from `appId`.

**The sidebar heading — a house-style item, not a defect, and I should have said so the first
time.** There is exactly one `<h1>EQLS Auras</h1>`, at `index.html:61`. The window is
`frame: false`, so the OS title never renders and nothing is doubled on screen. What is actually
true is narrower: the full name appears in the taskbar entry and again in the sidebar, where the
naming standing says a second mention should be short-form. Patch B shortens it to `Auras`. Worth
doing, worth describing accurately.

**One of ours is stale.** `proposed/A-userdata-regression-test.patch` **no longer applies** — it is
superseded. The seven-case pin test is already in her tree as `test/pin.test.js` and passes. It got
there by another route. I am leaving the file in `proposed/` until you have read this, then
removing it, because a queued patch that cannot apply is worse than no patch.

**And a standing figure of ours has gone wrong — this is the same class as the fonts item.**

The installer was rebuilt on **21 August at 01:00 UTC**. Read off the artefact just now:

    dist/EQLS Auras Setup 0.1.0.exe   78,440,299 bytes   =  74.81 MiB

The standing figure in this file was **78,504,631 bytes, published as 74.9 MB**. It is now short by
64,332 bytes and it **rounds to 74.8, not 74.9**. If A's page prints 74.9 MB today, that figure is
wrong. The standing section below is corrected. This is precisely why the rule is "read at build
time, never typed" — mine was read, and it still went stale the moment she rebuilt.

---

### 6. Release state, and a definition of "released" you can check

Verified tonight, read-only:

- `gh release list --repo LoxyBee/EQLS-Auras` → **no releases**. Your reading is correct.
- **No git tags**, local or otherwise.
- `package.json` has **no `build.publish` block**. Nothing is wired to publish anywhere.
- ~~The remote last received a push at **2026-08-19 02:41 UTC**. My 51 commits are local and
  unpushed~~ — **superseded 25 August: the figure is now 92 and the remote has not moved at all.**
  See item 9.2. Corrected in place because the Director reported reading 51 as current.
- Distribution today is a hand-built NSIS installer handed over as a file. That is the whole
  mechanism.

**Where distribution will happen is hers to decide and is not answerable from the tree.** I will
not guess it into a standing section. What I can give you is the checkable definition you asked
for, so "released" stops being a feeling:

> **=Auras is released when `LoxyBee/EQLS-Auras` publishes a GitHub release whose tag matches the
> `version` in `package.json`, with an installer attached as a release asset.**

That is one command — `gh release list --repo LoxyBee/EQLS-Auras` — returns nothing today and
returns a row the moment it is true. It needs no one's opinion, it cannot be true early, and it
gives A a trigger to move =Auras to the top of the page rather than a judgement call. If she
chooses to distribute somewhere else entirely, the definition changes and I will say so here the
day it changes.

---

### 7. The competitor — relayed, and three of his findings hold against her data

Noted and complied with: **read-only, no fork, no issue, no PR.** I have not fetched his tree and
nothing of his has entered hers or ours. The line shapes are Daybreak's client output; his code and
fixtures are his, and his Redistribution clause would encumber her MIT app.

**everquest-companion, by Josh Moyers** — `github.com/jmoyers/everquest-companion`, FSL-1.1-MIT,
read 21 August 2026. The three findings below were measured from his tree by the Director, not by
me; I am attributing them to that reading rather than presenting them as mine.

What I *can* do without going near his code is test his findings against Shara's own logs. All
three survive, and one of them is striking:

| His finding | Checked against her tree |
| --- | --- |
| Only **878 of 1,926** spells carry a parseable duration — **45.6%** | Her roster: **487 of 1,052 — 46.3%**. Different source entirely (her EQL spreadsheet, not his scrape), landing within 0.7 points. |
| Scraped durations are the level-band **maximum** — over-stating for low-level casters, under-stating where extended-duration focus items are unmodelled | Corroborated independently and painfully. I corrected Mesmerize from the sheet's 24s to a measured **30s** tonight, and her mined recast for Promised Renewal (21.5s) is simply wrong against her in-game 18s. |
| `tells you` is a player, `told you` is the game | **Confirmed exactly.** 171 vs 887 in her logs. `Avenrae tells you, '...'` against `Banker Tintal told you, 'Welcome to my bank!'` — a naive `told you` match fires on every banker and merchant in the zone. |
| Feign death prints no failure line in 1.14M lines | Consistent: 9 mentions in her 1.52M lines and **zero** `You have fallen to the ground`. Weaker corroboration than the others, since her classes barely feign. |

**The 46.3% against his 45.6% is the one to hand her first.** Two people, two sources, two parsers,
same ceiling. It means roughly half of EverQuest's spell durations are simply not in the data
anyone can scrape, and no amount of parser work moves it. That is weeks she does not have to spend
finding out, and it is the strongest argument for the learned-durations idea his tree already has.

**On positioning, and I will put this to her as a finding, not a warning.** His app is mature —
1,444 commits, code-signed, self-updating, ~350 sound packs. Hers is not competing on breadth and
should not try. What she has that the table above is evidence *for* is a refusal to publish a
number she has not measured: she caught a wrong recast against the game, corrected a duration
against 90 measured expiries, and broke her own share codes rather than let them import silently
wrong. That is a real position and it is hers already. She should choose it deliberately, which is
your framing and it is the right one.

---

### 8. The lockout component — what would make it awkward, before it is written

The shape Session D has chosen is right and I would not change it: lines and an explicit `now` in,
JSON-clonable state out, no Electron, no DOM, no `fs` in the core, CommonJS. That is cheap for her
to accept and free for her to refuse, and it is the shape my own replay harness needs. Six things
that would cost real work to retrofit:

1. **Take the raw line, prefix and all.** Her watcher emits
   `[Wed Aug 19 19:17:52 2026] <text>` and both existing engines take it raw and strip internally.
   A module wanting pre-stripped lines puts a transform between the watcher and every caller, and
   the replay harness would have to grow one too. If you must have it stripped, say so now.
2. **Never read the clock, and never hold a timer.** No `Date.now()`, no `setInterval`. `now` in
   the signature covers it — but it must be the *only* source, or replaying 1.5M lines at speed
   produces different answers than live, and that harness is the only reason I can prove anything
   about detection.
3. **One-second resolution, and no sub-second ordering.** Every timestamp in her logs is whole
   seconds. Two events in the same second arrive in an order the log does not guarantee — I was
   bitten by exactly this tonight, where a mez break and its wear-off line share a timestamp. Any
   logic that needs "A before B" within a second is unimplementable against this data.
4. **State must survive `JSON.parse(JSON.stringify(x))` unchanged.** "JSON-clonable" already says
   it; I am making it explicit because a `Map`, a `Set` or a `Date` in the exported state passes
   every unit test and then silently empties on the first reload. Plain objects, arrays, strings,
   numbers, booleans, null.
5. **Hand back a plain config object; do not own a file.** `widgetStore.normalizeWidget` owns
   defaults and backfill in her tree, and it is the single reason the four new fields needed no
   migration. A module that persists its own config splits that ownership and creates the updater
   problem we have just finished not having.
6. **Say plainly whether feeding the same line twice is safe.** Her log watcher can re-read a tail.
   Idempotent is better; not-idempotent is fine if it is documented. Undecided is what hurts.

One question back, because it changes the interface rather than the implementation: **is lockout
state per-character or global?** Her log files are per-character and the app already scopes
remembered answers per loadout profile. If it is per-character, the character name has to be an
input, and that is much cheaper to decide now than to thread through later.

---

### 9. Director's request of 25 August — five answers

Everything below was re-checked against the live trees today, not recalled. Where I re-checked
something I had previously asserted, I say whether it held.

---

#### 9.1 What I handed over — and what she did with it, which I do not know

**I cannot answer the second half of this question, and I am not going to construct it.**

You asked what landed, what she declined, and what is still open on her side. I have no visibility
into any of that. My last action was building the handover archive on the evening of 23 August.
Since then, in the tree I can see: **no commits after mine, no working-tree changes, and no file in
the tree modified on the 24th or 25th.** The only trace of anything at all is that the archive is
no longer on the Desktop, which tells me it was moved or sent and tells me nothing about whether it
was opened.

So the clean separation you asked for is this.

**Ours, definitively — what was handed over.** 92 commits on `feat/eql-roster-and-backlog`, based
on `da698b4`. 36 suites, 570 cases green; the app launches and stays up; the installer builds; the
1.5M-line replay identical to baseline on all five figures. Of her 39 notes: **37 done, 0 partial,
1 blocked, 1 skipped.** The archive is 2.45 MB, 154 files, full history, excluding `node_modules`,
`dist` and her private file — all three verified absent by extracting the archive and searching it
rather than by trusting the build.

**Hers, definitively — the two open notes, both open by her own decision.** Note 28 (Ally Buffs
showed a buff she never cast) is blocked on the bug recurring; the detection log now records which
of her actions opened the burst and how long ago, which was the missing fact that made a report of
it indistinguishable from correct operation. Note 2 (first-aggro) she told me to skip because she
has solved it elsewhere and will bring it herself.

**Hers, definitively — three things I asked her to check because I could not.** The debuff and
charm mote-tier rates, where the spreadsheet says +10%/tier and marks it *assumed*, and every
observation in her logs was cut short by the mob dying; 38 of 104 zone display names that are
inferred because she has never entered those zones; and whether `Permafrost Keep` and `The
Permafrost Caverns - Group` are one place or two.

**What I would need to answer your actual question:** either her word, or sight of whatever tree
she is now working in. This working copy is not it. If liaison is now structural rather than
temporary, this is the gap that makes it fail — **I am reporting on the throw, not the catch.**
Worth closing before the next handover, and cheaply: one line back from her saying what she took.

---

#### 9.2 Release state — still nothing, and the number was worse than stale

Re-checked today, read-only, against `LoxyBee/EQLS-Auras`:

| check | result |
|---|---|
| tags on the remote | **none at all** |
| `package.json` version | `0.1.0` |
| `build.publish` block | `null` — nothing wired to publish anywhere |
| local tags | 0 |

**Against my own definition — a release whose tag matches `package.json`, with an installer
attached — there is still nothing.** The definition holds and is still one command to check.

**The commit figure is 92, not 51 — and the more important half is that the remote has not moved at
all.** Its branches are `master` at `f890327`, `feat/sound-alerts-…` at `1fe8fb4`, and
`feat/detection-fixes-…` at **`da698b4`, which is exactly the commit my branch is based on.** My
branch exists on the remote under no name, and remote `master` does not contain my HEAD.

So the risk is not that a number drifted from 51 to 92 while the remote crept forward. It is that
**the remote is precisely where it was when this work began, and all 92 commits live in one working
copy and one 2.45 MB archive.** That is the single largest exposure on this project and it has not
improved; it has grown by 41 commits.

I have corrected the 51 in item 6 in place, struck through rather than deleted, so nobody reads it
as current again. I have no push access to that remote and am not asking for it — recording the
exposure is the whole of my job here.

---

#### 9.3 The Google Fonts fetch — still live, verified today. A's sentence stands

`src/renderer/main-window/index.html:13–15` — the `preconnect` pair and the Poppins stylesheet
link, unchanged. No `.woff2`, `.ttf` or `.otf` anywhere in `src/`.

I also re-checked the two details I used to sharpen the disclosure, because I asserted them once and
should not keep repeating them from memory. Both hold. Counting external references per renderer:
**main window 3, overlay 0, ambiguous-cast popup 0** — so "the main window only" is still exact, and
the main window opens at launch, so "each time it launches" is still exact. The CSS still falls back
to `'Segoe UI', system-ui, sans-serif`, so a blocked fetch degrades quietly rather than breaking.

**Do not change the landing page.** The standing commitment is unchanged: the day this moves I write
here the same day, and you tell A.

---

#### 9.4 FOR-AURAS.md — read in full and carried

Read at `Desktop/EQLSLockouts/docs/FOR-AURAS.md`, all 190 lines. Carrying it as instructed. The
three findings are as you describe and I relay them intact. The framing I will put to her is the
document's own, which is the right one — *"Nothing here is a request."*

1. **Scan the folder, not the newest file.** The two halves of the only reset measurement sit in
   different files: three grants on 10 August in one, three on 11 August in another. Scan only the
   current file and you find three grants of three *different* tasks, no repeat, and the module
   correctly reports `not recorded` having been shown exactly half the evidence. **This one matters
   doubly for her, and D could not have known why:** her own `logSplitter.js` writes per-day files
   by design. She is not merely exposed to a log that might roll over — she manufactures the split
   herself, continuously.
2. **One engine per character.** Shared state read Avenrae's and Shara's grants, four seconds apart
   because they were grouped, as one task granted twice, and produced a four-second reset bracket.
   `createState(character)` now refuses to be shared. **This is the answer to the question I left
   open at the end of clause 6** — I asked whether lockout state was per-character or global. It is
   per-character, and it was settled by a bug rather than by a preference, which is the better kind
   of answer.
3. **434 MB / 5,253,948 lines in 7.0 seconds, but stream it.** Her planned one-time backfill button
   is a few seconds, not a progress-bar-and-cancel affair — but one file is 112 MB, and
   `readFileSync` on the main process would spike memory and block. `readline` over
   `createReadStream`.

**Two things in that document you did not mention, one of which I verified against her code and
which she should have regardless of whether the module is ever adopted.**

D reports that `logWatcher._pollActiveFile` opens a fresh `createReadStream` at a **byte** offset
with `encoding: 'utf8'` every 200 ms, so a multi-byte character straddling a poll boundary decodes
to U+FFFD. **I checked it and it is correct.** The stream is bounded `start: this.offset, end:
stat.size - 1` with `encoding: 'utf8'`, and `this.lineBuffer` holds a partial *line* — an
already-decoded string — so it cannot repair a split *character*. Not biting today: the corpus is
effectively ASCII, and D measured exactly 9 bytes ≥ 0x80 in 434 MB, all of them `EF BF BD`. A
latent defect with a small fix, and hers to take or leave.

D also corrected a standing internal ruling of their own in that document — that these logs are
Windows-1252 — having measured them as UTF-8; and explains that an earlier LF finding was wrong
because the hexdump was piped through `grep`, which strips the file's terminator and appends its
own. **They measured the instrument rather than the file, caught it, and wrote down which way they
had been wrong.** Her `split(/\r\n|\n/)` already handles CRLF correctly, so nothing on her side
changes. I relay the correction as well as the finding, because the reasoning is the part worth
having.

---

#### 9.5 A seventh constraint, and three amendments now the six govern more than one module

The six were written for one module against one host. Governing every tool changes two of them,
closes one, and adds one.

**Seventh — bounded state, with the bound stated.** This is new information out of your own item 4,
and the one I would most want written down now. The six predate the backfill measurement. A
one-time scan pushes **5.25 million lines** through a module in a single call, on the main process,
immediately after a 112 MB stream. Any state that grows per distinct entity with no eviction is at
its maximum precisely when the user presses the button. My own `damageEngine` caps its pending
buffer at 400 entries for exactly this reason and says so in the file; a dedupe set of seconds
accumulated across months of history is unbounded in principle. **A module should state what its
state is O( ), and cap anything that grows with the length of the log rather than with the number
of real entities.** Cheap to design in, potentially a redesign to retrofit, and the trigger is
imminent rather than hypothetical.

**Amendment to clause 2 — say what to do when you *do* need time to pass.** As written, "never read
the clock, never hold a timer" reads as forbidding anything time-based, which is not what I meant
and is what the next author will hit. The pattern that satisfies it, which I used this session:
expose `tick(now)` and let the host own the `setInterval`. My damage meter needs the passage of time
to clear a fight that ended in silence; `main.js` owns the one-second interval and the engine stays
clockless. D's module is stronger still — `now` never touches accumulated state at all — and that is
the better position wherever it is achievable.

**Amendment to clause 4 — separate internal representation from exported state.** "State must
survive `JSON.parse(JSON.stringify(x))`" reads as banning `Map` and `Set` outright, which would be a
real and pointless cost. `damageEngine` uses both throughout and emits plain objects. The rule
should bind **anything crossing `serialize()`, a renderer boundary or IPC** — not a module's private
fields. D's structural walk over *state* is exactly the right scope; the wording should match what
they actually built.

**Clause 6's open question is closed** — per-character, established by D's four-second false
bracket. It should move out of the exchange and into the standing contract as a settled clause.

**A smaller one, offered rather than pressed: per-line cost is shared.** Her `logService.watcher`
now carries six independent `'line'` listeners — buff engine, custom timers, damage engine, zone
detection, share-code detection, travel command. Every consumer sees every line, so a module doing
heavy work per line taxes all of them. Cheap to fix later, which is why I am not making it a clause.

**The four that need no change:** raw line including the prefix; one-second resolution with no
sub-second ordering; hand back a plain config object and own no file; document idempotency. Clause 3
in particular has now bitten both of us independently — a mez break sharing a stamp with its wear-off
for me, the Voidling's closing line arriving before the task line for D — which is about as much
confirmation as a constraint can earn.

**On the contract becoming house standard.** I would keep it a contract and not let it become a
style guide. Every clause in it exists because something broke, and each names the breakage. The
moment a clause is added because it seems tidy, the document stops being evidence and starts being
opinion, and the next author will be right to ignore it.

*Session C, 25 August.*

---

### 10. Tasks of 25 August — the spec, the briefing, and clause 7's character

Neither task was coding, so neither ran as a workflow — your own conditional, and I took it
literally rather than spending a fleet on prose.

---

#### 10.1 Task 1 — the contract is now `ENGINE-CONTRACT.md` at the repo root

Standalone spec, root rather than `proposed/`, because it binds **our** modules and is not something
offered to her. Your principle is the first thing after the title, verbatim, and the document is
governed by it rather than merely quoting it: the appendix names two things I considered and left
out **because they have no breakage behind them** — per-line cost on the shared watcher, and the
encoding findings. Both are true and useful. Neither is a clause.

Every clause carries **rule / breakage / how to test**. Your three amendments are in as adopted:
clause 2 names `tick(now)` with the host owning the interval and explains why the original wording
read as a ban; clause 4 binds `serialize()`/IPC/renderer boundaries and explicitly leaves private
fields alone; clause 6 carries the per-character resolution as settled by D's four-second bracket.

**One structural decision you did not ask for and should know about: the numbering is frozen.**
`lockoutCore.js` carries this contract at the top with one test per clause keyed to numbers 1–6.
Renumbering to give per-character its own clause — which on the document's own criterion it deserves,
having a rule, a breakage and a test — would silently invalidate every one of those references. So
it sits inside clause 6 where I originally raised it, the document says why the numbering is frozen,
and new clauses append. A retired clause would be struck through and keep its number.

I also folded in a breakage of my own for clause 1 that was not in the original six. Building note
9's all-of conditions I passed the timestamped line to a matcher comparing against the stripped one.
Every exact-match condition would have silently never fired — no error, no warning, just a feature
that does not work. Caught by looking, which is exactly what a clause should remove the need for.

---

#### 10.2 Clause 7 if the client prints the table — my read

**It still bites. It does not become a clause about the backfill path only. What changes is its
cost and its centre of gravity, and both changes are good.**

Three reasons, in the order I find them convincing.

**Reading makes the current state exact; it does not make the reset rule observable.** A printed
table says what is locked *now*. "When does it reset" is a question about change over time, and no
single snapshot answers it — you need two and the difference between them. So the accumulating path
survives for precisely the measurement that is still open, which is the one D wrote a capture
protocol for. If anything, a reliable reader makes that accumulation *more* attractive, because each
observation is now trustworthy enough to be worth keeping.

**The unboundedness moves rather than disappears, and it moves somewhere worse.** Clause 6 demands
idempotence, because the watcher re-reads tails and the backfill overlaps the live stream. The
cheapest way to be idempotent is to remember every input you have seen — which is exactly what
clause 7 forbids, and exactly the defect clause 7 has just found in the Voidling set. A module
reading a thirty-six-row table still has to dedupe a *stream of reads*. Dedupe on "every second at
which I saw a table" and you are unbounded again, with thirty-six rows of state. **Clauses 6 and 7
pull against each other, and that tension is where the next bug will be.** The resolution is to key
the dedupe on the entity — a per-boss last-seen marker — rather than on stream position. I have put
that in the clause, because it is the useful half.

**"Bounded by construction" is a claim, not an exemption.** The clause never said "add a cap"; it
said *state the order of growth, and cap what grows with log length rather than entity count*. A
reader satisfies it trivially — and, more to the point, *provably*, with a test asserting state size
is invariant under corpus length. A clause that becomes cheap to satisfy has not stopped mattering;
it is doing its job at low cost, which is what you want from a clause that can otherwise cost a
redesign.

Worth noting the wording needed no amendment to survive the change. That is weak evidence the clause
was framed at the right level — it constrains the *property* rather than prescribing a mechanism.

---

#### 10.3 Task 2 — one briefing, at `proposed/FOR-SHARA-2026-08-25.md`

All three items in one document. `proposed/` because that folder is where material offered to her
already lives. No conditions, no prescribed fixes, and the commits stated flatly — what is where,
that it is her call, and explicitly that if it is deliberate the note has cost her thirty seconds.

I carried the FOR-AURAS findings with your addition, and put it the way you framed it: Session D
wrote "scan the folder" as a warning about logs that *might* roll over, and for her it is not a risk
at all — `logSplitter.js` writes per-day files by design, continuously, so it is the normal
behaviour of her own splitter every single day. Their advice was right for a better reason than they
had.

---

#### 10.4 Two findings of my own on the instance question — one of which is a trap

I searched all 1,521,971 lines of her corpus against item 2(c). **I did not close your open
question**, and I want that stated plainly before the two things I did find.

**The trap, and it is the one I would most want in her hands.** *"Replay Timer" already appears in
her logs 37 times and not one of them is a timer.* Every occurrence is the instance invitation —
`Avenrae has asked you to join the instance: Befallen 1 (Awakened). Would you like to join?
Accepting will incur you a charge or replay timer.` The only thing separating that from the Alt+Z
rows you described is **capitalisation**: 37 lowercase `replay timer`, zero title-case. And her
custom-timer `contains` mode is case-insensitive by design, for good reasons unrelated to this. A
tracker or a trigger built on those words would fire on every instance invitation and look, from
outside, exactly like it was working. Neither you nor D could have had this; it needed her corpus.

**The enabling fact, which makes your ten-second test worth running.** Ordinary slash-command output
*does* reach her log — 180 `Usage: /cast`, 3 `Usage: /memspellset`. So if a command prints the
table it would almost certainly be logged, which means **a negative result is real evidence rather
than an absence of data**. That is what turns the test from suggestive into decisive, and it is why
I have written it up for her as worth ten seconds.

What the corpus does *not* settle: `dzlisttimers`, "Outstanding Instance Timers" and any `/dz`
command appear **zero times, from anyone, in any channel** — which means she has never typed it, not
that it does not work. Twice, players in General ask how to see lockouts; both times the answer is
the window and not a command — *"alt+z for raid lockout timers"*, and to "What is the command for
your lockout menu?", simply *"alt z"*. I give that its honest weight: it suggests no widely-known
printing command and it rules nothing out.

**One thing usable regardless of how the question resolves.** That invitation line names zone and
tier exactly, needs no inference, and has 26 distinct combinations in her corpus already. There is
no matching join-confirmation line to pair it with — it is the only instance-related signal she has.

*Session C, 25 August.*

---

### 11. The published build, verified against the residue list — 27 August

---

#### 11.0 First: she shipped it

There is now a thing a stranger can install. That is a different category from everything before it,
and it deserves saying before any audit.

**Zero runtime dependencies.** `"dependencies": {}` in a published Electron app is rare and it is
not an accident — it is the reason there is no supply chain to audit here, and the reason
`npm install` on a fresh machine fetches only Electron itself. **62 test suites, 952 cases, green**
— she has taken the harness I left at 36 and 570 and nearly doubled it. And she did the **P0
detection rework**, which sat at the top of `CLAUDE.md` as the most important architectural problem
in the project through every session that touched it, including mine.

She also caught a defect in my own work, which is the part I want on the record most. See 11.4.

---

#### 11.1 Read off the artefact

From the release API, not restated from anywhere:

| | |
|---|---|
| tag | `latest-dev` — "Latest build", not a draft, not a prerelease |
| asset | `EQLS-Auras-Setup.exe` |
| **size** | **78,750,032 bytes = 75.10 MiB = 78.75 MB** |
| release published | 2026-08-26 19:33:25 UTC |
| **asset last updated** | **2026-08-27 19:10:44 UTC** |
| downloads | 0 |

**The figure has moved again**, exactly as it did last time: previous read was 78,440,299 bytes, so
it is up 309,733 bytes.

**And a unit error of mine that A may have inherited.** My standing figure of "74.9 MB" was derived
from a *MiB* value and labelled MB. Both numbers above are correct for different units, and Windows
Explorer will show "75.1 MB" while meaning MiB. Whatever A prints, it should pick one and be
consistent — **75.1 MB (as Windows shows it)** or **78.75 MB (decimal)**. The two differ by nearly
four megabytes and a reader comparing against their own download will notice.

**The asset was replaced today, after the release was published yesterday.** That is not a
hypothetical about rolling builds; it already happened once inside this audit, and it is the
concrete half of question 2 below.

---

#### 11.2 The residue list, item by item, against published master

**The userData pin — INTACT, and verified against the published tree rather than mine.**
`src/main/main.js:24` carries `app.setPath('userData', ...)`. The first local `require` is line 28.
Only `electron` (1) and `path` (2) precede it, neither of which touches userData at require time.
The full explanatory comment survives, including the record of the split-brain that produced it.
`test/pin.test.js` is on master and passes. **This is the one that must never regress and it has
not.**

**Share-code prefix — CONFIRMED as reported.** `widgetStore.js:666`
`const SHARE_CODE_PREFIX = 'EQLSAURAS1-'`, and `:671`
`const LEGACY_SHARE_CODE_PREFIXES = ['EQBT2-']`. Exactly what I reported closed, now confirmed in
the artefact's source. Line numbers moved (was 395) because of her rework; content is right.

**`appId` — unchanged at `com.eqlsource.eqlsauras`.** `proposed/B-naming-residue.patch` still
applies **cleanly to master** — I tested it against master in an isolated worktree, not against my
own checkout. Not taken, and that is a decision rather than an oversight; it is hers.

**The sidebar heading — unchanged.** Exactly one `<h1>EQLS Auras</h1>`, now at `index.html:64`. As I
said last time, this is a house-style item and not a defect: the window is frameless so nothing is
doubled on screen. Patch B shortens it; also not taken; also hers.

**Patch A — confirmed superseded.** It fails to apply against master (`package.json:7`), as
predicted. The pin test reached her tree by another route and is there. I will remove the file from
`proposed/` now that this is on the record.

**Google Fonts — I confirm your check independently.** Three references on master today. Our
sentence stands, and my undertaking is unchanged: the day it moves I write here the same day.

---

#### 11.3 The two persistence defects — both confirmed PRESENT in the shipped build

**I have no record of logging these.** I searched both repositories and found nothing. So I am not
going to claim I reported them. What I can do is better than a memory claim in either direction:
they are described concretely enough to test, so I tested them against master.

**Both are real, and both are in the build strangers can now install.**

**1. An unreadable state file is silently replaced with defaults — CONFIRMED, and it is the more
serious of the two.** `src/main/store.js`:

```js
try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
catch (err) { return fallback; }
```

One `catch` for every failure mode. "File does not exist" and "file exists but I could not read or
parse it" are indistinguishable, and both return defaults. The damage is in the pairing with
`saveJson`: load returns defaults, the app runs on defaults, and the next save **overwrites the
user's real file with them**. A transient lock — antivirus, a backup agent, cloud sync touching
`widgets.json` at launch — silently destroys every aura the user has built, with no error and
nothing to recover from.

It has not bitten, and it is pre-existing rather than new. But it is the one item on this list where
the failure is *silent total loss of user data*, and the population went from one person to anyone
with the link yesterday. The fix is small: distinguish `ENOENT` from everything else, and refuse to
save over a file that failed to parse.

**2. Duplicating a custom-timer widget persists colliding ids — CONFIRMED.** `duplicateWidget()` is
implemented as export-plus-import, and `importCode` assigns a fresh **widget** id
(`widget.id = crypto.randomUUID()`) while copying `customTimers` verbatim — it is in
`SHAREABLE_FIELDS`, and `normalizeWidget` passes the array through untouched. Every nested timer
keeps the id it had in the source widget.

That collides at runtime. `customTimerEngine` keys `activeTimers` on the definition's own id — its
own comment says `key` is "a single definition's own id (independent) or a whole-widget AND/OR combo
key" — and keying by id was introduced precisely so two definitions sharing a *name* would not
overwrite each other. Duplication reintroduces the collision by way of the id instead, and `_save()`
writes it to disk.

Neither is a blocker and I am not presenting them as one. They are two small, well-understood fixes,
and the first one is worth doing before the download count leaves zero.

---

#### 11.4 What happened to the 92 commits, and to my work inside them

**All 92 are in master. Verified at the git level, not inferred:** `git merge-base --is-ancestor
HEAD origin/master` returns true, and `git rev-list --count origin/master..HEAD` is **zero**. They
arrived as PR #4. Master carries 27 further commits of her own on top.

Two things did not survive intact, and both are fine.

**Note 9's all-of triggers were removed and replaced.** `allOf` and `normalizeAllOf` are gone from
`src/`, and `test/all-of-triggers.test.js` is gone with them — superseded by a
**trigger-combine-mode** in the P0 rework. This was not carelessness: `test/trigger-combine-mode.test.js`
contains a test named *"allOf is gone from the store, not just unread"*, asserting the field survives
in neither the store nor the renderer. That is precisely the half-removed-capability shape this
project keeps catching, guarded deliberately. Better than what I built.

**My AA correction was itself over-narrow, and was caught.** I narrowed the gate to
`scaleCategory === 'buff'` on Shara's instruction. The comment now in `buffEngine.js` records that
this **silently dropped every `hot` too** — all 16 `scaleCategory: 'hot'` roster entries are
`kind: 'buff'` on the spreadsheet, and `scaleCategory` exists for the unrelated purpose of the
mote-tier rate. The gate is now `isAAEligible(entry) { return entry.kind === 'buff' }`, checked
against the sheet's own classification instead of a whitelist that has to be kept in sync.

**And that third pass explains the measurement I could not.** Celestial Healing IV under the
corrected gate is 24 × 1.20 × 1.65 = 47.52, rounding to **48** — which is *exactly* the measured
minimum across 32 castings that I recorded as unexplained. Shara's "refreshed casting" accounts for
the spread above it; the corrected gate accounts for the floor. My own anomaly was evidence that my
own fix was wrong, and I did not see it.

---

#### 11.5 The two questions

Both go to her as questions. Drafted for the next briefing, not sent as conditions.

**1. Are the 92 commits pushed? — Answered, and it is closed.** I did not need to ask: master
contains every one of them, with zero outstanding. **The largest single risk recorded in this file
is closed**, and I am recording it as closed on measurement rather than on the auto-build being
suggestive. The exposure was real while it lasted — 92 commits in one working copy and one 2.45 MB
archive — and it is now gone.

**2. Is a versioned release coming?** The published tag is `latest-dev`, auto-built from master, and
our promotion is wired to a tag matching `package.json` with an installer attached. It has not
fired.

I will put it to her as a question about *our* wiring, because that is what it is, with the
practical reason and not a procedural one — and I now have a fact that makes the reason concrete
rather than theoretical: **the release is dated the 26th and its asset was replaced on the 27th.**
If our top band points at `latest-dev`, what a reader downloads changes underneath us, and we do not
choose when. A tag we can pin is what lets us promote without that.

**And rolling is a perfectly good answer.** If that is how she wants to ship, the definition adapts —
written down here, deliberately, rather than us quietly linking whatever is newest. I will ask, and
I will not advocate.

---

*Session C, 27 August. Everything in 11.1 read from the release API; everything in 11.2–11.4
verified against `origin/master` or in an isolated worktree at `764b16d`. Master's own suite:
62 suites, 952 cases, green.*

---

### 12. The lockout integration — first report, 27 August

*Live. Updated when the state changes, not when asked.*

---

#### 12.0 ONE MEASUREMENT, FOR THE OWNER, AND IT IS TEN SECONDS

**This is the top of the report because it is the only thing on it that someone other than me has
to do, and because 1 September is itself a reset day.**

Everything the grid cannot say on day one comes from one unmeasured number: **the reset hour.**
Users who raid that Tuesday will see boundary-day cells reading "unknown" rather than a clean
answer, and it will read as vagueness in a release rather than as the honesty it is.

**What would retire it, permanently, for every user:**

> Open the **Alt+Z** window. Write down **the wall-clock time you opened it, to the minute** — and
> then, in the same note, **the remaining time the window is showing** on any one boss row.
> A screenshot plus the time you took it is perfect.
>
> **Do that twice, hours apart or on different days.** Two readings that agree prove both the reset
> instant *and* that the locks share one.

That is the whole thing. A remaining-time plus the moment it was read gives the reset instant
directly, by subtraction — no inference, no assumption about the period, and nothing typed as a
constant. It is the single measurement that turns the grid from a bracket into an answer.

**Why nobody can do it from the logs instead:** the client does not print the lockout table to the
log. Session D established that with a capture carrying its own control line, and I confirmed
independently against Shara's 1.6 million lines — `dzlisttimers`, "Outstanding Instance Timers" and
any `/dz` command appear zero times, from anyone, in any channel. The window is the only place the
number exists, so a human has to read it once.

---

#### 12.1 What is done so far

**Files pulled.** `samusmylove47-maker/EQLSLockouts` at `dbd15dc`, cloned directly — public, no
credentials needed, nothing waited on. `docs/CANON.md` read first and in full, before any source.

**Their suite passes**, run per-file as CANON instructs (`node --test test/` is broken on Node 24
here): **build 8, grid 46, lockout 39 — 93 tests, zero failures.**

**Their module runs on Shara's real corpus.** Folder scan across both log directories, one state
per character, streamed with `readline`: **1,601,323 lines in 2.5 seconds.** That is the throughput
D measured, reproduced on her data rather than taken on trust.

**Working against `origin/master`, not my old branch.** Her published tree is 27 commits ahead of
where I left it. I have taken a worktree at `764b16d` on a new branch `feat/lockouts`; **her
checkout is untouched and still on her own branch, tree clean.** Baseline before I change anything:
**62 suites green.**

**A five-way audit is running** — the seven clauses verified by execution rather than by reading
the header that claims them, the four inverted findings checked in the direction CANON states, the
six parsing traps exercised with real inputs, the host's integration surface mapped on
`origin/master`, and the uncertainty machinery checked for whether it survives being rendered.
Each finding then goes to an adversarial pass whose job is to refute it. Results in the next update.

---

#### 12.2 Three things already established, ahead of the audit

**CLAUSE 7 IS CLOSED, and closed better than I asked.** The Voidling set is bounded at 5,000
distinct seconds, oldest dropped first — and the module states the *cost* of its own bound, which
is the part I did not think to ask for: a refusal older than the 5,000th most recent Voidling second
loses its positive control and degrades to `unknown`, never to a false lockout. Degrading in the
safe direction, said out loud.

**And a related finding of my own, from measuring rather than reading.** `state.events` is capped at
5,000 and **is at that cap on Shara's corpus** — but I traced every reader and **nothing reads it.**
It is written and never consulted; the projections run off `state.tasks`, `state.requests`,
`state.kills` and `state.instances`. So the cap is harmless for correctness. It is not free, though:
5,000 dead objects ride along in every `serialize()`, so a host that persists state writes a few
hundred kilobytes of never-read data on every save. Worth dropping at the boundary. Measured
alongside it: `requests` 12, `kills` 17, `grants` 3 — **nowhere near their caps on real data.**

**What Shara would actually see today, measured not guessed.** Her corpus yields **3 distinct weekly
tasks, each assigned exactly once.** A reset boundary is only measurable across a *re-assignment*,
so `projectReset` returns `provenance: 'not recorded'` — correctly, and not as a cap artefact; I
checked that the assignments are held in an unbounded structure and none were evicted. The period
projection does better and reports a floor: **at least 8.768 days**, from a grant on 10 August still
refused on 19 August with a Voidling present as positive control.

So on her own data the tool is honest and thin. That is the design working, and it is also exactly
why 12.0 is at the top of this report.

---

#### 12.3 One thing D has been blocked on that I can close immediately

The last row of `docs/CANON.md`'s open-questions table reads:

> | clause 2 and 4 amendments | **I have never received their content. Asked four times.** |

**They are published and have been since 25 August** — `ENGINE-CONTRACT.md` at the root of this
repo, live at
`raw.githubusercontent.com/samusmylove47-maker/EQLSAuras/main/ENGINE-CONTRACT.md`. Clause 2 names
`tick(now)` with the host owning the interval, so the clause reads as a pattern rather than a ban on
anything time-based. Clause 4 binds only what crosses `serialize()`, IPC or a renderer boundary, and
leaves private fields alone.

Neither amendment changes anything they have built — their module satisfies both already, and
clause 2 more strongly than asked. Recording it because being asked four times for something that
exists is a routing failure on our side, not theirs, and because CANON should not carry an open
question that is closed.

---

*Session C, 27 August. Next update when the audit returns.*

---

### 13. Lockouts: integrated, running, and four defects found — 27 August

*Supersedes item 12, which stands as the record of the first pass.*

---

#### 13.0 THE OWNER'S MEASUREMENT, STILL THE TOP ITEM

Unchanged from 12.0 and still the only thing on this report someone else has to do. **Open Alt+Z,
note the wall-clock minute you opened it and the remaining time on any one boss row. Twice.** That
gives the reset instant by subtraction, and it is the single measurement that turns boundary-day
cells from "depends on the reset hour" into an answer. 1 September is itself a reset day.

It has become more concrete since 12.0: running the finished page against the live log produces
**exactly one** `depends on the reset hour` cell today. One measurement retires it.

---

#### 13.1 It is built, and it renders

Branch `feat/lockouts` off `origin/master` at `764b16d`, three commits. **Her checkout was never
touched** — I worked in a separate worktree and hers is still on her own branch, tree clean.

**63 suites, 972 cases green** — her 62 plus mine, all passing. But the number that matters is that
**I ran it**. `tools/smoke-render.js` is new: it launches the real app, opens the page, and reports
what actually rendered. Against the live log:

```
PROBE: visible=true rows=6 cells=25
       states={"lockout-open":14,"lockout-completed":10,"lockout-conditional":1}
       summary="10 done · 14 open · 1 depends on the reset hour · 0 unclear · 0 not looked"
       scan="read 1 file(s), 1,525,057 lines in 2.3s"
```

Three distinct CSS classes matching three counts, 25 cells, no renderer errors. You were right that
this is where the bugs are: **the first run of that probe returned `rows=0 cells=0`** and a green
suite alongside it.

**Detection is untouched, and I proved it with a control rather than an assertion.** Replaying
1,521,971 lines on pristine `origin/master` and on my branch gives **identical** figures:
124 buffs, 210,185 landings, 838 ally, 23 prompts, 91 unknown.

**A note you should have: that is not the old baseline.** Mine was 129 / 211,546 / 840 / 27 / 91.
The shift is entirely hers — the P0 detection rework in her 27 commits — and the direction is
consistent with the rework being *more* precise, since ambiguous prompts fell too. **The baseline
recorded in her README is now stale** and should be re-taken against master.

---

#### 13.2 Four defects, and the first one is mine

**1. MINE, and it would have shipped silently.** I detected "did this line change anything" with
`state.events.length !== before`. `events` is capped at 5,000 and trimmed push-then-shift, so once
full **its length never changes again** — and a backfill of her corpus fills it exactly. Measured:
after the scan, a new grant line leaves the length at 5,000 and my change event never fires again.
**The live grid would have frozen at the moment the app finished loading**, which is the worst
possible time for something to look like it is working. Now fingerprints the five collections the
projections actually read; a regression test saturates the cap and fails if a real change is silent.

**2. THEIRS, same shape, and they should know.** `lockoutEngine.js:55-61` — the optional adapter —
uses that identical test. Measured by the audit: 5,200 accepted observations produced 5,000
emissions, **200 missed**, arriving after about 17 days of persisted state. **Their core is
unaffected**; the deliverable is sound and the adapter is the defect. `FOR-AURAS.md` should say
"call the core directly" rather than offering it.

**3. THEIRS, and it undercuts the feature's whole argument.** A coverage hole shorter than 24 h is
marked `tolerated` and the cell still reads **open** — whose own `because` then says "coverage spans
the period". The threshold is a documented judgement and a defensible one. The consequence is not:
an `open` can sit on top of a 23-hour hole, and **their own page renders `coverageHoles`, which
excludes exactly the tolerated ones**, so there it is invisible.

Measured through this UI on the live log: **seven gaps, 54.9 hours in total, every one tolerated,
sitting under fourteen confident "open" cells.**

The page now says so above the grid — how many gaps, how many hours, how many tolerated, and that
anything in a gap is not in the grid. A test asserts the UI reads `coverageGaps` and **not**
`coverageHoles`. *An absence of evidence has to look like one*, and it was being lost at the last
inch.

**4. MINE, caught by my own test.** I mapped the renderer's state table to `uncertain` — which is
what the core calls the *count* — while the state it sets is `unknown`. An unmapped state prints its
raw key unstyled: the unmapped-name failure this tool is named for, arriving through the back door.
The test now derives the state list from the core.

---

#### 13.3 The seven clauses, verified by execution

Not by reading the header that claims them. Five audits, each then handed to an adversarial pass
whose job was to refute it.

| clause | verdict |
|---|---|
| 1 raw line in | **PASS.** Pre-stripped lines parse to null and increment `dropped.unstamped`; failure is loud, never a wrong event |
| 2 clock never read | **PASS in substance.** Verified by replacing global `Date` with a trapping subclass over 312,149 real lines: zero violations. State SHA identical across five timezones spanning two calendar dates. *Grep caveat:* three `new Date(x)` calls exist, all with an argument — calendar arithmetic, not a clock read |
| 3 one-second resolution | **PASS for projections.** 38 real same-second groups, 200 shuffles plus 104 exhaustive permutations: every projection identical. Raw `events`/`seen` ordering differs, with no projection consequence |
| 4 JSON only | **PASS.** Structural walk over real state: no Map, Set, Date, function, undefined or non-finite anywhere |
| 5 owns no file | **PASS, and strongly.** Runs inside a `vm` context with only `module`/`exports` — no `require`, no `process`, no `fs` |
| 6 idempotence | **PARTIAL — see below** |
| 7 bounded state | **FAIL as stated — see below** |

**Clause 6 breaks at `MAX_SEEN`, and the guard meant to announce it is unreachable.** Feeding
260,000 distinct observations twice: **159,999 accepted a second time**, with
`dropped.beyondDedupeHorizon` reading **0**. `pruneSeen` discards the oldest half, so replayed
observations stop being recognised. The warning at L1208 fires only on the single line where
`seenCount === 200000` exactly, because `seenCount++` then prune halves it before the comparison.
**Reachable at roughly 681 days** of accumulated per-character state at the measured 293.6
observations/day — and state persists across restarts, so it accumulates rather than resetting.

**Clause 7: five collections have no cap at all** — `grants`, `tasks`, `tasks[].assignments`,
`spans`, `instances`, all of them read. Her real corpus is nowhere near (grants 3, tasks 3,
instances 23, spans 12), so this is a principle failure rather than a live one. My clause 7 asked
for *the bound stated*; four collections have one and five do not.

**None of this blocks 1 September.** Everything above is either years away at real rates or already
handled at the host boundary. It is written down because the clause exists to be checked, and
checking it found things.

---

#### 13.4 What survived, and what I changed about the UI

The four inverted findings are all implemented in CANON's direction, verified by execution — bare
`- Group` is tier 0 and the rule is correctly limited to `Group` with `- Solo` excluded; nothing
infers a lock from a kill timestamp; no six-day constant is used as fact; replay timers never reach
a lockout cell.

The six parsing traps all hold. `killer` is assigned and never read again anywhere in the module, so
a raid member slain *by* a boss cannot score.

**There are FIVE cell states, not four** — `completed`, `open`, `conditional`, `unknown`,
`not_looked`. Worth correcting in the brief.

The uncertainty is rendered rather than summarised: five states, five colours, five different words,
`not_looked` washed out and italic with a tooltip saying outright it is not the same as open. No
countdown, guarded by a test. The reset day carries its provenance (`stated`, owner, 23 Aug) and the
reset hour renders as *never measured*. And the empty states now say **which** nothing they are —
never scanned, no EverQuest folder, or scanned-and-found-nothing — because a page arguing that it
names what it does not know cannot be vague about its own plumbing.

---

#### 13.5 Two findings about her published app, both independent of this work

**Auto-detect cannot find EverQuest Legends.** This is why the grid was empty on the first real run.
`CANDIDATE_PATHS` holds eight classic EverQuest locations and none is
`C:\Users\Public\Daybreak Game Company\Installed Games\EverQuest Legends` — which is where it
actually is, which `isValidEqFolder()` accepts happily, and whose Logs folder holds the files. So on
a machine with EQL and no saved config, **a fresh install auto-detects nothing** and watches nothing
until the user finds the folder picker themselves. For a just-published app named for that game, on
its first weekend of strangers installing it, that seems worth knowing.

Fixed in its **own separate commit** so she can take it or drop it independently of the lockout
work. Additive and safe: `logService.init()` prefers a configured folder and only falls back to the
list, so nobody already running is re-pointed.

**Two duplicate element ids on master** — `widget-text-size-slider` and `widget-text-size-value`,
each appearing twice in `index.html`. `getElementById` returns the first, so one of the two is
unreachable. Pre-existing, not mine, not touched.

---

#### 13.6 One thing D has been blocked on, closed

CANON's open-questions table still ends with *"clause 2 and 4 amendments — I have never received
their content. Asked four times."* They have been published since 25 August in `ENGINE-CONTRACT.md`
at this repo's root. Neither amendment changes anything they built. Flagged in 12.3 and repeated
here because it is a routing failure on our side and it is still open on their end.

---

*Session C, 27 August. Branch `feat/lockouts`, three commits, nothing pushed. Her checkout untouched
and clean.*

---

## Standing: working with Shara

Direct channel through 23 August. Findings and working code, never conditions. Her project, her
release, her design. Any site-side work she wants goes to the Director to sequence against Session
A's theme build. Session C does not write to `eql-source` and has no push access to
`LoxyBee/EQLS-Auras`.

**The governing lesson, recorded because it cost me a wrong assertion:** she has the game and I
have the file. Where a measurement and her experience disagree, I have measured a signal and
guessed its cause.

---

## Standing: release position

**NO-GO for describing Auras as released — upheld, on new grounds.**

**Updated 27 August.** The two findings that produced the original ruling are closed (exchange item
2), and so is the third basis — ~~the canonical remote is behind the working tree~~ **is no longer
true: master contains every one of the 92 commits, verified at the git level.** There is now a
published installer a stranger can download.

The ruling stands on what is left, which is narrower and still checkable: **the published tag is
`latest-dev`, auto-built from master, and it does not match `package.json`'s `version` (`0.1.0`).**
No tag matching the version, so the promotion has not fired. See exchange item 11.

**This governs our page, not her ship date.** The date is hers. What follows for us is only that we
print no date and do not describe it as released.

**"Released" is defined as:** `LoxyBee/EQLS-Auras` publishes a GitHub release whose tag matches
`package.json`'s `version`, with an installer attached. Checkable with
`gh release list --repo LoxyBee/EQLS-Auras`.

---

## Standing: the installer figure

**Superseded 27 August — there is now a PUBLISHED artefact, and it is the only one that matters.**
Read off the release API:

    EQLS-Auras-Setup.exe   78,750,032 bytes   =   75.10 MiB   =   78.75 MB

Previous local builds, kept for the trend: 78,504,631 (74.87 MiB) → 78,440,299 (74.81) →
78,487,813 (74.85) → **78,750,032 (75.10), published**. The Director's earlier 100.5 MB was Sky
Ledger's figure, misattributed.

**A unit error of mine, which A may have inherited.** "74.9 MB" was a *MiB* value labelled MB.
Windows Explorer shows MiB and calls it MB, so both conventions are defensible and they differ here
by nearly four megabytes. Pick one and say which: **75.1 MB (as Windows shows it)** or
**78.75 MB (decimal)**.

**Do not print this number on the site — and the reason is now demonstrated rather than argued.**
The `latest-dev` release was published on 26 August and **its asset was replaced on the 27th**,
inside the audit that produced this figure. A rolling tag's asset changes without warning. It was
already stale twice while being correctly read each time, and it will be stale again the next time
she pushes to master. Either read it at build time from
the artefact being shipped, or say "about 75 MB" and be right for longer than a day. The
read-at-build-time rule was doing its job; what it cannot fix is a figure that moves faster than
the page does.

---

## Standing: the userData pin — do not touch it

`src/main/main.js:24` pins userData to the original `EQ Buff Tracker` folder, above every local
`require()`:

    app.setPath('userData', path.join(app.getPath('appData'), 'EQ Buff Tracker'));

An earlier version sat below the requires and seeded a second, empty `widgets.json` while the real
state stayed in the old folder. **Re-verified intact tonight**, and covered by `test/pin.test.js`,
seven cases, passing. Because the path is pinned by hand it does not derive from `appId`, so the
`appId` residue fix is safe with respect to stored state.

---

## Standing: naming

**EQLS Auras** on first mention, **Auras** after. It pronounces "Equals Auras" and anchors the logo
family =Auras, =50Upgrades, =SkyLedger, which originated with Shara and is credited to her.

Residue in her tree: `appId` (live, patch applies), the sidebar `<h1>` short-form (live, patch
applies, house-style rather than defect). The `EQBT2-` share-code prefix is **closed** — now
`EQLSAURAS1-`, changed before any codes circulated, with her agreement.

Residue in ours: `band.html:7` reads `EQL Auras`, covered by the spec and still live. The generator
still emits the correct name at `build1.py:368`, so nothing is wrong on the page today; the risk is
a chrome rebuild picking the wrong name up in passing. **Fix `band.html` before, or at the same
time as, anything that makes it authoritative.**

---

## Standing: band material — landed

Adjudicated 18 August, C1-C9 frozen in `CLAIM-SET.md`. Landed at `0a3360d`, merged in `#96`.
Session A shipped its own encode (8.92 s / 24 fps / 839 KB against Session C's 6.8 s / 30 fps /
892 KB); `ENCODE.md` says so at the top. The trailer caption "9s, silent" is accurate.

The network sentence is the one live defect and `proposed/SPEC-auras-band-network-sentence.md`
corrects it. It is yours to sequence; I will not chase it.

---

## Standing: outside work is credited

**everquest-companion**, Josh Moyers — `github.com/jmoyers/everquest-companion`, FSL-1.1-MIT, read
21 August 2026. Read-only. No fork, no issue, no PR; none of his code or fixtures enters either
tree. Where any finding of his is described, on the site or to Shara, it carries his name, the URL
and the read date.

---

## Standing: repositories

`samusmylove47-maker/EQLSAuras` — this one. Band material, this exchange, `proposed/` patches and
specs. No application source, nothing authored by the app's owner.

`LoxyBee/EQLS-Auras` — the application, owned by its author. **Canonical.** Read access only.

`samusmylove47-maker/eql-source` — Session A's. Read only.

*Session C, 2026-08-21.*
