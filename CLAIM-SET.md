# Claim set — EQLS Auras landing band

Session C. Every factual assertion in the band copy, with what backs it. Adjudicate before ship.

Verification base: `EQLS Auras.zip`, `EQ tracker/` — newest file in the archive timestamped
2026-08-18 01:56. Line numbers are from that snapshot.

---

## Claims made in the copy

### C1 — It is a desktop overlay showing countdown timers for your own buffs, on top of the game

**Backing:** `package.json` description — "Reads your EverQuest log file and shows a transparent
overlay with countdown timers for your active buffs." Corroborated by `CLAUDE.md` line 3, and by
`widgetManager.js:84-104`, where the overlay window is created with `frame: false`,
`transparent: true`, `alwaysOnTop: true`, `skipTaskbar: true`, and
`setIgnoreMouseEvents(true, { forward: true })`.

**Status:** BACKED. "Click-through" and "always on top" are literal property values, not readings.

### C2 — It works by reading your log file

**Backing:** `logWatcher.js` tails the newest `eqlog_*.txt` in the Logs folder.
`POLL_INTERVAL_MS = 200` (line 5). Line 95 sets `this.offset = fs.statSync(filePath).size` with
the comment "start at end, don't replay history".

**Status:** BACKED. Also visible in the demo footage: the trigger field contains the literal log
line `You say, 'hi'`, that line appears in game chat, and the timer starts in the same frame.

### C3 — It also reads your spellbook file and the game's own icon art

**Backing:** `spellbookService.js` parses `<CharName>-<Class>-Spellbook.txt` from the EQ install
root. `iconExtractor.js:64-71` reads `Textures/Alternate N/SpellsNN.tga` from the install.
`eqLocator.js:55-60` uses `spells_us.txt` to locate the install directory.

**Status:** BACKED. **This claim is in the copy deliberately.** Saying only "it reads your log
file" would be incomplete, and the first reader to notice it opening their spellbook would be
right to call it an overclaim. The demo footage corroborates the icon half — the picker at ~3s is
a grid of authentic EQ spell-gem icons pulled from the user's own install.

### C4 — It does not read or write the game's memory, and puts no code inside the client

**Backing:** a negative result over a tree with nowhere to hide. Whole-tree grep across `src/` for
`ReadProcessMemory`, `WriteProcessMemory`, `OpenProcess`, `VirtualAlloc`, `CreateRemoteThread`,
`memoryjs`, `ffi-napi`, `koffi`, `robotjs` returns zero hits. Every `require()` in `src/main` and
`src/preload` resolves to a Node built-in (`child_process`, `crypto`, `events`, `fs`, `path`,
`readline`, `zlib`), to `electron`, or to a sibling file in the project. There is no third-party
runtime dependency in which such a call could hide: `package.json` declares `devDependencies`
only (`electron`, `electron-builder`) and has no `dependencies` block at all.

**Status:** BACKED, and this is the strongest claim in the set — exhaustive absence over a
dependency-free tree, not a reading.

**Caveat you should see before adjudicating.** The app does make one Win32 call.
`foregroundWatcher.js` runs an inline PowerShell `Add-Type` snippet on a two-second interval
calling `GetForegroundWindow()` and `GetWindowThreadProcessId()` from `user32.dll`, then
`Get-Process` on the returned PID, to learn whether the process named `eqgame` currently owns the
foreground window. This drives auto-hiding the overlay when the player alt-tabs away. It reads
**OS window state** and a process name; it opens no handle to the game process and reads no game
memory. The copy's wording stays exactly true. If you want it surfaced anyway, COPY.md carries an
optional sentence for it.

### C5 — Modelled on WeakAuras, the World of Warcraft addon

**Backing:** the WeakAuras2 repository describes itself as a "World of Warcraft addon that
provides a powerful framework to display customizable graphics on your screen."
<https://github.com/WeakAuras/WeakAuras2> — also <https://addons.wago.io/addons/weakauras>.

**Status:** BACKED.

### C6 — From-scratch implementation, not a port

**Backing:** structural, and checkable. WeakAuras is Lua running inside the WoW client's addon
API. This is an Electron/Node application in JavaScript that reads a text file on disk and draws
a separate OS window. There is no shared code path, no shared runtime, and no mechanism by which
WoW addon Lua could be ported to it. No WeakAuras source, asset, or configuration format appears
anywhere in the tree — grep returns zero hits for "weakaura" outside one supplied video filename.

**Status:** BACKED.

### C7 — Not affiliated with or endorsed by the WeakAuras authors

**Backing:** no contact, agreement, or endorsement exists. This is a disclaimer rather than a
discovery, and it is safe because it disclaims rather than claims.

**Status:** BACKED.

### C8 — Targeting next Tuesday's maintenance

**Backing:** none. This is an intention, not evidence.

**Status:** HEDGED BY CONSTRUCTION. The copy says "targeting", carries the qualifier in the same
sentence, and states outright that the date is a target rather than a promise. Per your
instruction the video is the evidence and leads; the date follows it and is never stated as fact.

**Note:** the copy names no calendar date. "Next Tuesday's maintenance" is relative to
publication, which is deliberate — a literal date would be a bare figure with no source behind it,
and would also collide with the numeric gate rules below.

### C9 — The video shows the current build

**Backing:** the recording was supplied as this session's demonstration asset, and its on-screen
behaviour matches features present in the snapshot source.

**Status:** BACKED, with an honest limit. "Current build" means the dev build at time of
recording. `HANDOFF.md` states plainly that the packaged installer predates recent work — "dev
build only, nothing shipped". The copy says the video is a recording of the build; it does not say
it is a recording of what you will download.

---

## Claims deliberately NOT made

- **No roster size.** `CLAUDE.md` says the bundled roster is "~3300 entries". The actual
  `src/shared/data/buffs.json` in this snapshot is a list of **11,337 entries, every one uniquely
  named**. The documentation is stale by roughly a factor of three. Neither figure goes in the
  copy. **This is a real defect in the Auras repo and wants fixing independently of the band.**
- **No "no network activity" claim.** Tempting, and nearly true — zero network code in `src/`, no
  `autoUpdater`, no `crashReporter`, no telemetry, no third-party runtime dependency. But the app
  is Electron, and `HANDOFF.md` records a real incident where Windows raised an "Electron is
  trying to access your location" alert, traced to routine Chromium/Windows Location Services
  interaction. A flat "it never talks to the network" would be an overclaim about Chromium
  behaviour the project does not control. Cut.
- **No accuracy or coverage claim.** Detection is a priority chain with documented failure modes
  (`CLAUDE.md` gotchas one through ten, several describing real misattribution bugs that shipped
  and were caught live). Nothing in the copy says the timers are always right.
- **No claim that the overlay is click-through, in the copy.** It is true and sourced (C1), but in
  the demo footage it is only *stated in the app's own helper text*, never demonstrated. It is in
  the copy as a property of the product, not as something the video proves.
- **No platform claim beyond Windows.** The build target is NSIS/Windows and `foregroundWatcher.js`
  shells to `powershell.exe`. The copy says Windows and stops.
- **No performance, download-size, or user-count figures.** None are measured.

---

## One contradiction you must rule on before this ships

The application calls itself **"EQ Buff Tracker"** on screen — in its own title bar, its sidebar
header, and its Windows taskbar button. `package.json` still carries
`"productName": "EQ Buff Tracker"`. The band copy calls it **EQLS Auras**.

If the footage shows any application chrome, the page will name the product one thing while the
video visibly names it another, on a site whose whole proposition is that it does not overclaim.

**How I have handled it:** the cut I recommend contains no application window, no title bar, and
no taskbar — only the game with the overlay drawn on top. The overlay itself carries no branding.
The contradiction therefore never reaches the screen, and no on-page disclaimer is needed. This
was a selection decision, not a cosmetic one, and it is the main reason for the recommended span.

---

## Gate-rule compliance

- **Numbers in a meta description must appear literally on the page** — the copy contains **no
  digits at all**. Any meta description Session A writes for the band must also avoid digits, or
  must reuse one that appears literally in the visible band text.
- **A flat figure within ~260 characters of a hedge word** — cannot fire. There are no figures.
  This is precisely why the roster count, the poll interval, and a literal release date are all
  kept out, even though all three are sourced and all three were tempting.
- **`{token}` reaching visible text** — the copy contains no braces of any kind.
- **British spelling** — "modelled", "recognise"-class forms checked. No American spellings.
- **No exclamation marks** — none.
