# HANDOFF — EQLS Auras (Session C)

The exchange below holds only what is still live. Applied rulings move into the standing sections
underneath and are deleted from the exchange.

---

## From the Director

*Nothing outstanding. All rulings received to 2026-08-18 are applied and moved to standing.*

---

## To the Director

**One thing is outstanding, and it is the ruling reversal landing on the page rather than the app.**

**The live band misnames the product.** The heading in `public/index.html` reads **"EQL Source
Auras"**. The product is **"EQLS Auras"**. The band went out at `0a3360d` on 2026-08-18, when
"EQL Source Auras" was the correct name; the owner's override came afterwards. So this is not
Session A's error and not a process failure — it is the ordinary residue of a name changing after
something shipped. But the page is live now, and it misnames the product it exists to announce.

**The fix is one string**, in the band heading only:

    EQL Source Auras   ->   EQLS Auras

Nothing else in the landed copy refers to the product by name. It shortens the page by one word,
so no ceiling change is needed — Session A raised the live ceiling to 787 for its own rewrite and
there is headroom either way. Session A owns that file; I have not touched it.

**Do not rename the assets.** `auras-trailer.mp4` and `auras-poster.jpg` use the approved short
form and are already content-hashed into `public/`. Renaming would churn the hash for no
reader-visible gain. My earlier reasoning for stripping an `eqls-` prefix from filenames is void —
it rested on EQLS being an internal abbreviation, which it is not.

### I checked the landed copy rather than assuming it matched mine

Session A wrote its own prose, which was its call. Two claims in it were not in the set you
adjudicated, so I verified both against `LoxyBee/EQLS-Auras` at `c7f7f4e` rather than let them
stand unchecked:

- **"It makes no network requests of its own"** — a claim I cut and you approved cutting. Session
  A's version survives where mine would not have, because **"of its own"** carries it: it claims
  only for code the project wrote, not for Chromium. Zero network code in `src/`, no updater, no
  crash reporter, no third-party runtime dependency. **Backed, and better built than my cut.**
- **"or send it input"** — not previously checked. No `SendInput`, `keybd_event`, `mouse_event`,
  `PostMessage`, `SetCursorPos` or `robotjs` anywhere in the tree. The only input-adjacent call is
  `setIgnoreMouseEvents(win, { forward: true })`, which makes the overlay decline to capture
  clicks rather than send any. **Backed.**
- **"9s, silent"** — the shipped asset measures 8.92 s with no audio stream. **Accurate.**

The landed copy is factually sound. The name is the only defect in it.

### Session A shipped its own encode, not mine

Worth recording so nobody later reproduces my recipe and wonders why the bytes differ:

| | Session C | Shipped |
|---|---|---|
| duration | 6.8 s | 8.92 s |
| frame rate | 30 fps | 24 fps |
| video | 892 KB | 839 KB |
| poster | 149 KB | 175 KB |

Both 1600x900, both silent, both under the 949 KB precedent. `ENCODE.md` now says at the top that
it documents my asset and not the live one.

---

## Standing: naming — closed

The product is **"EQLS Auras"** on first mention, **"Auras"** after. EQLS is not an abbreviation to
be avoided; it is the name. It pronounces "Equals Auras" and anchors a logo family the owner is
designing — =Auras, =50Upgrades, =SkyLedger.

The application already carries it correctly: `productName` "EQLS Auras", sidebar "Auras", and the
`appId` question resolved to `com.eqlsource.auras` while nothing has shipped and changing it is
free. **The second-rename patch recorded here previously is void.** There is nothing to land in
`LoxyBee/EQLS-Auras`, and no push access is needed.

Session C called that rename wrong. It was right.

---

## Standing: the userData pin — do not touch it

`src/main/main.js` pins Electron's userData directory to the original `EQ Buff Tracker` folder,
above every local `require()`:

    app.setPath('userData', path.join(app.getPath('appData'), 'EQ Buff Tracker'));

This is load-bearing and has already earned its place. An earlier version of the pin sat *below*
the requires and silently seeded a second, empty `widgets.json` under the new folder while buffs,
profiles and spellbook stayed in the old one — a real split-brain that would otherwise have been
discovered by the owner losing her configuration. Her `CLAUDE.md` records that any future rename
must leave the pin alone. Correct fix, correct place to record it.

---

## Standing: band material

Adjudicated 2026-08-18. C1 through C9 approved as worded; wording frozen in `CLAIM-SET.md`,
verified against `LoxyBee/EQLS-Auras` at `c7f7f4e` rather than the stale archive.

```
_media/auras.mp4          892 KB   1600x900, CRF 32, 6.8 s, no audio stream
_media/auras-poster.jpg   149 KB   1600x900
COPY.md                   119 words at the corrected name, ceiling 768
CLAIM-SET.md              C1-C9, frozen, commit-cited
ENCODE.md                 recipe and reasoning; explicitly not the shipped asset
```

Applied rulings: C3 kept in full; C4's foreground sentence held back but written verbatim and
ready; all three character names blurred; CRF 32 as a size precedent not a CRF one; the copy not
to be compressed in a rush. The band landed at `0a3360d`, merged in `#96`.

---

## Standing: defects

**Roster-count drift — the fifth instance of a hand-written figure beside computed truth.** Docs
say "~3300 entries". `src/shared/data/buffs.json` holds **11,337, every one uniquely named**.
Confirmed live at `c7f7f4e`, so not an artefact of the stale archive. Recorded rather than patched:
changing the number produces the sixth instance at the next re-mine. The figure should not be
hand-written at all — either the mining script writes it as it regenerates the file, or the doc
drops the number and points at the file. Cheapest durable version is a check reading
`len(json.load(open('buffs.json')))` that fails on disagreement, the same shape as the gate that
already guards the site's prose.

**A dark rectangle in every frame of the source recording.** Constant position, opaque, over the
game world. Most likely a configured but empty widget drawing an opaque background. Cropped out of
the band, so it is invisible today, but it will appear in any future footage.

**Placeholder text live in the settings UI.** The literal word "planned" where a value belongs
beside three controls, "Not active yet." twice, and a roadmap sentence inside the sounds pane.
Invisible in the band because no application chrome is in shot; the settings panel is the second
thing anyone screenshots after release.

---

## Standing: repositories

`samusmylove47-maker/EQLSAuras` — this one. Band material and this exchange only. No application
source and nothing authored by the app's owner. The ZIP and raw recordings are gitignored.

`LoxyBee/EQLS-Auras` — the application, owned and maintained by its author. **Canonical.** Session
C has read access only. The import contemplated earlier was abandoned once it was found: the ZIP
is behind it, and duplicating it here would have forked a live project behind its owner's back.

`samusmylove47-maker/eql-source` — Session A's. Read to verify what landed; never written to.

The ZIP in this working directory is a stale transfer artefact and is not a source of truth for
any session. Read `LoxyBee/EQLS-Auras` instead.

*Session C, 2026-08-18.*
