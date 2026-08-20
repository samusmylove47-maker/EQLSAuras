# SPEC — Auras band, network sentence and generator source

**Session C → Session A. Spec first; no generator change until this is agreed.**
Written 18 August 2026. Verified against `LoxyBee/EQLS-Auras` at `baea785` and against
`samusmylove47-maker/eql-source` branch `claude/eq-map-export-proposal-oe8m6l`.

Session C does not write to eql-source. Everything below is for Session A to land.

---

## 1. Read this before touching `build1.py`

**`docs/auras/band.html:7` reads `<h2 class="feath">EQL Auras</h2>`.** Not "EQLS Auras" — a third
name variant, and a wrong one.

The generator currently emits the correct heading: `build1.py:368` renders
`<h2 class="feath">EQLS Auras</h2>`. So **switching the generator to read `band.html` — the ruled
fix — would silently regress the heading to a wrong product name.** The retyping that made
`build1.py` diverge is also the only reason the heading is currently right.

**Ordering is therefore load-bearing:**

1. fix `band.html` (three edits, below)
2. *then* point the generator at it
3. *then* retire the untrue comment at `build1.py:334-335`

Doing 2 before 1 publishes a wrong name. This is the whole reason for speccing first.

---

## 2. The three edits to `docs/auras/band.html`

### 2a. Heading — `band.html:7`

    - <h2 class="feath">EQL Auras</h2>
    + <h2 class="feath">EQLS Auras</h2>

The product is **EQLS Auras** on first mention, **Auras** after. It pronounces "Equals Auras" and
anchors the logo family =Auras, =50Upgrades, =SkyLedger. Settled; the owner overruled
"EQL Source Auras" and "EQL Auras" was never a candidate.

### 2b. The network sentence — `band.html`, the `featsub` paragraph

Replace:

> It does not read or alter the game's memory, inject code into it, or send it input. It makes no
> network requests of its own — no telemetry, no analytics, no update check.

With:

> It does not read or alter the game's memory, inject code into it, or send it input. It sends no
> telemetry, no analytics and no update check. It does fetch its typeface from Google when the main
> window opens, which tells Google your IP address each time you start it.

**What changed and why.** The umbrella clause "makes no network requests of its own" is the only
false part. The three specific clauses are true, were verified by symbol grep
(`CLAIMS.md:73-77`), and were then **dropped by the generator** — so the checkable half was
discarded and the unverifiable half is the half that broke. This restores the checkable half,
retires the umbrella, and states the one request the app actually makes.

The disclosure names the consequence, not just the mechanism. A reader deciding whether to run an
overlay is owed "Google learns your IP each launch", not "loads a webfont".

**Optional fourth clause**, ten more words, Session A's call:

> The overlay drawn over the game requests nothing at all.

Verified true — `src/renderer/overlay/` has no external references of any kind. It is worth
considering because the overlay is the part a cautious reader is actually worried about, and it is
the strongest true thing available on this subject.

### 2c. The date — `band.html`, the `featfoot` paragraph

    - Windows. Targeting next Tuesday's maintenance.
    + Windows. Not released yet.

Session C has said NO-GO for 25 August and the standing instruction is to print no date until that
changes. "Not released yet" carries no date to go stale.

---

## 3. Do NOT say the fetch is being removed

The Auras-sentence ruling says to state that the webfont fetch "is being removed". **The owner's
later ruling supersedes that**, and the wording above follows the later one:

> Self-hosting is offered, never required. [...] If she prefers the Google fetch, that is a
> complete answer and our page simply says so.

Writing "is being removed" on the page would commit Shara to a change she has not agreed to and has
every right to decline. The page states what the app does today. If she self-hosts, the clause
comes out; if she does not, it stays and remains true. Either way the page is accurate the whole
time and nothing is promised on her behalf.

---

## 4. Generator change

`build1.py:334-335` carries a comment claiming the band text is lifted from `band.html` rather than
retyped. It was retyped, and it diverged — in the heading, and by dropping three verified clauses.
**Make the generator read `band.html`, then delete the comment**, so the claim becomes structurally
true instead of aspirational.

Once it reads the file, `band.html` is the single source and this class of drift cannot recur.

---

## 5. Word count and gates

| | words |
|---|---|
| `featsub` today | 47 |
| `featsub` proposed | 72 |
| `featfoot` today | 5 |
| `featfoot` proposed | 4 |
| **net page delta** | **+24** |
| net delta if the optional overlay clause is taken | **+34** |

Session A raised the ceiling to 787 for its own rewrite. Confirm headroom before landing; if it is
short, the optional clause is the first thing to drop and the only ornamental one.

Gate compliance of the proposed text: **no digits, no braces, no exclamation marks**, British
spelling. The figure-near-hedge rule cannot fire because there are no figures. Any meta description
must stay digit-free unless the digit appears literally on the page.

---

## 6. What each clause maps to, so a gate can count it

Re-verified by Session C against `LoxyBee/EQLS-Auras` at `baea785` — not inherited from the earlier
`CLAIMS.md` pass, because the tree changed after that pass was taken.

| Clause | Check | Result at `baea785` |
|---|---|---|
| no telemetry | grep `telemetry` | absent |
| no analytics | grep `analytics`, `sentry`, `posthog`, `mixpanel` | absent |
| no update check | grep `autoUpdater`, `electron-updater` | absent |
| no crash reporting | grep `crashReporter` | absent |
| fetches typeface from Google | `index.html:13-15` | **present** — `preconnect` to
`fonts.googleapis.com` and `fonts.gstatic.com`, plus a stylesheet `link` |
| overlay requests nothing | external refs under `src/renderer/overlay/` | none |

The complete set of external hosts in the entire application tree is
`fonts.googleapis.com` and `fonts.gstatic.com`, in one file, main window only. That is the whole
of the exposure, and it is why the specific wording is safe to publish.

`preconnect` matters and is why "when the main window opens" is accurate rather than generous: the
connection is opened eagerly at load, before the stylesheet is needed.

---

## 7. Untouched

The rest of the band is correct and re-verified: the memory, injection and input clauses all hold
(no `SendInput`, `keybd_event`, `mouse_event`, `PostMessage`, `SetCursorPos` or `robotjs` anywhere;
`setIgnoreMouseEvents(..., { forward: true })` declines to capture clicks rather than sending any),
the WeakAuras credit stands, and the trailer caption "9s, silent" is accurate at 8.92 s with no
audio stream.
