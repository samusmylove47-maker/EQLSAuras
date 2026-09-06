"""SETTLE THE 447: what emitted the `dot` label, and did my instrument invent a category?

THE QUESTION. scripts/parser-seam.js (v1, withdrawn) reported 447 lines where Shara's parser said
`spell` and "Session E" said `dot`, amounts agreeing 447/447. E's engine emits exactly two kinds,
`melee` and `spell`; the string `dot` appears nowhere in gapengine.py. So something produced 447
perfectly-agreeing rows under a label its supposed source never emits.

FOUR THINGS TO RULE IN OR OUT, and the fourth is the one that matters:
  1. Are the 447 rows real log lines, or did the comparison manufacture them?
  2. Does tools/parse.py really emit `dot`, i.e. is the label carried or invented?
  3. Does v1's JS emit `dot` anywhere except the branch transliterated from parse.py?
  4. v1 saw 25,030 in-scope lines; v2 saw 194,994 on the same corpus. WHY? If v1's stamp
     regex silently rejected most of the corpus, that is an instrument defect every future
     comparison built on it would inherit -- which is a worse finding than the label.

Read-only. Prints a control for every zero.

  python scripts/settle-447.py

BOUND ON THIS SCRIPT, AND IT IS THE ONE THAT MISLED ME. Its stamp check runs v1's JAVASCRIPT
regex in PYTHON, and the dialects differ on the character at issue: JS `.` does not match a
carriage return (it is a line terminator), Python `.` does. So this script reports every line as
matching v1's stamp, while v1 itself -- in node -- rejected every CRLF line. THE ANSWER CAME FROM
RUNNING IT IN NODE, not from here. Do not use a Python re-test to clear a JavaScript regex.
"""
import glob
import os
import re
import sys

PATTERNS = [
    r'C:\Users\Lindsey\Desktop\EQL Source\*.txt',
    r'C:\Users\Lindsey\Desktop\EQL Source\Spare Logs\*.txt',
    r'C:\Users\Lindsey\Desktop\eqlog_*.txt',
    r'C:\Users\Lindsey\Desktop\Cursor-eqls\state\logs\eqlog_Avenrae_*.txt',
]
SKIP = ('inventory', 'transcript', 'caveguide', 'brutalstatic')

# v1's stamp, transliterated from tools/parse.py:2 -- the suspect
V1_STAMP = re.compile(r'^\[(\w{3}) (\w{3}) +(\d+) (\d+):(\d+):(\d+) (\d+)\] (.*)$')
# v2's stamp -- permissive
V2_STAMP = re.compile(r'^\[[^\]]+\]\s*')
# the DoT shape both sides matched
DOT = re.compile(r'^(.+?) has taken ([\d,]+) damage from your (.+?)\.(.*)$')


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


def main():
    files = corpus()
    print('FILES OPENED: %d' % len(files))

    total = v1_ok = v2_ok = both = v2_only = 0
    dot_lines = 0
    v1_dot_visible = 0
    sample_v2_only = []

    for f in files:
        with open(f, 'r', encoding='latin-1') as fh:
            for raw in fh:
                line = raw.rstrip('\n')
                if not line:
                    continue
                total += 1
                a = V1_STAMP.match(line)
                b = V2_STAMP.match(line)
                if a:
                    v1_ok += 1
                if b:
                    v2_ok += 1
                if a and b:
                    both += 1
                elif b and not a:
                    v2_only += 1
                    if len(sample_v2_only) < 3:
                        sample_v2_only.append(line[:110])
                # DoT population, measured off the permissive stamp
                if b:
                    body = V2_STAMP.sub('', line)
                    if DOT.match(body):
                        dot_lines += 1
                        if a:
                            v1_dot_visible += 1

    print('LINES READ            : %d' % total)
    print('')
    print('=== 4. WHY DID v1 SEE 25,030 WHERE v2 SAW 194,994? ===')
    print('  lines v1 stamp matched : %d' % v1_ok)
    print('  lines v2 stamp matched : %d' % v2_ok)
    print('  matched by BOTH        : %d' % both)
    print('  v2 only (v1 REJECTED)  : %d   (%.1f%% of v2 matches)'
          % (v2_only, 100.0 * v2_only / v2_ok if v2_ok else 0))
    for s in sample_v2_only:
        print('      rejected e.g. %s' % s)
    if not sample_v2_only:
        print('      (no line matched v2 but not v1)')

    print('')
    print('=== 1. ARE THE 447 REAL LINES? the DoT population ===')
    print('  first-person DoT lines in corpus       : %d' % dot_lines)
    print('  of those, VISIBLE to v1 (stamp matched): %d' % v1_dot_visible)
    print('  v1 reported spell|dot cell             : 447')
    if v1_dot_visible:
        print('  447 as a share of what v1 could see    : %.1f%%'
              % (100.0 * 447 / v1_dot_visible))

    # control: the regexes must be capable of matching something
    probe = '[Wed Aug 26 01:19:21 2026] Fright has taken 394 damage from your Envenomed Bolt IV.'
    print('')
    print('=== CONTROL, synthetic line ===')
    print('  v1 stamp matches : %s' % bool(V1_STAMP.match(probe)))
    print('  v2 stamp matches : %s' % bool(V2_STAMP.match(probe)))
    print('  DOT matches body : %s' % bool(DOT.match(V2_STAMP.sub('', probe))))
    return 0


if __name__ == '__main__':
    sys.exit(main())
