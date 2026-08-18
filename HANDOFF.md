# HANDOFF — EQLS Auras (Session C)

The exchange below holds only what is still live. Applied rulings move into the standing sections
underneath and are deleted from the exchange.

---

## From the Director

*Nothing outstanding. Orders of 18 August are executed; results below.*

---

## To the Director

**Two corrections to what I told you earlier today. Read the first one now — it is live on the
website.**

---

### URGENT — the site is currently making a false claim

The band on eqlsource.com says:

> It does not read or alter the game's memory, inject code into it, or send it input.
> **It makes no network requests of its own.**

**That last sentence is now false.** At `src/renderer/main-window/index.html:13-15` the app's main
window carries:

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:..." rel="stylesheet" />

Every launch requests a stylesheet from Google and, because of `preconnect`, opens the connection
eagerly before it is even needed. Google receives the user's IP address each time the app starts.
There is no CSP anywhere in the tree to prevent it.

**Timeline, because it decides whose problem this is:**

- 08:41 — Session A lands the band carrying that sentence
- shortly after — I verify it against `c7f7f4e` and report it Backed. It was true then: the link
  did not exist. `git log -S "fonts.googleapis"` returns exactly one commit
- **16:11 — commit `1fe8fb4` adds the Google Fonts link** as part of the new title bar styling
- now — the sentence on the live page is false

Nobody wrote a false claim. The application changed under a published one. That is the failure mode
this site is least able to absorb, because the sentence is a privacy claim and it is the strongest
thing on the page.

Corroboration beyond reading the tag: when I ran the packaged app it wrote `Network/Cookies`,
`Network/Network Persistent State`, `Network/TransportSecurity` and `Network/Trust Tokens` into
userData — files Chromium only creates when it performs network I/O. I did not packet-capture; the
tag plus those artefacts is the evidence.

**The fix I recommend is to make the sentence true again, not to weaken it.** Self-host the Poppins
files inside `src/` and drop the three tags. It is a small change, it keeps her visual design
exactly, and it restores a claim worth having. Removing the sentence from the site instead would be
the wrong trade — it is the best sentence on the page.

Only the main window is affected. The overlay renderer that draws over the game has no external
references at all.

**This needs Session A to know today, and Shara to approve the self-hosting.** It is a change to her
tree, so I have not made it.

---

### CORRECTION — I withdraw this morning's GO. 25 August is at risk.

I said GO earlier today. That was based on building the app, proving saved state safe, and reading
her `HANDOFF.md`, which lists no blocker. **I did not read the `CLAUDE.md` backlog carefully enough,
and it contains two things that change the answer.** Both were surfaced by the audit fan-out and I
then verified them myself.

**1. A shipped feature the owner has already called backwards, whose fix mutates persisted data —
with no update path.** `CLAUDE.md` records that profile-scoped aura visibility is wrong: today
`activeProfileIds` is bookkeeping only and every aura shows regardless of active profile, and she
says an aura not active on the current profile should never show. The fix "touches `widgetStore.js`'s
data model, `widgetManager.js`'s visibility logic, and the settings UI", and the note says to
confirm the exact semantics with her before implementing — so it is not even designed yet.

There is no updater in the tree. Ship on the 25th and strangers accumulate real `widgets.json` state
under semantics she has already rejected, then need a manual re-download plus a data migration to
get out. That is the same class of problem as the userData split-brain, one layer up.

**2. The core function silently drops real buffs right after launch.** `CLAUDE.md` documents,
confirmed against a real log dump, that a Quick-Buff-style burst arriving soon after a fresh launch
causes every not-yet-known-memorized buff in it to be IGNORED — `Agility`, `Symbol of Naltron`,
`Blessing of the Lord Commander`, `Guard of Vie` and `Blessing of Faith` in the captured case — with
no recovery inside that session. `currentlyMemorized` is session-only and history is never replayed.

This is precisely what the trailer shows working and what the copy promises. A first-time user
installs on Tuesday, launches, Quick-Buffs, and sees missing timers. Her proposed fix is already
specified in the backlog and is narrow.

**Plain answer: NO-GO as things stand today.** Not because of packaging — because of those two.

**It is recoverable inside seven days.** The date returns to GO if:

1. the Quick-Buff burst fix lands (already specified by her, narrow, and it is the core promise), and
2. the profile-visibility reversal is either landed **or** explicitly deferred with a decision that
   it will not change persisted data later — deferring is fine, drifting is not, and
3. the Google Fonts fetch is removed, so the site's claim is true on the day.

Everything else below is hours of work and none of it should move the date.

---

### What I verified in the built app — unchanged and still good

Built and ran the packaged binary at `baea785`.

| Surface | Observed | Settled | |
|---|---|---|---|
| installer | `EQLS Auras Setup 0.1.0.exe` | EQLS Auras | ok |
| window title | `EQLS Auras` | EQLS Auras | ok |
| overlay window | `EQLS Auras Overlay` | — | ok |
| taskbar / process | `EQLS Auras` | EQLS Auras | ok |
| `productName` | `EQLS Auras` | EQLS Auras | ok |
| `build.appId` | `com.eqlsource.eqlsauras` | `com.eqlsource.auras` | residue |
| sidebar heading | `EQLS Auras` | `Auras` | residue |
| **share code prefix** | **`EQBT2-`** | — | **residue, user-visible** |

**The share-code prefix is new and I missed it on my own pass.** `widgetStore.js:242` sets
`SHARE_CODE_PREFIX = 'EQBT2-'` — "EQ Buff Tracker 2". It is stamped on every share code a user
copies and pastes to another player, so the dead name travels by hand between users. Changing it
after release breaks codes already in circulation, so this is the same free-today, expensive-later
shape as the appId.

On severity: adversarial verification downgraded the appId and sidebar items from major to minor,
and it is right. Neither is rendered to a user in a way that misleads, `appId` does not feed the
userData path — verified independently — and nothing has been distributed, so both are still free.
The timing argument stands: `appId` is the NSIS uninstall key and Windows AppUserModelID, so the
window to change it closes the moment anyone installs.

The sidebar item is better described than I described it: the title bar added in `1fe8fb4` already
prints "EQLS Auras", so the `<h1>` directly beneath now prints it a second time, stacked. It is a
duplicate introduced by the title-bar work, not old-name residue.

### The pin and saved state — unchanged, still proven

`app.setPath` intact at `main.js:24`, above every local require, sole path authority. The packaged
app created `%APPDATA%\EQ Buff Tracker` with real state in it; removed afterwards, machine clean.

The seven-case regression test in `proposed/` passes and was mutation-tested against three
deliberate regressions — pin moved below the requires, pin repointed, a new field left out of
`normalizeWidget` — each caught, green on revert.

Independent audit agreed and went further: `1fe8fb4` renames no store file, no persisted key,
changes no existing default and no persisted shape. It adds one store file
(`lastSoundPickerDir.json`) and four widget fields, all backfilled by `normalizeWidget`. **No
migration needed.**

Two persistence defects worth logging, neither release-blocking, neither introduced by this commit:

- an unreadable state file is silently replaced with defaults, destroying it — `store.js`'s
  `loadJson` catches every error and returns the fallback, so a truncated `widgets.json` is
  overwritten rather than reported. Pre-existing, affects all stores.
- duplicating a custom-timer widget persists colliding timer ids, which defeats the id-keying fix
  in this very commit. Custom sound selections are also dropped on duplicate.

### Packaging — the installer, and what it says about the project

**`EQLS Auras Setup 0.1.0.exe` — 78,504,631 bytes (74.9 MB).** Read off the artefact.

Two things I did not have this morning, both from the packaging audit and both verified:

- **the shipped exe is branded "GitHub, Inc." as publisher.** Electron's default metadata is never
  overridden, so Windows attributes her software to GitHub in file properties and in the SmartScreen
  dialog. Worse than an unsigned binary with no publisher, because it is a wrong one.
- **the default install directory is `%LOCALAPPDATA%\Programs\eqls-auras`**, derived from
  `name`, not the product name.

Confirmed clean: `buffs.json` **is** inside the packaged `app.asar` (2,766,347 bytes, parsed from
the real build), and `1fe8fb4` added no sound assets, so the `files` glob has nothing to miss.

Still outstanding from this morning: no icon, unsigned installer, no LICENSE, no README, two
zero-byte tracked files, and auto-update metadata generated for an app with no updater.

**And `npm run dist` still exits 0 while producing no installer** when the `winCodeSign` unpack
fails. Her documented workaround fixes it. The silent success is the part that is not documented,
and this machine's cache held sixteen failed attempts dating to 16 August.

### The =Auras mark

**Nothing drawn.** Slot left for Session A to design centrally, landing only once Shara and the
owner approve. No mark, no placeholder, no glyph that could ship by accident.

### What needs Shara's consent

In `proposed/`, none applied, no push access used, her tree untouched:

- `A-userdata-regression-test.patch` — seven cases plus an `npm test` script; the project's first
  test, no dependencies
- `B-naming-residue.patch` — `appId` and the sidebar `<h1>`

Not yet written, pending her decision: self-hosting Poppins, and the `EQBT2-` prefix.

---

## Standing: naming — closed

**"EQLS Auras"** on first mention, **"Auras"** after. EQLS is the name, not an abbreviation to be
avoided — it pronounces "Equals Auras" and anchors a logo family: =Auras, =50Upgrades, =SkyLedger.
Session C called the rename to "EQLS Auras" wrong; it was right.

---

## Standing: the userData pin — do not touch it

`src/main/main.js:24` pins userData to the original `EQ Buff Tracker` folder, above every local
`require()`:

    app.setPath('userData', path.join(app.getPath('appData'), 'EQ Buff Tracker'));

An earlier version sat below the requires and seeded a second, empty `widgets.json` while the real
state stayed in the old folder. Verified intact at `baea785` and now covered by a regression test
that fails if it is moved, repointed or duplicated.

---

## Standing: band material — landed

Adjudicated 18 August, C1-C9 frozen in `CLAIM-SET.md`. Landed at `0a3360d`, merged in `#96`.
Session A wrote its own copy and shipped its own encode (8.92 s / 24 fps / 839 KB against Session
C's 6.8 s / 30 fps / 892 KB); `ENCODE.md` says so at the top.

**Two defects on the live page**, both in the exchange above: the heading reads "EQL Source Auras"
where it should read "EQLS Auras", and the network sentence is no longer true.

---

## Standing: repositories

`samusmylove47-maker/EQLSAuras` — this one. Band material, this exchange, `proposed/` patches. No
application source, nothing authored by the app's owner.

`LoxyBee/EQLS-Auras` — the application, owned by its author. **Canonical.** Read access only;
Session C has never written to it. Anything landing there goes as a proposed patch with her consent.

`samusmylove47-maker/eql-source` — Session A's. Read to verify what landed; never written to.

*Session C, 2026-08-18.*
