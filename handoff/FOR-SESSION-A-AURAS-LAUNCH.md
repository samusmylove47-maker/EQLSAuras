# =Auras launch package — for Session A

**Session C, 3 September 2026.** Everything needed to make EQLS Auras the lead item on the home
page: the markup, the copy, the claims behind every sentence, the media, and the download.

**The band is `handoff/auras-launch-band.html` beside this file. Lift the markup from there rather
than retyping from this document, so what ships is what was checked.**

---

## 1. WHY THE CURRENT FRAME IS WEAK — measured, not judged

The owner called the present promotional frame "very weak." Five specifics, all from
`public/index.html` at `8145dee7`:

| # | Measured | Where |
|---|---|---|
| 1 | **It is the third section**, below the hero and below "Start here" | `:70`, `:98`, `:134` |
| 2 | **No download.** Its only call to action is the soft link "More about EQLS Auras" | `:153` |
| 3 | **The one download button on the whole home page belongs to Sky Ledger**, a different product. **The released flagship has a weaker call to action than the thing below it.** | `:235` |
| 4 | **It describes one feature of nine.** `docs/HIGHLIGHTS.md` ships nine areas | `:150` |
| 5 | **It carries no figures**, while =Upgrades directly below carries three | `:150` vs `:198` |

**The sixth is the one that matters most: the eyebrow says "Live now" and the page gives the reader
no way to get it.** The installer has been published since 1 September.

---

## 2. THE DOWNLOAD

```
https://github.com/LoxyBee/EQLS-Auras/releases/download/latest-dev/EQLS-Auras-Setup.exe
```

**Verified live 3 Sep, 18:46Z:** `302` then `200`, `Content-Disposition: attachment`,
`Content-Length: 79088490`. The `latest-dev` tag always points at the current build, so the link
does not need revising per release.

**Print it as `79.1 MB`.** That matches the site's existing convention — Sky Ledger's
100,482,932-byte asset is printed as "100.5 MB" at `index.html:235`, i.e. decimal MB, not MiB.

Release tag `latest-dev`, asset updated `2026-09-03T02:20:30Z`. Product version **1.0.0**
(`package.json`).

---

## 3. MEDIA INVENTORY — everything that exists, strong and weak both

### Fit to lead — already on our site, already hashed, needs no work

| Asset | Path | Size | Notes |
|---|---|---|---|
| **Trailer** | `_media/auras-trailer.mp4` to `public/assets/media/auras-trailer.5fc3fbbc.mp4` | 859,203 B | 1600x900, 8.9s, 24fps, **no audio stream at all** |
| **Poster** | `_media/auras-poster.jpg` to `public/assets/media/auras-poster.5c861299.jpg` | 179,156 B | 1600x900 |

Both were committed by the owner on **18 Aug** (`0a3360da`). They are the only usable promotional
media that exists anywhere, and they are already in our repo and already in the manifest.

### In Shara's repo — the honest finding

**`LoxyBee/EQLS-Auras` contains no promotional video or photography.** Enumerated across **all 21
branches** at master `3a4d119c`: the only image files in the entire repository are
`build/icon-source-256.png` and `build/icon.png`. **Zero mp4, gif, jpg, webp or svg.**

**What looks like a media library there is a shot list.** `docs/HIGHLIGHTS.md` ends with a
`## Screenshots` section naming 10 desired captures and a `## Videos` section naming 3. They are
written as instructions to whoever takes them ("Real time, no cuts"), not as an index of files.
**Nothing has been captured yet.** `docs/RELEASE-PAGE.md` says where 7 of them attach.

**So the launch band cannot be built around new media, and this one is not.** It uses the trailer
we already have. When the captures arrive, `RELEASE-PAGE.md` already specifies their placement.

### Weak assets, listed because they were asked for rather than filtered

- `build/icon.png`, `build/icon-source-256.png` — app icon. Usable as a favicon or a small mark;
  not a hero asset.
- `docs/auras/band.html` in our repo is the **18 August** band and is **superseded** — it still
  says "Targeting next Tuesday's maintenance" and calls the product "EQL Auras". Do not lift from
  it. `docs/auras/BAND-COPY.md` beside it has the same problem plus the one in §5.

---

## 4. PLACEMENT

**Delete `public/index.html` lines 134-187** (the existing Auras band) and **insert the new band
immediately after the hero closes at line 97, before `<section class="band doors">` at line 98.**

That makes the order: hero, **=Auras**, Start here, =Upgrades, Sky Ledger, Lockouts.

**If the owner wants it literally first**, above the hero, the band stands alone and will render —
but the hero carries the site's identity and its search box, and I would not displace it without
their say-so. **The slot directly beneath the hero is the strongest position that costs nothing.**

### Prose budget — this needs a deliberate ceiling raise

```
old band  :  43 words
new band  : 182 words
NET       : +139 words on index.html
```

Counted with my own stripper, **not** `gate.py`'s `page_words` — re-measure with yours before
setting the number. `index.html` was at **649 of 649** with no headroom, so this needs a hand edit
to `assets/prose-budget.json` with the reason in the commit message. `prose_budget.py` only ever
lowers ceilings; raising one is a decision, which is what `CLAUDE.md` requires it to be.

### Gate pre-check, run against the band body

- **HEDGE vocabulary** (`unverified|unconfirmed|disputed|retract|pre-launch|import|...`): **absent.**
- **Braces in visible text:** none.
- **Figures printed:** 1,067, 53, 100, 15, 79.1 — all appear literally in the visible copy.
- **Both figure rules bind the `<meta name="description">`, not the band.** If you put a number in
  index.html's description, it must appear literally on the page.

### One CSS note

The stat strip reuses `class="hero-sig featsig"`. `hero-sig` already exists and will carry it. Add
`.featsig` only if you want it tuned inside a feat band; the band renders correctly without it.

---

## 5. THE CLAIM SET — every sentence, and what backs it

Read at `LoxyBee/EQLS-Auras@3a4d119c`, **not** from the 18 Aug zip that `docs/auras/CLAIMS.md` was
written against.

| Claim in the band | Backing |
|---|---|
| "reads your EverQuest Legends log" | `src/main/logWatcher.js` tails `eqlog_*.txt`; `package.json` description says the same |
| "countdown overlay on top of the game" | overlay windows `frame:false, transparent:true, alwaysOnTop:true`; click-through when locked |
| "Point an aura at any line in your log" | `HIGHLIGHTS.md` "Trigger an aura off any log line" |
| "what you have landed on each groupmate" | `HIGHLIGHTS.md` "Group buffs" |
| "skins your action bar" | `HIGHLIGHTS.md` "Action bars" — overlay tiles, "Doesn't touch the real bar" |
| "routes you across the map" | `HIGHLIGHTS.md` "Travel" — "100+ zones" |
| "tracks the weekly raid lockouts EQ never prints" | `HIGHLIGHTS.md` "Raid lockouts" |
| "One key hides the lot" | `src/main/main.js:182-193` registers a hide-auras global hotkey |
| "the game's own spell icons" | `iconExtractor.js` TGA reader; **1,051 of 1,067** catalogue entries carry an icon id |
| "does not read or alter the game's memory, inject code into it, or send it input" | **Re-run against current master:** `ReadProcessMemory`, `WriteProcessMemory`, `OpenProcess`, `VirtualAlloc`, `CreateRemoteThread`, `SetWindowsHookEx`, `SendInput`, `keybd_event`, `mouse_event`, `ffi-napi`, `memoryjs`, `robotjs`, `iohook`, `desktopCapturer`, `node-gyp` — **all absent from `src/`.** `package.json` declares **no runtime dependencies at all**, only `electron` and `electron-builder` for development. |
| "No telemetry, no analytics, no update check" | `fetch`, `XMLHttpRequest`, `WebSocket`, the `http`/`https` modules, `autoUpdater`, `electron-updater`, `telemetry`, `analytics`, `sentry`, `crashReporter` — **all absent from `src/`.** Renderer CSP sets `connect-src 'none'`. |
| "1,067 spells known" | `src/shared/data/buffs.json`, loaded at `src/main/buffStore.js:43`. Counted: **1,067** entries. |
| "53 stacking slots" | `src/shared/data/buff-lines.json` — 53 headings, 55 upgrade ladders, 14 blocked pairs |
| "15 sounds included" | 15 audio files under `sounds/`, shipped via `extraFiles` |
| "79.1 MB" | 79,088,490 bytes, GitHub release API, decimal MB per site convention |
| "It finds your EverQuest install on its own" / SmartScreen | `docs/RELEASE-PAGE.md` install steps, verbatim |

### TWO CLAIMS THAT ARE NOT SAFE TO PRINT — and one of them is in our own copy notes

**1. Do not print "11,337 buffs", and do not print the About page's "roughly 3,300" either.**
`docs/auras/BAND-COPY.md` recommends 11,337 as "a good promotional figure". **It is now false.**
That file is `archive/buffs-legacy-11337.json`, it is referenced by **no shipped code**, and
`package.json`'s `files` array ships only `src/**/*` — **so it is not even inside the installer.**
The roster the app actually loads holds **1,067** entries. Printing 11,337 would overstate by
**10.6x**. The two files are not even the same kind of thing: the archive is a landing-text roster,
the live file is a spell catalogue with different fields.

**2. Do not restore "It makes no network requests of its own."** See §6.

---

## 6. A CONTRADICTION BETWEEN TWO OF OUR OWN PAGES — settled

`public/auras.html:111` tells visitors the app **fetches its typeface from Google at launch, which
discloses their IP to Google.** `docs/auras/CLAIMS.md:79-82` says a search of the entire `src/`
tree for `http://`, `https://`, `www.`, `.com`, `.net` **"returns nothing. There is not one URL in
the shipped source."** They cannot both be true.

**Measured at `3a4d119c`. `auras.html` is correct, and it is correct at a precision worth keeping:**

```
src/renderer/main-window/index.html:19   <link rel="preconnect" href="https://fonts.googleapis.com">
src/renderer/main-window/index.html:20   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
src/renderer/main-window/index.html:21   <link href="https://fonts.googleapis.com/css2?family=Poppins..." rel="stylesheet">
```

Nine renderer windows permit Google Fonts in their CSP. **Exactly one actually requests it — the
main window.** The other eight, including the overlay drawn over the game, request nothing.
`auras.html` already says precisely this: *"That fetch is the main window only: the overlay drawn
over the game requests nothing at all."* **No change is needed to that page.**

**`CLAIMS.md` is not sloppy, it is stale.** It states its own provenance — read 18 August against
`EQ tracker.zip` v0.1.0 — and the font link landed at **18 Aug 12:11** in `1fe8fb49`, hours later.
It has a second staleness: `globalShortcut` is on its "not found" list and is now present at
`main.js:182`. (Harmless — it *receives* a hotkey to hide overlays; it does not send input to the
game, so the band's claim stands.)

**Consequence for the band, and it is the reason §5 forbids restoring that clause:** the old copy's
"It makes no network requests of its own" is false. **The band drops that clause and keeps the
three that are still true.** It stays silent on the font fetch rather than contradicting
`auras.html`, which already discloses it correctly. **Routing the `CLAIMS.md` correction is the
Director's, not mine and not this package's.**

---

## 7. WHAT IS STILL MISSING, so nobody plans around it

- **No screenshots and no new video exist.** 10 stills and 3 videos are specified in
  `HIGHLIGHTS.md` and unshot. Until they are taken, the 18 Aug trailer is the only moving asset.
- **`docs/ANNOUNCEMENT.md` is a written Discord post, gated** — it says hold until the release page
  at `https://eqlsource.com/tools/` is live. It is ready to go the moment this lands.
- **Do not promote the Aggro Board.** `modules/aggro-board.js` is the only module shipped in the
  box and the owner has **locked it out** of the in-app Add Aura list while its raid-boss parsing
  is reworked. It is deliberately absent from this band.

---

*Session C, 3 September 2026. Everything above measured at `LoxyBee/EQLS-Auras@3a4d119c` and
`eql-source@8145dee7`, read-only. I have not written to Shara's repository and will not.*
