# HANDOFF — EQLS Auras landing band (Session C)

## To the Director

Everything is in `_deliverables/`. Nothing was written to the eql-source repository.

```
_deliverables/
  _media/eqls-auras.mp4          933 KB   1600x900, CRF 32, 6.8 s, no audio track
  _media/eqls-auras-poster.jpg   152 KB   1600x900, q3
  COPY.md                        the band copy, 119 words, with a cut-order if the ceiling fight is lost
  CLAIM-SET.md                   every assertion with its backing — the thing for you to adjudicate
  ENCODE.md                      exact reproducible commands, framing rationale, one stated deviation
  HANDOFF.md                     this file
```

Both assets come in under precedent — video 933 KB against 949, poster 152 KB against 177. Both
reuse `_media/` so `_build/media.py` hashes and copies them; no hosting was invented, no embed.

---

### Five things need your decision. The first two are the real ones.

**1. The application calls itself "EQ Buff Tracker" on screen.**

Its title bar, its sidebar header, its taskbar button, and `package.json`'s `productName` all say
EQ Buff Tracker. The copy says EQLS Auras. If any application chrome reaches the page, we name the
product one thing while the video visibly names it another — on the site whose entire proposition
is that it does not overclaim. Somebody would notice within the hour, and they would be right.

I treated this as a selection constraint rather than something to caption around. **The cut
contains no application window, no title bar and no taskbar** — only the game with the overlay
drawn on top, and the overlay itself carries no branding. The contradiction never reaches the
screen and no disclaimer is needed. This is the main reason for the span I chose, and it is worth
knowing that it drove the edit.

It does not fix the underlying problem: the first person to download the build gets an installer
that says EQ Buff Tracker. The copy does not promise the names match, so we are not exposed, but
renaming before release would be cheaper than explaining afterwards.

**2. I used the wrong video, on purpose.**

You described a tutorial and a shorter proof-of-concept demo, and said the demo is the asset. On
content, the mapping is the other way round from what the lengths suggest. The shorter clip
(`eqlwa custom timers.mp4`, 14 s) is a custom-timer feature demo: a configuration panel, then one
timer firing on a `You say, 'hi'` trigger. The longer clip (`EQ AURAS BURST.mp4`, 35 s) opens with
seven seconds of pure gameplay in which an ability fires and **fourteen buff timers populate
across the top of the game**, then spends its back half touring the settings panel.

I took the asset from the longer clip. The shorter one's payoff is a single timer on a very busy
screen, and it puts the application window and the taskbar in frame for half its runtime — both of
the problems above. The seven seconds I cut are the strongest footage in either file and the only
stretch in either that is free of Windows chrome.

If you specifically want the custom-timer trigger story told instead, say so and I will cut it —
but it will be a weaker band and it will need the branding question answered first.

**3. A third party's name is in frame. I blurred it; I did not blur yours.**

The group window shows another player's character name in every frame. That is someone who has not
agreed to appear on a public site, so it is blurred — gaussian, sigma 9, invisible at playback
speed.

Still legible, and left alone deliberately: **the player character name and guild tag** on the
nameplate centre-frame, and **the pet name**. Those are the project owner's own identity, and
consenting to them is yours to do, not mine to assume. `ENCODE.md` carries the one-line filter
addition if you want them gone; it is a two-minute re-encode.

**4. CRF 32, not the precedent's CRF 28.**

Stated here rather than buried because the recipe is a precedent and I broke part of it. At CRF 28
this cut is 1489 KB, 57% over. Seven seconds of dense particle animation is the most expensive
thing you can hand H.264; denoise was tried first and returned almost nothing. The full CRF ladder
is measured in `ENCODE.md`. The fidelity cost is near zero because the image is upscaled from a
976x549 crop, so the quality ceiling is the crop, not the CRF. If holding CRF 28 matters more,
the same chain trimmed to ~4.3 s meets 949 KB and loses the before-state that makes the clip
readable without a caption. I recommend the arc; the trade is costed either way.

**5. The word count, and the ceiling.**

The band is **119 words**. The ceiling is 649 and `gate.py` fails at 689, so it needs raising to
**at least 768**, by hand, with the reason in the commit. Suggested commit wording is in
`COPY.md`, along with a cut-order if Session A would rather fight for less — the first cut saves
11 words and costs nothing but an ornamental clause.

I kept **every digit out of the copy**. That is not stylistic. It makes two of the three gate rules
structurally unable to fire: no figure can sit near a hedge word, and no number can fail to appear
literally on the page. It cost the roster count, the poll interval, and a literal release date —
all three sourced, all three tempting. There are no braces either.

---

### What I refused to claim

Two things I could have written, both of which would have read well and neither of which survives.

**"It never touches the network."** Nearly true and very tempting: zero network code in `src/`, no
updater, no crash reporter, no telemetry, and — checked directly — **no third-party runtime
dependency at all**, only Node built-ins and Electron. But it is an Electron app, and your own
`HANDOFF.md` records Windows raising a location-services alert traced to routine Chromium
behaviour. A flat "it never talks to the network" claims something about Chromium that the project
does not control. Cut.

**A roster size.** `CLAUDE.md` says the bundled roster is "~3300 entries". The actual
`src/shared/data/buffs.json` in this snapshot is **11,337 entries, every one uniquely named**. The
documentation is stale by roughly a factor of three. Neither figure is in the copy. **This is a
genuine defect in the Auras repo and wants fixing on its own account** — it is exactly the class of
thing the site withdrew a licence claim over.

The claim that *is* load-bearing, and the strongest in the set: **it does not read or write the
game's memory and puts no code inside the client.** That rests on an exhaustive negative over a
dependency-free tree, not on a reading. One honest caveat, which does not change the wording:
`foregroundWatcher.js` asks Windows every two seconds which process owns the foreground window, so
the overlay can hide itself when you alt-tab. That reads OS window state, not game memory, and
opens no handle to the game. `COPY.md` carries an optional twenty-two-word sentence for it if you
want it surfaced; my advice is to hold it for the release page and deploy it the moment anyone
asks.

---

### Three defects I noticed in passing, none of which block the band

- **A dark rectangle sits at the top right of every frame of the source recording.** Hard-edged,
  constant position, opaque, floating over the game world. Most likely one of the configured but
  empty widgets (Ally Buffs / Timer 1 / buff 2) drawing an opaque background — i.e. a rendering
  bug, not a recording artefact. It is cropped out of the deliverable, so the band is unaffected,
  but it would appear in any future footage.
- **Placeholder text is live in the settings UI**: the literal word "planned" sits where a value
  belongs beside three controls, "Not active yet." appears twice, and a roadmap sentence lives
  inside the sounds pane. Fine in a dev build, poor in a screenshot.
- **A test widget named "buff 2"** sits in the sidebar next to Self Buffs and Ally Buffs.

---

### One thing I could not do

**There is no git repository here, so I could not commit.** The working directory is not a repo and
the supplied ZIP contains no `.git` — only a `.gitignore`. The `HANDOFF.md` inside the ZIP is the
application's own session handoff and has no `## To the Director` section; I did not overwrite it.

So this file is that section, written as a file rather than a commit. Point me at the Auras repo
and I will land it properly in one step. Everything above is deliverable as-is in the meantime, and
Session A needs only `_media/`, `COPY.md` and `ENCODE.md` to wire the band.

*Session C, 2026-08-18.*
