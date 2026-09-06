'use strict';
/**
 * FIGURE GUARDS — the JavaScript twin of figure-guards.py. Standalone, no dependencies.
 *
 * FOR SESSION D, whose analysis tooling is JavaScript. F and A are Python and should take the
 * .py file instead.
 *
 *   noStrongerClaim(derived, source)   a derived figure may not out-rank its source
 *   rateHasVolume(num, denom)          a percentage without its population is not evidence
 *
 * THIS FILE HAS A TWIN AND THAT IS A HAZARD, SO IT IS TESTED AS ONE. Two implementations of one
 * rule drifting apart silently is the failure this estate keeps hitting — it is why a parser was
 * compared against the wrong file, and why a documented guard was believed to exist. So:
 *
 *   python figure-guards.py --parity
 *
 * runs BOTH over the same case table and fails unless every verdict is identical. If you change a
 * rule here, that command must still pass, or the two files have become two sources of truth.
 *
 *   node figure-guards.js             run the self-tests
 *   node figure-guards.js --verdicts  emit machine-readable verdicts for the parity check
 *
 * ONE DIALECT NOTE, because it cost this project a day: JavaScript's `.` does not match a
 * carriage return and `$` without /m matches only at end of input, so /^…(.*)$/ silently rejects
 * every line of a CRLF file. Python's `.` DOES match CR. If you ever port a REGEX between these
 * two files, that difference is not cosmetic.
 */

const PROVENANCE = ['refused', 'unknown', 'inferred', 'stated', 'measured'];
const RANK = new Map(PROVENANCE.map((n, i) => [n, i]));

class GuardFailure extends Error {
  constructor(message) {
    super(message);
    this.name = 'GuardFailure';
  }
}

function noStrongerClaim(derived, source, label = 'figure') {
  for (const [who, v] of [['derived', derived], ['source', source]]) {
    if (!RANK.has(v)) {
      throw new GuardFailure(
        `${label}: ${who} provenance ${JSON.stringify(v)} is outside the closed set ` +
        `${JSON.stringify(PROVENANCE)}. An unrecognised provenance is not a weak claim, ` +
        `it is an unchecked one.`);
    }
  }
  if (RANK.get(derived) > RANK.get(source)) {
    throw new GuardFailure(
      `${label}: published as ${JSON.stringify(derived)} from a source that is only ` +
      `${JSON.stringify(source)}. A derived figure cannot be more certain than what it came from.`);
  }
  return true;
}

function rateHasVolume(numerator, denominator, label = 'rate', minDenominator = 100) {
  if (numerator < 0 || denominator < 0) {
    throw new GuardFailure(`${label}: negative counts (${numerator}/${denominator})`);
  }
  if (denominator === 0) {
    throw new GuardFailure(
      `${label}: denominator is 0. An empty population and a population with no hits are not ` +
      `the same observation, and a rate cannot distinguish them.`);
  }
  if (numerator > denominator) {
    throw new GuardFailure(
      `${label}: ${numerator}/${denominator} — the numerator exceeds the denominator, so they ` +
      `are counting different populations. This is the shape that produced "70.7% of ALL shield ` +
      `damage" from a single shield type.`);
  }
  if (denominator < minDenominator) {
    throw new GuardFailure(
      `${label}: ${numerator}/${denominator} — a rate over ${denominator} observations is not ` +
      `evidence. Report the counts instead.`);
  }
  return numerator / denominator;
}

// The case table MUST stay in the same order as CASES in figure-guards.py.
const CASES = [
  ['no_stronger_claim / measured from stated', () => noStrongerClaim('measured', 'stated', 'roster'), true],
  ['no_stronger_claim / measured from inferred', () => noStrongerClaim('measured', 'inferred', 'zone name'), true],
  ['no_stronger_claim / provenance outside the set', () => noStrongerClaim('measured', 'probably', 'bad vocab'), true],
  ['no_stronger_claim / equal ranks', () => noStrongerClaim('stated', 'stated', 'quoted'), false],
  ['no_stronger_claim / honest downgrade', () => noStrongerClaim('inferred', 'measured', 'rounded'), false],
  ['rate_has_volume / 4 observations', () => rateHasVolume(3, 4, 'stranger test'), true],
  ['rate_has_volume / zero denominator', () => rateHasVolume(0, 0, 'empty'), true],
  ['rate_has_volume / numerator exceeds denominator', () => rateHasVolume(137017, 100000, 'mixed populations'), true],
  ['rate_has_volume / real population', () => rateHasVolume(139160, 235675, 'shield concentration'), false],
];

function verdicts() {
  return CASES.map(([name, fn]) => {
    try {
      fn();
      return `${name}=PASS`;
    } catch (e) {
      if (e instanceof GuardFailure) return `${name}=FAIL`;
      throw e;
    }
  });
}

function selftest() {
  let bad = 0;
  const rows = CASES.map(([name, fn, expectFail]) => {
    let ok;
    let note;
    try {
      fn();
      ok = !expectFail;
      note = ok ? 'passes on good input' : 'DID NOT FAIL — the guard is inert';
    } catch (e) {
      if (!(e instanceof GuardFailure)) throw e;
      ok = expectFail;
      note = ok ? 'FAILS as it should' : `wrongly failed: ${e.message}`;
    }
    if (!ok) bad++;
    return [name, ok, note];
  });
  const w = Math.max(...rows.map((r) => r[0].length));
  for (const [name, ok, note] of rows) {
    console.log(`  ${name.padEnd(w)}  ${ok ? 'ok ' : 'BAD'}  ${note}`);
  }
  console.log('');
  if (bad) {
    console.log(`  SELF-TEST FAILED: ${bad} of ${rows.length}.`);
    return 1;
  }
  console.log(`  SELF-TEST PASS: ${rows.length} checks, every guard SEEN to fail on input it ` +
              `should reject.`);
  return 0;
}

if (require.main === module) {
  if (process.argv.includes('--verdicts')) {
    console.log(verdicts().join('\n'));
    process.exit(0);
  }
  process.exit(selftest());
}

module.exports = { GuardFailure, noStrongerClaim, rateHasVolume, PROVENANCE };
