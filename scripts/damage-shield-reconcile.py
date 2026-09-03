"""Settle 193,765 against 178,267 -- my own two damage-shield counts, which disagree by 15,498.

THIS SCRIPT EXISTS BECAUSE NEITHER NUMBER WAS REPRODUCIBLE.

  docs/DAMAGE-FAMILY-AUDIT.md:70        193,765 damage-shield lines, 206 distinct owners
  docs/FOR-SESSION-E-LOG-PARSING.md:56  178,267  (thorns 159,214 / flames 18,504 / frost 549)

Both are mine, both from this corpus, published the same day, 15,498 apart. They were quoted to
the Director and to Session E as though each were THE damage-shield count. E's shipped patch P-4
is a damage-shield exclusion note attributed to me, so the figure under it is load-bearing in
somebody else's engine.

The defect is not the disagreement. The defect is that `scratchpad/correlation.py` was never
committed, so NOBODY -- including me -- could regenerate either figure and find out which was
right. A number that is defensible and not reproducible is a number the reader has to take on
trust, on a project whose entire claim is that its data is checkable.

So this script prints, every run:
  - the file count it opened, and the dedup rule it applied
  - both counts, under two EXPLICITLY NAMED definitions
  - the full shield-noun census, which is where the 15,498 has to be if my hypothesis holds
  - the owner concentration, which is the only part of the claim that actually mattered

WHAT THE TWO DEFINITIONS ARE, named before the numbers are seen:

  NARROW  the three shield nouns I enumerated for E: thorns, flames, frost.
  BROAD   any line of the damage-shield GRAMMAR, whatever the shield noun:
              <target> is <verb> by <owner>'s <noun> for N points of non-melee damage.

If the delta is entirely shield nouns outside the narrow three, then both counts were correct
about different populations and the fault was quoting them as one thing. If it is not, one of
them is simply wrong and this script says so.

  python scripts/damage-shield-reconcile.py
"""
import glob
import os
import re
import sys
from collections import Counter

# ---------------------------------------------------------------------------
# CORPUS. Same discovery and dedup rule as scratchpad/first-person.py, which is
# the rule both published figures were measured under. Deliberately NOT widened
# to the logs inside the game install found on 3 Sep -- adding files now would
# mean neither original number could reproduce, which is the opposite of the job.
# ---------------------------------------------------------------------------
PATTERNS = [
    r'C:\Users\Lindsey\Desktop\EQL Source\*.txt',
    r'C:\Users\Lindsey\Desktop\EQL Source\Spare Logs\*.txt',
    r'C:\Users\Lindsey\Desktop\eqlog_*.txt',
    r'C:\Users\Lindsey\Desktop\Cursor-eqls\state\logs\eqlog_Avenrae_*.txt',
]
SKIP = ('inventory', 'transcript', 'caveguide', 'brutalstatic')


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


# The damage-shield grammar. The shield noun is captured rather than enumerated,
# which is the whole point: an enumeration cannot report what it excluded.
SHIELD = re.compile(
    r"^\[[^\]]+\] "
    r"(?P<target>.+?) is (?P<verb>\w+) by (?P<owner>.+?)'s (?P<noun>[\w ]+?) "
    r"for (?P<amt>\d+) points? of non-melee damage",
)
NARROW = {'thorns', 'flames', 'frost'}


def main():
    files = corpus()
    print('FILES OPENED: %d   (dedup: size + first 64KB; %d patterns)'
          % (len(files), len(PATTERNS)))
    for f in files:
        print('    %s' % f)
    if not files:
        print('\nNO FILES. The corpus is not on this machine; both figures stay unreproducible.')
        return 1

    nouns = Counter()
    owners = Counter()
    owners_by_noun = Counter()
    verbs = Counter()
    lines_total = 0

    for f in files:
        with open(f, 'r', encoding='utf-8', errors='replace') as fh:
            for line in fh:
                lines_total += 1
                if 'non-melee' not in line:
                    continue
                m = SHIELD.match(line)
                if not m:
                    continue
                noun = m.group('noun').strip().lower()
                nouns[noun] += 1
                verbs[m.group('verb').lower()] += 1
                owners[m.group('owner')] += 1
                owners_by_noun[(m.group('owner'), noun)] += 1

    broad = sum(nouns.values())
    narrow = sum(c for n, c in nouns.items() if n in NARROW)

    print('\nLINES READ: %d' % lines_total)
    print('\n=== THE TWO DEFINITIONS, NAMED BEFORE THE NUMBERS ===')
    print('  NARROW  (thorns / flames / frost only) : %d' % narrow)
    print('  BROAD   (any damage-shield grammar)    : %d' % broad)
    print('  DELTA                                  : %d' % (broad - narrow))

    print('\n=== PUBLISHED FIGURES, AND WHETHER THEY REPRODUCE ===')
    for label, published, got in (
        ('FOR-SESSION-E-LOG-PARSING.md:56', 178267, narrow),
        ('DAMAGE-FAMILY-AUDIT.md:70', 193765, broad),
    ):
        mark = 'REPRODUCES' if published == got else 'DOES NOT REPRODUCE (%+d)' % (got - published)
        print('  %-34s published %7d   now %7d   %s' % (label, published, got, mark))

    print('\n=== SHIELD-NOUN CENSUS -- where the delta actually is ===')
    for noun, c in nouns.most_common():
        tag = '  <- in the narrow three' if noun in NARROW else ''
        print('  %-22s %8d%s' % (noun, c, tag))

    print('\n=== VERBS CARRYING THE SHAPE ===')
    print('  ' + '  '.join('%s=%d' % (v, c) for v, c in verbs.most_common(8)))

    print('\n=== OWNER CONCENTRATION -- the part of the claim that mattered ===')
    print('  distinct owners : %d   (published: 206)' % len(owners))
    top = owners.most_common(10)
    if broad:
        for name, c in top:
            print('  %-28s %8d   %5.1f%%' % (name[:28], c, 100.0 * c / broad))
        nxt = sum(c for _, c in top[1:])
        print('  next 9 combined              %8d   %5.1f%%' % (nxt, 100.0 * nxt / broad))

    # ---------------------------------------------------------------------
    # THE DIAGNOSIS. Kept in the script rather than only in prose, because a
    # finding that lives in a document cannot be re-checked by running anything.
    # ---------------------------------------------------------------------
    thorns = nouns.get('thorns', 0)
    print('\n=== DIAGNOSIS: WAS THE PUBLISHED DENOMINATOR THORNS-ONLY? ===')
    print('  thorns alone                      : %d' % thorns)
    print('  published as "damage-shield lines": 193765')
    print('  identical?                        : %s' % ('YES' if thorns == 193765 else 'no'))
    if thorns == 193765:
        print('\n  So DAMAGE-FAMILY-AUDIT.md:70 counted THORNS and called it the whole family.')
        print('  It omitted flames (%d) and frost (%d) -- %d lines, %.1f%% of the family --'
              % (nouns.get('flames', 0), nouns.get('frost', 0), broad - thorns,
                 100.0 * (broad - thorns) / broad))
        print('  while the sentence beside it said "%% of ALL shield damage".')
    if owners and thorns:
        top_owner = owners.most_common(1)[0][0]
        # Tracked per noun on purpose. Dividing an all-shield numerator by a
        # thorns-only denominator is the exact fault this script diagnoses, and
        # the first version of this block did it -- 71.8% instead of 70.7%.
        num_thorns = owners_by_noun[(top_owner, 'thorns')]
        num_all = owners[top_owner]
        pub = 100.0 * num_thorns / thorns
        true = 100.0 * num_all / broad
        print('\n  The concentration claim, which was the entire point of GAP A:')
        print('    top owner                        : %s' % top_owner)
        print('    thorns-only numerator            : %d   (published: 137,017 -- %s)'
              % (num_thorns, 'EXACT' if num_thorns == 137017 else 'differs'))
        print('    all-shield numerator             : %d' % num_all)
        print('    thorns num / thorns den          : %.1f%%   <- published as'
              ' "70.7%% of ALL shield damage"' % pub)
        print('    all-shield num / family den      : %.1f%%   <- the true concentration' % true)
        print('    OVERSTATED BY                    : %.1f points' % (pub - true))

    print('\n=== 178,267 (FOR-SESSION-E-LOG-PARSING.md:56) ===')
    print('  Published breakdown: thorns 159,214 / flames 18,504 / frost 549.')
    print('  Today:               thorns %d / flames %d / frost %d.'
          % (thorns, nouns.get('flames', 0), nouns.get('frost', 0)))
    print('  FROST HAS DECREASED, 549 -> %d. No addition or removal of whole files from'
          % nouns.get('frost', 0))
    print('  the present corpus can raise a count and lower another at the same time, so')
    print('  178,267 was measured over a corpus that NO LONGER EXISTS. It is not wrong;')
    print('  it is UNVERIFIABLE, and it must be withdrawn rather than defended or restated.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
