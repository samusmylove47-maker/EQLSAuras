# =Auras page deck — her copy, her placement, our page's shape

**Session C, 5 September 2026.** Measured at `LoxyBee/EQLS-Auras@8da2cc88`, read-only.

**This supersedes nothing in `FOR-SESSION-A-AURAS-V11-HYPE.md` — it adds the half that document
did not cover.** That one fixed four wrong figures on the band. This one is the page copy, because
**`docs/HIGHLIGHTS.md` is not a shot list, it is the page**, and our site carries about a third of
it.

---

## 1. THE HERO — the owner is right, and the purpose-made replacement cannot ship as-is

**`01-hero.png` renders the owner's real character name.** `>> Shara <<` as a floating nameplate at
frame centre, with the guild tag `<Valor>` directly beneath it. **It is the game's own nameplate
over her own character, mid-frame** — so this is not a corner to crop off.

**I tested that rather than asserting it.** A 16:9 crop from the top of a 1123×710 image reaches
y=631 and the nameplate sits at y≈285–340. **Every 16:9 crop of this image contains the name.**

### But there is a clean cut, and it is better than what is live now

**`00-hero-candidate-CROPPED.png` — 1123×254, cut at y=254.** The ink profile of the left tile
column has a genuine gap at y≈246, so the cut lands *between* aura tile rows rather than through
one.

**What survives the crop is, by luck, exactly the product:**

- the full **14-tile buff row** across the top with live countdowns — 56m, 63m, 85m, 96m, 99m,
  100m, 115m
- the **"Unknown"** and **"You"** aura groups on the left, one clean row each, ticking 0:05, 0:47,
  0:17
- game environment behind it, and **one NPC nameplate, "Guard Hutan"** — an NPC, not a player

**No player name. No guild tag.** Verified by eye at native size, not by grep.

**Two honest limits, because this is a salvage and should be described as one:**

1. **It is 4.42:1.** It is a **banner**, not a hero. It will not fill a 16:9 figure slot, and it
   should not be stretched into one.
2. **It is a derivative of Shara's asset that I made.** I have not touched her repo — the crop
   exists only here. **She should see it before it ships**, and that routes through the owner.

**The real fix is one capture.** Shara re-shooting the same frame with nameplates off, or on a
character whose name is not hers, at 1600×900. **That single re-shoot unblocks the hero AND
`04-lockouts.png` at the same time.** I would ask for it before settling for the crop.

---

## 2. THE PAGE — her nine public sections, her copy, verbatim

**Her style guide governs, and it is hers:** *say what the player gets, not how it works; short
sentences; second person; every line earns its place; cut filler; no dev jargon.* **Her lines
already obey it. Do not paraphrase them into our voice — the section is titled "Writing copy from
this file", so they were written to be used.**

**★ = never appeared on our site before. Nine of these nineteen lines are new to us.**

### Pitch — top of page
> **A countdown timer for every buff you're running, right on top of the game. Read straight from
> your EverQuest Legends log.**

**⚠ Our live page still uses "Stop alt-tabbing to check your buffs." Shara DELETED that sentence at
`fdf623a7` on 3 Sep.** We are publishing copy its author retired.

**Longer, for the page body:**
> EQLS Auras watches your log while you play and puts a click-through overlay on screen with a
> timer for every buff you're running. Build as many overlays as you want, put them where you want,
> give them sounds. Point an aura at any line in your log, not just buffs the app knows. It hides
> when you tab out of EQ and comes back when you tab in. It tracks your weekly raid lockouts, which
> EQ never prints.

**IMAGE:** `00-hero-candidate-CROPPED.png` (see §1). Her spec puts `01-hero.png` here.

### Buff tracking
> **Every buff you're running, counting down, on top of the game.** Read straight from your live log.

### Overlays
> **As many auras as you want, each its own window.** Position, size, opacity, colours and text, set per aura and remembered.
>
> **Icon grid or list.** Switch any aura between the two.
>
> **Stays out of the way.** Click-through, so it never eats a click. Hides when EQ isn't the focused window, comes straight back when it is.

**IMAGE:** `02-list-aura.png` (322×408) under **Icon grid or list.** — her placement.
Shows 13 buff rows, Resist Magic 47m through Shield of Words 106m.

### Group buffs
> **See what you've cast on your group.** Shows what's landed on each groupmate, by name.

### Custom and premade auras
> **Premades for the common stuff.** Buff timers, cooldown timers, resist flashes, "you got dispelled," "your charm broke." Drop them in, done.
>
> ★ **A cooldown timer that tracks the buff first.** One tile counts the buff down, then rolls straight into "ready in X" with no reset.
>
> **Trigger an aura off any log line.** Cast lines, zone in and out, or any text you type.
>
> ★ **Combine triggers, or flip them.** AND/OR several triggers on one aura. Or invert an aura so it shows what hasn't happened yet — "this is ready, go use it."
>
> ★ **Text-only auras.** A fixed label the moment a trigger fires, no timer.

**IMAGE:** `03-add-aura.png` (985×731) under **Premades for the common stuff.** — her placement.

**⚠ HELD, PENDING A RULING — do not publish yet, see §4:**
> ★ **Share an aura with a code.** Copy the config to a short code, a friend pastes it in and has the same aura.

### Sound and alerts
> ★ **Separate sounds for landed, expiring and expired.** Per aura.
>
> ★ **Use your own sound files.** Any audio file on your PC. Starter sounds ship with the app.

### Raid lockouts
> **Know when your lockouts reset.** EQ never prints a lockout line, so the app reads the weekly-task messages it does print on a kill and tracks each lockout from those.

**⚠ Our page states the claim without the mechanism. Hers explains WHY it can do something EQ
cannot, in one sentence. That sentence is the most persuasive line in the whole file — take it.**

**IMAGE:** `04-lockouts.png` — **HELD.** See §3.

### Travel
> **Zone-by-zone routes.** Pick where you're going, get the route across 100+ zones and the travel spell for each step.

**IMAGES:** `05-travel-popup.png` (637×474) and `06-travel-route.png` (390×264), both under this
one headline — her spec assigns both here. The popup shows the destination picker; the route
overlay shows *Cast North Ro Gate 1/3 → Go to East Freeport 2/3 → Portal to The Plane of Sky 3/3*.

**"100+" is hers and it is true — the routing graph holds 104 zones.** Print **her** number, not
mine: it is her copy and 104 will drift.

### Action bars
> **Skin your hotbar.** Overlay tiles that sit on your real action bar buttons — game spell icons, hybrid icons that combine two, or plain frames. Per profile. Doesn't touch the real bar.

**IMAGE:** `07-stances.png` (755×468) — her placement. Shows the Gems config panel, 12 spell gems
in a 4×3 grid.

### Quality of life — ★ the whole section is new to us
> ★ **Trade pings.** A sound the moment someone opens a trade with you.
>
> ★ **Log files kept tidy.** Splits your log per day and per session, archives at each raid reset, plus a manual archive-and-truncate. Your raw log folder stops growing forever.
>
> ★ **Fix the spell data by hand.** Browse every spell the app knows, correct a wrong one, or add your own. Your fix sticks through updates.
>
> ★ **Move your setup to another PC.** Export every aura, profile, sound and setting to a folder, import it on the other machine. Offline.

### Install — hers, and better than ours
> **Installing**
> 1. Download the installer.
> 2. Run it.
> 3. Windows SmartScreen will warn about an unknown publisher. Click **More info**, then **Run anyway**.
> 4. Open EQLS Auras. It finds your EverQuest install on its own — nothing to point it at.
>
> Windows only. Free.

**Use hers. She knows what SmartScreen actually says.** Ours compresses it into one sentence in the
band foot; hers is a numbered list next to the download, which is where someone reads it.

---

## 3. WHAT DOES NOT FIT, RATHER THAN BENT TO FIT

**`04-lockouts.png` is held and its section loses its image.** It shows **"Shara"** in the
Character dropdown — top-left, a single small rectangle, **so unlike the hero this one IS croppable
or trivially re-shot.** But cropping it leaves a second exposure: the grid publishes a **real dated
raid history** — *"This period: Aug 25 – Sep 1, 2026"*, Lady Vox Aug 29, Master Yael Aug 29, Plane
of Fear Aug 30–31, Plane of Hate Aug 30. **Worth a look before it ships even redacted.**

**Two sections have no image and that is fine** — Group buffs and Quality of life. Her shot list
wanted ten; **only seven were captured.** The three never taken are the custom-trigger builder, the
share-code dialog and the sound picker.

**Nothing else fails to fit.** Her nine public sections map onto a `/auras` page one-to-one, and
five of the seven images land in her slots unmodified.

**There are no videos.** Zero `.mp4`/`.mov`/`.webm`/`.gif` on master, on any branch, or in the
release assets. Her `## Videos` section names three and none was captured. **Do not build a frame
that needs one.**

---

## 4. THE ONE THING I AM NOT DECIDING — for the owner

`RELEASE-PAGE.md:23` ends the image table with:

> *"Not on the page: Pull Timer panel (module — private, not advertised), share code, sound picker."*

**But `HIGHLIGHTS.md` carries both share codes and custom sounds as finished feature copy.**

**Two readings.** It lists which **screenshots** are absent — the three never captured, which
exactly matches the wishlist gap. Or it lists which **features** are not advertised, which is what
*"private, not advertised"* says of the Pull Timer.

**The Pull Timer is unambiguous and stays out.** The other two are in her own public feature copy,
so the second reading contradicts her page. **I have held them rather than guessed:**

- **HELD:** ★ *Share an aura with a code* (Custom and premade auras)
- **CLEARED:** *Separate sounds…* and *Use your own sound files* — these describe the **sound
  feature**, whereas the exclusion names the **sound picker**, which is a screenshot that was never
  taken. **I judge those different things; say if you disagree.**

**If the owner clears the share code, it drops straight into §2 where it is marked.**

---

## 5. CLAIMS EACH IMAGE SUPPORTS, AND ONE THE PAGE SHOULD STOP IMPLYING

| Image | Supports |
|---|---|
| `00-hero-candidate` | "Every buff you're running, counting down, on top of the game" — 14 live countdowns visible |
| `02-list-aura` | "Icon grid or list" — the list mode, 13 rows |
| `03-add-aura` | "Premades for the common stuff" — the actual premade menu |
| `05` + `06` | "Zone-by-zone routes" — picker and a real 3-step route |
| `07-stances` | "Doesn't touch the real bar" — it is plainly a separate config surface |

**Re-verified at `8da2cc88`, all fifteen memory/injection/input APIs absent, control-checked:** the
published line *"does not read or alter the game's memory, inject code into it, or send it input"*
**is still true.** **But `foregroundWatcher.js:350-365` calls `ShowWindow` and
`SetForegroundWindow`** to raise the game window. **The sentence stands; do not upgrade it to
"never touches the game" or "purely passive".**

**Must still not be promoted, all re-checked:** Aggro Board (locked, `main-window.js:4641`), Buff
Planner (`exp` badge), Pull Timer panel (private, not shipped), Combat-state trigger (Planned
badge), two Experimental toggles, the three uncaptured videos, "11,337", and *"makes no network
requests of its own"* (false).

**And new since I measured:** `a0ce581c` *"damage/heal meter overhaul"*. **It is not in
`HIGHLIGHTS.md`, so no approved copy exists. I have written none.**

---

## 6. MANIFEST

```
handoff/FOR-SESSION-A-AURAS-PAGE-DECK.md      this file  — the page copy and placement
handoff/FOR-SESSION-A-AURAS-V11-HYPE.md       the four wrong figures on the band
handoff/auras-v11-band.html                   drop-in band, replaces index.html 103-158

handoff/release-images/
  00-hero-candidate-CROPPED.png  1123x254  4f76fd55f70c557a49ec93b26dbe105fdcc7ea0924cf72270b9fd538a603228e   DERIVATIVE, needs Shara's sign-off
  02-list-aura.png                322x408  33713c01c3205bc9d83222f90f657b05b35f254a050977104733c4550853f18e
  03-add-aura.png                 985x731  c20a1696bfbe46f6fad0eabbb3254b17e3b624ac1b34f1bbcccce6f370bdcbdb
  05-travel-popup.png             637x474  a68b18cdf36cdc3e11bdc04a6fd33c909e59b12d7e8c6947b29cb7a5e7eb4abc
  06-travel-route.png             390x264  767b9cafebe5e4abc7be3924a3bdd9bbf0c471350c8c633c0e6831e8c5d595e3
  07-stances.png                  755x468  8aa710c205a71bbe639ec2790d9a12bc333f1dc837a9b28b3073b20a4fd499fb
```

**HELD, deliberately absent:** `01-hero.png` (uncropped) and `04-lockouts.png`, at
`LoxyBee/EQLS-Auras@8da2cc88 : docs/release-images/`. Fetch only if the owner clears them.

**Neither hold is containment** — both are already public in her public repo. **The hold is about
not putting the owner's character name on eqlsource.com**, which is the norm A applied to Session
B's two =Upgrades shots on 3 September.

---

*Session C, 5 September 2026. Her copy is quoted verbatim and marked; my additions are the
placement notes and the crop. Nothing was written to her repository.*

---

## 7. ADDENDUM, 5 Sep — the hero is cleared, the format pass is done, the figures are gone

**Three changes since §1–§6 above. Where they conflict with the earlier sections, these win.**

**THE HERO SHIPS.** The owner has ruled: *"Shara's name is fine, it's her own screenshot of her
app."* **§1's hold is withdrawn and `01-hero.jpg` ships with the nameplate and guild tag.** The
cropped banner survives as `00-hero-nameless-ALTERNATE.jpg` and is now only a fallback if anyone
later wants a nameless variant — **do not use it in preference to the real hero.** The ruling
covers her name in her screenshot and nothing wider.

**`04-lockouts.png` is cleared on the same ground** and is now in the manifest. **Its dated raid
history is a separate matter the ruling did not mention** — flagged, not blocked.

**THE FORMAT PASS IS DONE.** A's finding reproduced exactly: `01`, `02`, `05`, `06` were
photographic content in PNG at 1.05–1.74 B/px against the site poster's 0.12; `03`, `04`, `07` are
flat UI and correctly PNG. **Re-encoded the four to progressive JPEG q85** — 84% off those four,
**72% off the whole set, 1,984,051 → 560,241 bytes.** The hero alone goes 1,089,162 → 166,862 at
0.21 B/px. Checked at native size for artefacts before shipping.

**THE FIGURES ARE OUT OF THE BAND.** Under the ruling *publish a figure with a guard or stop
publishing it*: two of the strip's four had drifted within two days — the roster figure was the raw
count where the loader loads **1,066**, and 53 became **56**. **`assets/auras.json` carried
provenance for both and it did not stop the drift, because a recorded source is not a check.**

**The band now publishes no figures and no version.** `auras-v11-band.html` carries the
alternative in a comment: build-time derivation with the exact source paths
(`buffs.json` minus the `durationSec > 18000` filter → 1,066; `headings` in `buff-lines.json` → 56;
`ZONES` in `zoneGraph.js` → 104; audio under `sounds/` → 15). **That is A's call because A owns the
build. I recommend shipping without them today — the band works without them, and it beats
shipping wrong figures a third time.**

**The download button also loses "79.1 MB".** The URL is deliberately unpinned, the binary moves,
and the tag ref resolves 328 commits behind the asset's own timestamp — **I cannot show which
commit the published installer was built from.** "Download for Windows" stays true; a byte count
does not.

### Manifest, superseding §6

```
handoff/release-images/
  01-hero.jpg                      1123x710   166,862   fb27a9b8f3b7b73a…   CLEARED, ships
  02-list-aura.jpg                  322x408    37,464   a4831a91242c3ade…
  03-add-aura.png                   985x731    62,379   c20a1696bfbe46f6…
  04-lockouts.png                   902x560    70,025   77f3357dcb003e1a…   cleared; raid history flagged
  05-travel-popup.jpg               637x474    58,363   e723e5648b274c6b…
  06-travel-route.jpg               390x264    25,752   62ce15ada88835d8…
  07-stances.png                    755x468    74,794   8aa710c205a71bbe…
  00-hero-nameless-ALTERNATE.jpg   1123x254    64,602   (derivative; fallback only)
```

**Nothing is held any more except the share-code copy line**, which is §4 and is the owner's.
