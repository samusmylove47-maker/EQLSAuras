"""THE PARSER SEAM, v2 -- NO TRANSLITERATION. Each parser runs in its own runtime.

WHY THERE IS A v2, AND THE REASON IS WORSE THAN THE ONE I WAS OFFERED.

v1 (`scripts/parser-seam.js`) reported that Session E's engine counts the player hurting
themselves as damage output -- 571 Cannibalize lines. THAT FINDING WAS WRONG AND IS WITHDRAWN.
E's engine has the guard, at `gapengine.py:206`, and its comment names Cannibalize by name.

The reason offered to me was that transliterating an implementation preserves its patterns and
loses everything that is not one -- a guard on a separate line is not part of "the four patterns
and the match order", so it was never in the set of things being copied. That is a true and
useful law and it is NOT what happened here.

I COMPARED AGAINST THE WRONG FILE. I searched E's repository for names matching
parse|engine|damage, found `tools/parse.py`, could read its four regexes quickly, and called it
"Session E's engine". It is a 48-line ad-hoc script with no docstring. The engine is
`gapengine.py`, 793 lines, whose own first line reads "THE ENGINE, not the shape of its output."

A PERFECT TRANSLITERATION OF THE WRONG ARTIFACT WOULD HAVE PRODUCED THE SAME WRONG FINDING.
The selection error is upstream of the fidelity error. I wrote a careful paragraph bounding my
transliteration and no sentence at all establishing that the file I transliterated was the one I
was claiming to measure.

The `dot` label in v1 came from `tools/parse.py:32`. The string `dot` does not appear in
`gapengine.py` at all. So v1's "447 taxonomy divergences between Shara and E" were between
Shara and a side script neither party ships.

HOW v2 AVOIDS THE WHOLE CLASS: it does not translate anything.

  E's side     : `gapengine.py` IMPORTED AND EXECUTED, blob 27bbd0d1c5e6, unmodified.
                 Its own `_parse` and `_hits` decide its verdicts, guards included.
  Shara's side : her real `damageLines.js`, blob 0a97f0b6d35f, run under node in a
                 subprocess, emitting one verdict per line. Her code decides her verdicts.

AND ONE DEFECT THIS FILE ALREADY HAD, CAUGHT BEFORE PUBLISHING: the first version of the
comparison looked E's events up BY SHARA'S amount and target. When Shara returned nothing there
was no key to look up, so the "Shara sees nothing / E sees it" direction -- the exact direction v1
had reported -- could never be detected. A NONE from that harness was unfalsifiable in one
direction. Both sides are now built independently as multisets and differenced BOTH ways.

  SHARA_PARSER=<damageLines.js> EQ_GAPENGINE=<gapengine.py> python scripts/parser-seam-v2.py
"""
import glob
import importlib.util
import os
import re
import subprocess
import sys
import tempfile
from collections import Counter

PATTERNS = [
    r'C:\Users\Lindsey\Desktop\EQL Source\*.txt',
    r'C:\Users\Lindsey\Desktop\EQL Source\Spare Logs\*.txt',
    r'C:\Users\Lindsey\Desktop\eqlog_*.txt',
    r'C:\Users\Lindsey\Desktop\Cursor-eqls\state\logs\eqlog_Avenrae_*.txt',
]
SKIP = ('inventory', 'transcript', 'caveguide', 'brutalstatic')
STAMP = re.compile(r'^\[[^\]]+\]\s*')


def corpus():
    files, seen = [], set()
    for pat in PATTERNS:
        for f in glob.glob(pat):
            if any(k in os.path.basename(f).lower() for k in SKIP):
                continue
            try:
                with open(f, 'rb') as fh:
                    sig = (os.path.getsize(f), fh.read(65536))
            except OSError:
                continue
            if sig in seen:
                continue
            seen.add(sig)
            files.append(f)
    return files


NODE_SIDE = r'''
const fs = require('fs');
const { parseDamageLine } = require(process.argv[2]);
const lines = fs.readFileSync(process.argv[3], 'latin1').split('\n');
const out = [];
for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) { out.push(''); continue; }
  const r = parseDamageLine(lines[i]);
  out.push(r ? (r.kind + '\t' + r.amount + '\t' + r.target) : '');
}
fs.writeFileSync(process.argv[4], out.join('\n'), 'latin1');
'''


def main():
    shara = os.environ.get('SHARA_PARSER')
    engine = os.environ.get('EQ_GAPENGINE')
    if not shara or not os.path.exists(shara):
        print('Set SHARA_PARSER to an extracted copy of LoxyBee src/shared/damageLines.js')
        return 2
    if not engine or not os.path.exists(engine):
        print('Set EQ_GAPENGINE to an extracted copy of sky-ledger gapengine.py')
        return 2

    spec = importlib.util.spec_from_file_location('gapengine', engine)
    ge = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ge)
    src_text = open(engine, encoding='utf-8').read()
    print('E ENGINE IMPORTED : %s' % os.path.basename(engine))
    print("  emits kind 'dot'?: %s"
          % ('yes' if re.search(r"""['"]dot['"]""", src_text) else
             "NO -- v1's dot label came from tools/parse.py, not from the engine"))
    print('  SELF_TARGETS     : %s' % sorted(getattr(ge, 'SELF_TARGETS', set())))

    files = corpus()
    print('\nFILES OPENED: %d   (dedup: size + first 64KB)' % len(files))
    for f in files:
        print('    %s' % f)
    if not files:
        return 1

    tmpdir = tempfile.mkdtemp(prefix='seam2-')
    nodejs = os.path.join(tmpdir, 'side.js')
    with open(nodejs, 'w', encoding='utf-8') as fh:
        fh.write(NODE_SIDE)

    cell = Counter()
    example = {}
    self_seen = Counter()
    lines_total = inscope = 0
    e_events = s_events = 0

    for f in files:
        raw = open(f, 'r', encoding='latin-1').read().split('\n')
        lines_total += len(raw)

        src = os.path.join(tmpdir, 'in.txt')
        dst = os.path.join(tmpdir, 'out.txt')
        # newline='' is LOAD-BEARING on Windows. Python text mode rewrites the line
        # ending on write; node then sees a trailing carriage return on every line, and
        # every end-anchored pattern in Shara's parser fails. That produced
        # "Shara events: 0", which would have read as TOTAL disagreement between the two
        # parsers -- a spectacular false finding. It was caught only by the
        # both-sides-produced-events guard printed below, never by the comparison logic.
        with open(src, 'w', encoding='latin-1', newline='') as fh:
            fh.write('\n'.join(raw))
        subprocess.run(['node', nodejs, shara, src, dst], check=True)
        sv = open(dst, 'r', encoding='latin-1').read().split('\n')

        ev, kills, _m, _n = ge._parse(raw)
        hits = ge._hits(ev, kills)
        out = hits[0] if isinstance(hits, tuple) else hits
        selfhit = hits[2] if isinstance(hits, tuple) and len(hits) > 2 else {}
        for k, v in (selfhit or {}).items():
            self_seen[k] += v

        # --- E's side, built independently of Shara's ---
        e_ms, e_kind = Counter(), {}
        for h in out:
            key = (h.get('amt'), h.get('tgt'))
            e_ms[key] += 1
            e_kind.setdefault(key, h.get('kind'))
        e_events += sum(e_ms.values())

        # --- Shara's side, built independently of E's ---
        s_ms, s_kind, s_body = Counter(), {}, {}
        for i, line in enumerate(raw):
            if not line:
                continue
            body = STAMP.sub('', line)
            if not (body.startswith('You ') or ' from your ' in body):
                continue
            if ' points of ' not in body and ' has taken ' not in body:
                continue
            inscope += 1
            s = sv[i] if i < len(sv) else ''
            if not s:
                continue
            p = s.split('\t')
            key = (int(p[1]), p[2] if len(p) > 2 else None)
            s_ms[key] += 1
            s_kind.setdefault(key, p[0])
            s_body.setdefault(key, body[:114])
        s_events += sum(s_ms.values())

        for k, c in (s_ms - e_ms).items():
            key = '%s | none' % s_kind.get(k, '?')
            cell[key] += c
            example.setdefault(key, s_body.get(k, str(k)))
        for k, c in (e_ms - s_ms).items():
            key = 'none | %s' % e_kind.get(k, '?')
            cell[key] += c
            example.setdefault(key, 'amt=%s tgt=%s' % k)
        for k in (set(s_ms) & set(e_ms)):
            if s_kind.get(k) != e_kind.get(k):
                key = '%s | %s' % (s_kind.get(k), e_kind.get(k))
                cell[key] += min(s_ms[k], e_ms[k])
                example.setdefault(key, s_body.get(k, str(k)))

    print('\nLINES READ            : %d' % lines_total)
    print('IN-SCOPE FIRST-PERSON : %d' % inscope)
    print('\n=== BOTH SIDES PRODUCED EVENTS? (a zero here makes any NONE below meaningless) ===')
    print('  Shara events : %d' % s_events)
    print('  E events     : %d' % e_events)
    print("\n=== E'S OWN SELF-DAMAGE EXCLUSION COUNTER (its number, on this corpus) ===")
    for k, v in sorted(self_seen.items()):
        print('  %-16s %d' % (k, v))
    print('\n=== DISAGREEMENT MATRIX   shara | E ===')
    if not cell:
        print('  NONE -- and both sides produced events above, so this is agreement,')
        print('  not an empty harness.')
    for k, c in cell.most_common(12):
        print('  %-22s %8d' % (k, c))
        print('      e.g. %s' % example[k])
    return 0


if __name__ == '__main__':
    sys.exit(main())
