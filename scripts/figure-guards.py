"""FIGURE GUARDS — standalone. Copy this file into your tree; it imports nothing but stdlib.

FOR D, F AND A, who all publish figures. Two rules, both learned expensively:

    no_stronger_claim(derived, source)   a derived figure may not out-rank its source
    rate_has_volume(num, denom)          a percentage without its population is not evidence

WHY THESE TWO. They are the predicates behind four separate incidents in one week:

  * "11,337 buffs" was recommended as a good promotional figure. It came from an ARCHIVED file
    that no shipped code loads and the installer does not contain. The live roster holds 1,067.
    A figure lifted from a stale source was republished as a current measurement -- overstating
    by 10.6x. That is `no_stronger_claim`.
  * A published concentration of "70.7% of ALL shield damage" was numerator and denominator both
    computed over ONE shield type and labelled as the whole family. The arithmetic was flawless.
    The true figure is 59.0%.
  * "4 observations" once rendered indistinguishably from "4,000" in a display, and a rank was
    read off it. That is `rate_has_volume`.
  * A band figure drifted from 53 to 56 while carrying a perfect provenance record naming its
    exact source file. A RECORDED SOURCE IS NOT A CHECK; that is the whole reason these are
    executable rather than a convention.

THE RULE THIS FILE ENFORCES ON ITSELF: each guard has a self-test that proves it CAN fail, and
each failing case is OBSERVED failing when you run it. A guard nobody has seen fail is not known
to work -- and a `check_can_fail`-shaped module that could not itself fail would be a joke.

    python figure-guards.py           run the self-tests
    python figure-guards.py --parity  also check the JS twin agrees, if node is present

IF YOU PORT THIS TO ANOTHER LANGUAGE, PORT THE PARITY TEST WITH IT. Two implementations of one
rule that drift apart silently is the exact failure this estate keeps hitting; a twin without a
parity check is a second source of truth wearing a disguise.
"""
import os
import subprocess
import sys

__all__ = ['GuardFailure', 'no_stronger_claim', 'rate_has_volume', 'PROVENANCE']

# Weakest to strongest. A figure may always claim LESS than its source.
PROVENANCE = ['refused', 'unknown', 'inferred', 'stated', 'measured']
_RANK = {name: i for i, name in enumerate(PROVENANCE)}


class GuardFailure(AssertionError):
    """Raised when a figure is not safe to publish as described."""


def no_stronger_claim(derived, source, label='figure'):
    """Fail if `derived` provenance out-ranks `source`.

    measured > stated > inferred > unknown > refused

    A number copied out of a document that calls itself "stated" does not become "measured" by
    being copied, and one read from an archived file does not become current by being quoted.
    """
    for who, v in (('derived', derived), ('source', source)):
        if v not in _RANK:
            raise GuardFailure(
                '%s: %s provenance %r is outside the closed set %s. An unrecognised provenance '
                'is not a weak claim, it is an unchecked one.' % (label, who, v, PROVENANCE))
    if _RANK[derived] > _RANK[source]:
        raise GuardFailure(
            '%s: published as %r from a source that is only %r. A derived figure cannot be more '
            'certain than what it came from.' % (label, derived, source))
    return True


def rate_has_volume(numerator, denominator, label='rate', min_denominator=100):
    """Fail if a rate is reported over too few observations to carry meaning.

    Returns the rate when it is safe to publish. Raise the population, report the raw counts,
    or say nothing -- but do not print the percentage.
    """
    if denominator < 0 or numerator < 0:
        raise GuardFailure('%s: negative counts (%s/%s)' % (label, numerator, denominator))
    if denominator == 0:
        raise GuardFailure(
            '%s: denominator is 0. An empty population and a population with no hits are not '
            'the same observation, and a rate cannot distinguish them.' % label)
    if numerator > denominator:
        raise GuardFailure(
            '%s: %d/%d — the numerator exceeds the denominator, so they are counting different '
            'populations. This is the shape that produced "70.7%% of ALL shield damage" from a '
            'single shield type.' % (label, numerator, denominator))
    if denominator < min_denominator:
        raise GuardFailure(
            '%s: %d/%d — a rate over %d observations is not evidence. Report the counts instead.'
            % (label, numerator, denominator, denominator))
    return numerator / denominator


# ── self-tests ─────────────────────────────────────────────────────────────────────────────────
CASES = [
    # (name, callable, expect_failure)
    ('no_stronger_claim / measured from stated',
     lambda: no_stronger_claim('measured', 'stated', 'roster'), True),
    ('no_stronger_claim / measured from inferred',
     lambda: no_stronger_claim('measured', 'inferred', 'zone name'), True),
    ('no_stronger_claim / provenance outside the set',
     lambda: no_stronger_claim('measured', 'probably', 'bad vocab'), True),
    ('no_stronger_claim / equal ranks',
     lambda: no_stronger_claim('stated', 'stated', 'quoted'), False),
    ('no_stronger_claim / honest downgrade',
     lambda: no_stronger_claim('inferred', 'measured', 'rounded'), False),
    ('rate_has_volume / 4 observations',
     lambda: rate_has_volume(3, 4, 'stranger test'), True),
    ('rate_has_volume / zero denominator',
     lambda: rate_has_volume(0, 0, 'empty'), True),
    ('rate_has_volume / numerator exceeds denominator',
     lambda: rate_has_volume(137017, 100000, 'mixed populations'), True),
    ('rate_has_volume / real population',
     lambda: rate_has_volume(139160, 235675, 'shield concentration'), False),
]


def _run():
    rows, bad = [], 0
    for name, fn, expect_fail in CASES:
        try:
            fn()
            ok = not expect_fail
            note = 'passes on good input' if ok else 'DID NOT FAIL — the guard is inert'
        except GuardFailure as e:
            ok = expect_fail
            note = 'FAILS as it should' if ok else 'wrongly failed: %s' % e
        rows.append((name, ok, note))
        if not ok:
            bad += 1
    w = max(len(r[0]) for r in rows)
    for name, ok, note in rows:
        print('  %-*s  %s  %s' % (w, name, 'ok ' if ok else 'BAD', note))
    print('')
    if bad:
        print('  SELF-TEST FAILED: %d of %d.' % (bad, len(rows)))
        return 1
    print('  SELF-TEST PASS: %d checks, every guard SEEN to fail on input it should reject.'
          % len(rows))
    return 0


def _parity():
    """Run the JS twin over the same cases and require identical verdicts.

    Shipping two implementations of one rule without this is how they drift.
    """
    twin = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'figure-guards.js')
    if not os.path.exists(twin):
        print('  PARITY SKIPPED: no figure-guards.js beside this file.')
        return 0
    try:
        out = subprocess.run(['node', twin, '--verdicts'], capture_output=True, text=True)
    except FileNotFoundError:
        print('  PARITY SKIPPED: node not on PATH. NOT the same as parity passing.')
        return 0
    if out.returncode != 0:
        print('  PARITY FAILED: the twin exited %d\n%s' % (out.returncode, out.stderr[:400]))
        return 1
    theirs = [l.strip() for l in out.stdout.splitlines() if l.strip()]
    mine = []
    for name, fn, _ in CASES:
        try:
            fn()
            mine.append('%s=PASS' % name)
        except GuardFailure:
            mine.append('%s=FAIL' % name)
    if len(theirs) != len(mine):
        print('  PARITY FAILED: twin reported %d verdicts, python has %d'
              % (len(theirs), len(mine)))
        return 1
    diff = [(a, b) for a, b in zip(mine, theirs) if a != b]
    if diff:
        print('  PARITY FAILED: %d verdicts disagree' % len(diff))
        for a, b in diff:
            print('    python %-58s   node %s' % (a, b))
        return 1
    print('  PARITY PASS: %d verdicts identical across python and node.' % len(mine))
    return 0


if __name__ == '__main__':
    rc = _run()
    if '--parity' in sys.argv:
        print('')
        rc = _parity() or rc
    sys.exit(rc)
