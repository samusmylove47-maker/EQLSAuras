# The CRLF / `$`-anchor defect class — swept across six repositories

**Session C, 6 September 2026.** Read-only across every repo. Pinned shas below.
Mechanical scan: `scripts/crlf-class-sweep.py`. **370 candidates, and the answer is that almost
all of them are noise — which is itself the finding.**

---

## THE SHORT VERSION

**Nothing in the estate is shipping wrong. The two real defects are both mine, both already known,
and one of them is a claim in my own documentation rather than in any code.**

| repo | candidates | verdict |
|---|---|---|
| **loxy** — Shara's shipped app | 133 | **CLEAN**, three independent correct handlings |
| **sky** — Session E | 6 | **CLEAN**, and the fix propagated beyond the engine |
| **lockouts** — Session D | 53 | clean on the log path |
| **src** — Session A, site + build | 10 | clean; one shape worth a guard |
| **ups** — Session B | 129 | clean; browser app, patterns never meet a file |
| **origin** — mine | 39 | **the only real instance, withdrawn 3 Sep** |

---

## 1. THE FINDING THAT MATTERS, AND IT IS AGAINST ME

**`docs/PARSER-SEAM.md` claimed: *"The guard that catches this is printing lines matched against
lines read, and v2 now does."* — V2 DID NOT.**

`scripts/parser-seam-v2.py` counted only `lines_total` and `inscope`. **There was no matched
counter anywhere in the file.** I documented a guard I had not written, in the same paragraph where
I criticised a tool for reporting a partial read as the whole. **Caught by an adversarial pass over
my own repository, not by me.**

**Fixed by writing the guard rather than deleting the sentence.** It now prints on every run, and
on the current corpus it reads **4,345,773 of 4,345,844 lines — 100.0%**.

**This is the house no-overclaim rule applied to my own prose.** A doc asserting a safeguard that
does not exist is worse than no doc, because the next reader stops looking.

## 2. THE GUARD I PROPOSED ESTATE-WIDE HAS A LIMIT I DID NOT STATE

**It catches the JavaScript failure mode and not the Python one.**

```
JS     the stamp itself fails      -> matched/read collapses  -> GUARD CATCHES IT
PYTHON `.` matches \r, stamp PASSES -> share_timestamped = 1.0 -> GUARD SEES NOTHING
       the \r rides inside the captured body and breaks the $-anchored patterns
       downstream: a healthy-looking coverage block over a report with no damage in it
```

**So "lines matched vs lines read" is not the general answer. The guard has to sit at the layer
that actually failed.** Session E has both: a timestamp-layer coverage block, and — the part that
catches the Python mode — **a parity test that writes real `\r\n` bytes and fails if either engine
returns nothing** (`bundle/parity.py:124-136`, run by `check.sh:285`). **That is the stronger
pattern and it is E's, not mine.**

## 3. SHARA'S SHIPPED APP IS CLEAN, AND SHE GOT THERE FIRST

`LoxyBee/EQLS-Auras@8da2cc88`. **Three independent correct handlings:**

- `logWatcher.js:165` splits `/\r\n|\n/` — the live tail, feeding every consumer
- `logSplitter.js:408` and `lockoutService.js:234` use `readline({crlfDelay: Infinity})`
- `logGroupPeek.js:107` does `.replace(/\r$/, '')`

**And `lockoutCore.js:230-240` documents the mechanism better than I did**, then adds a defensive
strip on top:

> *"the CR rides along inside `message` and every anchored shape regex below fails on its `$`. The
> line is dropped, `dropped.unstamped` is NOT incremented because the stamp parsed fine, and the
> module reports 'no lockouts, ever' with a clean diagnostic… **It has never bitten us only because
> `readline({crlfDelay: Infinity})` and the host's `split(/\r\n|\n/)` both strip CR first. That is
> luck, not design.**"*

**She reached "clean by accident, not by design" independently and days earlier, and then hardened
against it.** Her 116 anchored-regex candidates are all noise precisely because she handles CRLF
once, where lines are created, rather than defending in a hundred downstream patterns.

**One nuance the mechanical scan gets wrong:** `logRotation.js:265` splits on bare `\n`
**deliberately**, because it computes byte offsets (`off += s.length + 1`). The `\r` stays inside
`s.length` and the arithmetic is correct. **Switching it to a CRLF-aware split would introduce a
bug.** A scanner that flags `split('\n')` will always over-report here.

## 4. SESSION E PROPAGATED ITS FIX

`gapengine.py:180` carries `raw = raw.rstrip("\r\n")` with a 17-line comment naming the defect, and
the JS twin has it at `bundle/eqls-gap-engine.js:171-172`. **`verbcensus.py` — the only other tool
that binary-reads EQ logs and applies line regexes — strips CR at both parse sites** (`:62`,
`:102`) and its `STAMP` is prefix-only. The other binary reads are sha256 dedup, which must be
byte-exact and is correct.

## 5. ~~ONE THING WORTH A GUARD, NOT A FIX~~ — ⚠ REFUTED BY SESSION A, AND CORRECTLY

~~`_build/logstats.py` … writes `assets/measured.json` with no matched/read ratio recorded, so a
partial read would propagate into published figures with nothing to contradict it. Worth two
integers.~~ **Struck. I recommended a guard that cannot fail.**

**A measured it, control first.** `logstats.py:409` opens with
`open(path, encoding='utf-8', errors='replace')` — **text mode.**

```
CONTROL   8 of 13 staged logs ARE CRLF at byte level
          eqlog_Avenrae_rivervale.txt -> 428,680 CRLF pairs in its bytes
THEN      read through logstats.py's own call -> 428,682 lines,
          ZERO containing a carriage return
```

**So the Python variant I described cannot reach that call site: the CR is gone before any pattern
sees it.** And the consequence is the part that stings — **the two integers I recommended would
record 100% by construction. A check that cannot return its other answer.**

**That is my own `check_can_fail` guard pointed at my own recommendation, and my own sentence from
the image scan turned around: *a scanner that finds nothing and a scanner that cannot find
anything produce identical output.* A ran the control before the claim, which is the discipline I
had been recommending to other people.**

### What actually survives, and it is the better half

**The architecture stands: normalise at the boundary, do not defend pattern by pattern.**
`logstats.py` already does — **by accident of using text mode.** A marked it with Shara's own
words from `lockoutCore.js`: **that is luck, not design.**

**So the corrected recommendation is not two integers. It is one comment.** Text mode is
load-bearing at `logstats.py:409`, nothing in the file says so, and the day someone switches it to
`'rb'` for a hashing or seeking reason the parsers break silently. **Shara's fix for exactly this
was to write down that the safety was accidental and then harden anyway. That is the model, and a
ratio that is 100% by construction is not.**

**A did it in four minutes, and its reason is worth keeping:** *the answer took four minutes
precisely because the mechanism was named sharply enough to test.* **A vague "watch out for line
endings" cannot be refuted and therefore cannot be confirmed either.** That is the only part of my
original item I would defend.

## 6. A CORRECTION I OWE THE DIRECTOR

I said `/m` would not help because it does not make `.` match `\r`. **The premise is true and the
conclusion is wrong.** In JavaScript `\r` is itself a LineTerminator for the `$` assertion under
`/m`, so `/^…(.*)$/m` matches a `\r`-terminated line and returns a clean capture. Verified:

```
without /m : false
with    /m : true   "You slash a goblin for 100 points of damage."
```

**`/m` is a one-character fix for that pattern.** It is still not the fix I would choose — splitting
on `/\r?\n/` is better, because it also protects anything downstream that receives the raw line —
but nobody should be told `/m` is inert here.

---

*Session C, 6 September 2026. Pinned: origin `54bc3db9`, src `3661227a`, loxy `8da2cc88`,
lockouts `d77a0167`, ups `05904054`, sky `8863354b`. Read-only throughout; nothing was written to
any repository but my own.*
