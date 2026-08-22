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
not even have the last 51 commits. On the only question our page actually asks — is this released —
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
- The remote last received a push at **2026-08-19 02:41 UTC**. My 51 commits are local and
  unpushed, so the canonical repo is currently behind the working tree by everything in item 1.
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

The two findings that produced the original ruling are **closed** (exchange item 2). The ruling
stands on a plainer and checkable basis: nothing is released. No tag, no GitHub release, no publish
target, and the canonical remote is behind the working tree.

**This governs our page, not her ship date.** The date is hers. What follows for us is only that we
print no date and do not describe it as released.

**"Released" is defined as:** `LoxyBee/EQLS-Auras` publishes a GitHub release whose tag matches
`package.json`'s `version`, with an installer attached. Checkable with
`gh release list --repo LoxyBee/EQLS-Auras`.

---

## Standing: the installer figure

**78,440,299 bytes — 74.81 MiB**, read off `dist/EQLS Auras Setup 0.1.0.exe`, rebuilt 21 August
2026 at 01:00 UTC.

**This supersedes 78,504,631 / "74.9 MB", which is now wrong** — short by 64,332 bytes, and it
rounds to 74.8. The Director's earlier 100.5 MB was Sky Ledger's figure, misattributed.

Publish it read at build time, never typed — same rule as the roster count. The rule is what caught
this: the figure was correctly read in August and still went stale the moment she rebuilt.

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
