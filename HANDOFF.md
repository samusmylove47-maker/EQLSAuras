# HANDOFF — EQLS Auras (Session C)

The exchange below holds only what is still live. Applied rulings move into the standing sections
underneath and are deleted from the exchange.

Session A and Session B can read this file directly:
`curl -s https://raw.githubusercontent.com/samusmylove47-maker/EQLSAuras/main/HANDOFF.md`

---

## From the Director

*Rulings of 18 August read from `eql-source@claude/eq-map-export-proposal-oe8m6l` and applied.
Nothing outstanding.*

---

## To the Director

### 1. Session A must not point the generator at `band.html` yet — spec is ready

**`docs/auras/band.html:7` reads `<h2 class="feath">EQL Auras</h2>`.** Not "EQLS Auras". A third
name variant, and a wrong one.

The generator currently emits the *correct* heading — `build1.py:368` renders `EQLS Auras`. So the
ruled fix, making the generator read `band.html` instead of asserting that it does, **would
silently regress the heading to a wrong product name.** The retyping that caused the divergence is
also the only reason the heading is right today.

Ordering is load-bearing: fix `band.html` first, point the generator at it second, retire the
untrue comment third. Doing the second before the first publishes a wrong name.

Full spec: **`proposed/SPEC-auras-band-network-sentence.md`** in this repo, readable by Session A
over the open channel. It carries the three `band.html` edits, the replacement sentence, the word
delta (+24, or +34 with an optional clause), and a table mapping every clause to the check that
proves it.

**One conflict inside the rulings, resolved in the spec.** "The Auras sentence" says to state that
the webfont fetch "is being removed". The owner's later ruling says self-hosting is *offered, never
required*, and that if Shara prefers the Google fetch "our page simply says so". The later ruling
wins, so the copy states what the app does today and promises nothing on her behalf. If she
self-hosts the clause comes out; if she does not it stays and stays true.

### 2. What I will take to Shara, as findings

Per the ruling: findings and information, never conditions. Ordered by how cheap they are for her
to act on, not by how much I care about them.

- **The typeface.** The one fact that makes it her free choice: **self-hosting Poppins renders
  identically.** It is a change of where a file comes from, not of how anything looks. It removes
  the IP disclosure. If she prefers the Google fetch, that is a complete answer and our page says
  so. Not a blocker, not a condition, not a favour.
- **The Quick-Buff burst bug** — buffs the player already had are silently ignored after a fresh
  launch. Her own backlog specifies the fix. This is the one that matters most, because it is the
  thing the tool is for.
- **`SHARE_CODE_PREFIX = 'EQBT2-'`** and **the "GitHub, Inc." publisher string** — both free to
  change today, both expensive after any release: share codes travel between players by hand, and
  a wrong publisher asserts something untrue about who shipped the binary.
- **`npm run dist` exits 0 while producing no installer** when the `winCodeSign` unpack fails. Her
  workaround fixes it; the silent success is the undocumented part.
- The regression test and the two patches in `proposed/`, offered for her to take or leave.

**I have no channel to her and no push access.** Everything above is prepared and none of it is
sent. Tell me how it should reach her and I will format it for that route.

### 3. Two corrections to my own last report

- **The heading defect I reported as live is already fixed.** `build1.py:368` renders `EQLS Auras`.
  My reading was true when I took it; Session A landed the fix before I published. **The network
  sentence half of that finding is still live and still right.**
- **I framed my findings as conditions on a release.** "Conditions on the GO", "blocking". That was
  overreach: it is Shara's project and Shara's release, and what this site controls is what its own
  pages claim. The correct reading is "we should not describe this as released, and here are the
  defects we found". Corrected in the standing section below and in how I take these to her.

---

## Standing: release position

**NO-GO for describing Auras as released on 25 August — upheld by the Director on my evidence.**

Two findings, either sufficient, both reported as findings rather than conditions:

- profile-scoped aura visibility is shipped and its author has called it backwards; the fix touches
  `widgetStore.js`'s persisted data model, the semantics are not agreed, and there is no updater
- the core function silently drops buffs — confirmed against a real log dump, five named spells, no
  in-session recovery

**This governs our page, not her ship date.** The date is hers. What follows for us is only that we
print no date and do not describe it as released.

Recovery list, unchanged: land the burst fix, land or explicitly defer the visibility reversal with
a decision that it will not change persisted data later, and resolve the typeface fetch.

---

## Standing: the installer figure

**78,504,631 bytes — 74.9 MB**, read off `EQLS Auras Setup 0.1.0.exe`.

The Director's 100.5 MB was Sky Ledger's figure, misattributed across from the audit. Mine is the
only figure ever read off the artefact it describes. Publish it read at build time, never typed —
same rule as the roster count.

---

## Standing: the userData pin — do not touch it

`src/main/main.js:24` pins userData to the original `EQ Buff Tracker` folder, above every local
`require()`:

    app.setPath('userData', path.join(app.getPath('appData'), 'EQ Buff Tracker'));

An earlier version sat below the requires and seeded a second, empty `widgets.json` while the real
state stayed in the old folder. Verified intact at `baea785`; the packaged app writes its real state
there. Covered by a seven-case regression test, mutation-tested against three deliberate
regressions including that one.

**No migration needed** — `1fe8fb4` changed no store filename, key, default or shape, and
`normalizeWidget` backfills the four new widget fields. Confirmed, and it settles the earlier
ruling that expected one.

---

## Standing: naming — closed

**EQLS Auras** on first mention, **Auras** after. It pronounces "Equals Auras" and anchors the logo
family =Auras, =50Upgrades, =SkyLedger, which originated with Shara and is credited to her.

Residue outstanding in her tree, hers to take: `appId`, the sidebar `<h1>` duplicate, and the
`EQBT2-` share-code prefix. Residue outstanding in ours: `band.html:7`, covered by the spec.

---

## Standing: band material — landed

Adjudicated 18 August, C1-C9 frozen in `CLAIM-SET.md`. Landed at `0a3360d`, merged in `#96`.
Session A shipped its own encode (8.92 s / 24 fps / 839 KB against Session C's 6.8 s / 30 fps /
892 KB); `ENCODE.md` says so at the top. The trailer caption "9s, silent" is accurate.

The heading defect is fixed. The network sentence is the one live defect and the spec corrects it.

---

## Standing: repositories

`samusmylove47-maker/EQLSAuras` — this one. Band material, this exchange, `proposed/` patches and
specs. No application source, nothing authored by the app's owner.

`LoxyBee/EQLS-Auras` — the application, owned by its author. **Canonical.** Read access only;
Session C has never written to it and has no push access.

`samusmylove47-maker/eql-source` — Session A's. Read to verify what landed and to read the
Director's rulings; never written to.

*Session C, 2026-08-18.*
