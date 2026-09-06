"""GUARDS — four assertions about instruments, ported from a branch that will not merge.

PROVENANCE. These are the INTENT of four tests written on `session-c/feat-lockouts-wip`
(03bf9ac4, 30 Aug), which is a fork of Shara's application with no shared history with this repo.
The test files cannot travel here and should not; the ideas can. Their original subjects:

    03bf9ac4  "Three tests that passed against an inert splitter, and a guard measured by
               comment length"
    086c15d9  "A guard satisfied by its own comment is not a guard"
    28feac27  "Carry D's anti-constant ratchet across, and one of my own guards was asserting
               nothing"
    c3d0a0f0  "This file claimed 'measured' for a number the vendored module calls 'stated'"

WHY THEY ARE WORTH PORTING. Their common subject is A TEST THAT PASSES WHILE THE THING UNDER IT
DOES NOTHING. They were written on 30 August. On 5 September I wrote, in a document criticising a
tool for reporting a partial read as the whole, that a matched-vs-read guard existed in
`parser-seam-v2.py`. IT DID NOT. I had written the sentence describing the guard instead of the
guard, and an adversarial pass caught it rather than me.

    A DOCUMENTED GUARD IS NOT A GUARD, exactly as a recorded source is not a check.

Two of four published band figures drifted while carrying perfect provenance records. My guard was
perfectly described and absent. Same family, different artifact.

THE RULE THIS MODULE EXISTS TO ENFORCE ON ITSELF: every guard below has a self-test that proves it
CAN fail. A guard nobody has seen fail is not known to work — which is the whole point, and it
would be absurd to ship this file without it.

    python scripts/guards.py        run the self-tests
"""
import sys


class GuardFailure(AssertionError):
    """Raised when an instrument cannot be trusted to have measured what it claims."""


# ── 1 ──────────────────────────────────────────────────────────────────────────────────────────
# "Three tests that passed against an inert splitter."
# Generalised: an instrument that read a fraction of its corpus and reported the survivors as the
# whole. This is the guard I documented and did not write. The floor is deliberately not 1.0 --
# real corpora carry blank lines and partial tails -- but a 25% read must be impossible to miss.
def instrument_saw_the_corpus(read, matched, label, floor=0.90):
    """Fail unless the instrument matched at least `floor` of what it read.

    A 'did it produce any output' check does NOT catch this: parser-seam v1 produced a full,
    plausible disagreement matrix off 25% of the corpus. Only the RATIO catches it.
    """
    if read <= 0:
        raise GuardFailure('%s: read 0 lines. An empty read and a clean corpus are not the '
                           'same observation.' % label)
    ratio = matched / read
    if ratio < floor:
        raise GuardFailure(
            '%s: matched %d of %d lines = %.1f%%, below the %.0f%% floor. The instrument is '
            'reading part of the corpus and reporting the survivors as the whole.'
            % (label, matched, read, 100 * ratio, 100 * floor))
    return ratio


# ── 2 ──────────────────────────────────────────────────────────────────────────────────────────
# "A guard satisfied by its own comment is not a guard."
# The original measured a guard by its comment length, which is exactly as meaningful as it
# sounds. The port: prove a check FAILS on input it should reject, before trusting it to pass.
def check_can_fail(check, should_pass, should_fail, label):
    """Fail unless `check` accepts `should_pass` AND rejects `should_fail`.

    `check` returns truthy for accept. A check that returns truthy for everything is not a
    check, and a check nobody has seen reject anything is not known to reject anything.
    """
    if not check(should_pass):
        raise GuardFailure('%s: rejected input it should accept. The check is broken in the '
                           'direction that hides real data.' % label)
    if check(should_fail):
        raise GuardFailure('%s: ACCEPTED input it should reject. This check cannot fail, so its '
                           'passing tells you nothing.' % label)
    return True


# ── 3 ──────────────────────────────────────────────────────────────────────────────────────────
# "This file claimed 'measured' for a number the vendored module calls 'stated'", and
# "the rotation never claims a stronger provenance than the core."
# The port: a derived report may never assert more confidence than the source it derives from.
_RANK = {'refused': 0, 'unknown': 1, 'inferred': 2, 'stated': 3, 'measured': 4}


def no_stronger_claim(derived, source, label):
    """Fail if `derived` claims a stronger provenance than `source`.

    measured > stated > inferred > unknown > refused. A figure copied out of a file that calls
    itself 'stated' does not become 'measured' by being copied.
    """
    for name, v in (('derived', derived), ('source', source)):
        if v not in _RANK:
            raise GuardFailure('%s: %s provenance %r is outside the closed set %s'
                               % (label, name, v, sorted(_RANK, key=_RANK.get)))
    if _RANK[derived] > _RANK[source]:
        raise GuardFailure(
            '%s: reports %r from a source that is only %r. A derived figure cannot be more '
            'certain than what it came from.' % (label, derived, source))
    return True


# ── 4 ──────────────────────────────────────────────────────────────────────────────────────────
# "The same rate over enough lines is enough to accuse the parser", and its sibling, which
# required the rate to clear a threshold before it counted as evidence.
# The port: a rate is not a finding without the volume it was measured over.
def rate_has_volume(numerator, denominator, label, min_denominator=100):
    """Fail if a rate is reported over too few observations to mean anything.

    The stranger test: 4 observations once looked like 4,000. A percentage with no denominator
    beside it is the same failure wearing a different hat.
    """
    if denominator < min_denominator:
        raise GuardFailure(
            '%s: %d/%d — a rate over %d observations is not evidence. Report the counts, or '
            'raise the population, but do not publish the percentage.'
            % (label, numerator, denominator, denominator))
    return numerator / denominator


# ── self-tests ─────────────────────────────────────────────────────────────────────────────────
def _selftest():
    """Every guard must be SEEN to fail. A guard that has only ever passed proves nothing."""
    cases = []

    def expect_fail(fn, name):
        try:
            fn()
        except GuardFailure:
            cases.append((name, 'FAILS as it should', True))
            return
        cases.append((name, 'DID NOT FAIL — the guard is inert', False))

    def expect_pass(fn, name):
        try:
            fn()
            cases.append((name, 'passes on good input', True))
        except GuardFailure as e:
            cases.append((name, 'wrongly failed: %s' % e, False))

    # 1 — the real v1 numbers: 1,095,170 of 4,345,816
    expect_fail(lambda: instrument_saw_the_corpus(4345816, 1095170, 'parser-seam v1'),
                '1 instrument_saw_the_corpus / 25% read')
    expect_fail(lambda: instrument_saw_the_corpus(0, 0, 'empty'),
                '1 instrument_saw_the_corpus / zero read')
    expect_pass(lambda: instrument_saw_the_corpus(4345844, 4345773, 'parser-seam v2'),
                '1 instrument_saw_the_corpus / 100% read')

    # 2 — a check that accepts everything is the inert-splitter case
    expect_fail(lambda: check_can_fail(lambda x: True, 'good', 'bad', 'always-true check'),
                '2 check_can_fail / check that cannot reject')
    expect_fail(lambda: check_can_fail(lambda x: False, 'good', 'bad', 'always-false check'),
                '2 check_can_fail / check that cannot accept')
    expect_pass(lambda: check_can_fail(lambda x: x == 'good', 'good', 'bad', 'real check'),
                '2 check_can_fail / a real check')

    # 3 — the 11,337 case in provenance terms: a figure lifted from an archived file
    expect_fail(lambda: no_stronger_claim('measured', 'stated', 'roster figure'),
                '3 no_stronger_claim / measured from stated')
    expect_fail(lambda: no_stronger_claim('measured', 'nonsense', 'bad vocabulary'),
                '3 no_stronger_claim / provenance outside the closed set')
    expect_pass(lambda: no_stronger_claim('stated', 'measured', 'honest downgrade'),
                '3 no_stronger_claim / claiming less than the source')

    # 4 — the stranger test: 4 observations looked like 4,000
    expect_fail(lambda: rate_has_volume(3, 4, 'stranger test'),
                '4 rate_has_volume / rate over 4 observations')
    expect_pass(lambda: rate_has_volume(139160, 235675, 'damage-shield concentration'),
                '4 rate_has_volume / rate over a real population')

    width = max(len(c[0]) for c in cases)
    for name, msg, ok in cases:
        print('  %-*s  %s  %s' % (width, name, 'ok ' if ok else 'BAD', msg))
    bad = [c for c in cases if not c[2]]
    print('')
    if bad:
        print('  SELF-TEST FAILED: %d of %d. A guard that cannot fail is not a guard.'
              % (len(bad), len(cases)))
        return 1
    print('  SELF-TEST PASS: %d checks, and every guard was SEEN to fail on input it should '
          'reject.' % len(cases))
    return 0


if __name__ == '__main__':
    sys.exit(_selftest())
