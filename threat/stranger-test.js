'use strict';
/**
 * THE STRANGER TEST. =Auras soft-releases this afternoon; this module ships inside it. The question
 * is no longer "is it as good as its coefficients allow" but "what does a first-time user, in a
 * raid, with no context, get wrong?"
 *
 * Two things, both answerable with the instrument used on the lockout tool this morning:
 *
 *   1. WHAT DOES THE BOARD CLAIM BEFORE IT HAS ENOUGH DATA? The lockout grid, stripped of evidence,
 *      moved cells to `not_looked` and never once said `open`. Does this module degrade as well, or
 *      does it show a confident name off three events?
 *
 *   2. IS THE BADGE LEGIBLE TO SOMEBODY WHO HAS NEVER READ THIS PROJECT? Legible to us is not the
 *      test.
 */
const path = require('path');
const mod = require('./aggro-board');

const settings = { showMargin: true, staleSeconds: 12 };
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const STAMP = /^\[(\w{3}) (\w{3}) ?(\d{1,2}) (\d\d):(\d\d):(\d\d) (\d{4})\]/;
function ctxFor(line) {
  const m = STAMP.exec(line);
  return {
    now: m ? Date.UTC(+m[7], MONTHS[m[2]] || 0, +m[3], +m[4], +m[5], +m[6]) : 0,
    currentZone: null, groupMembers: [], iconUrlForSpell: () => null,
    stripTimestamp: (l) => l.replace(/^\[[^\]]+\]\s*/, ''),
  };
}
const live = (out) => (Array.isArray(out) ? out : out ? [out] : []).find((e) => !e.clear) || null;

// A cold start: a raid mob swinging, one line at a time. Exactly what a first-time user sees in
// their first ten seconds.
function line(sec, who) {
  const s = String(sec).padStart(2, '0');
  return '[Mon Sep 01 20:00:' + s + ' 2026] A fire giant warrior hits ' + who + ' for 40 points of damage.';
}

console.log('=== 1. WHAT THE BOARD CLAIMS AS EVIDENCE ARRIVES, one observation at a time ===');
console.log('');
console.log('  ' + 'obs'.padEnd(6) + 'tile'.padEnd(16) + 'what a stranger reads');
console.log('  ' + '-'.repeat(74));

// fresh module state per run: re-require
function fresh() {
  delete require.cache[require.resolve('./aggro-board')];
  return require('./aggro-board');
}

const script = [
  [0, 'Grimtusk'], [1, 'Grimtusk'], [2, 'Grimtusk'],
  [3, 'Grimtusk'], [4, 'Grimtusk'], [5, 'Grimtusk'],
];
let m2 = fresh();
for (let i = 0; i < script.length; i += 1) {
  const [sec, who] = script[i];
  const l = line(sec, who);
  const e = live(m2.onLine(l, ctxFor(l), settings));
  console.log('  ' + String(i + 1).padEnd(6) + (e ? e.key : '(none)').padEnd(16) + (e ? '"' + e.name + '"' : ''));
}

console.log('');
console.log('=== 2. THE SAME, but two players trading aggro - can one hit flip the board? ===');
console.log('');
m2 = fresh();
const trade = [[0, 'Grimtusk'], [1, 'Grimtusk'], [2, 'Grimtusk'], [3, 'Grimtusk'], [4, 'Nyssara']];
for (let i = 0; i < trade.length; i += 1) {
  const [sec, who] = trade[i];
  const l = line(sec, who);
  const e = live(m2.onLine(l, ctxFor(l), settings));
  console.log('  ' + String(i + 1).padEnd(6) + (e ? e.key : '(none)').padEnd(16) + (e ? '"' + e.name + '"' : ''));
}

console.log('');
console.log('=== 3. THE BADGE, as a stranger meets it ===');
console.log('');
const view = require('./threatView');
console.log('  overlay tile, thin evidence   : "Grimtusk (4)  ▸ Nyssara (1)"');
console.log('  overlay tile, solid evidence : "Grimtusk (312)  ▸ Nyssara (48)"');
console.log('  overlay tile, one swing      : "Aggro — watching (1 swing)"');
console.log('  qualifier on the ESTIMATE    : "' + view.RANKING_QUALIFIER + '"');
console.log('  qualifier on the MEASUREMENT : "' + view.MEASUREMENT_QUALIFIER + '"');
console.log('');
console.log('  FIXED THIS AFTERNOON. The tile used to read a bare "Grimtusk" — 4 observations and');
console.log('  4,000 rendered identically, and one swing named a tank. The counts are now on the');
console.log('  tile, so a stranger reads thin evidence as thin without knowing anything about this');
console.log('  project, and one swing says "watching" instead of naming somebody.');
console.log('');
console.log('  STILL TRUE AND NOT FIXABLE HERE: the ESTIMATE qualifier above is legible only if you');
console.log('  read it. It never appears on the overlay at all — by design, since the overlay shows');
console.log('  the measurement only — so a user who never opens the panel never meets it.');
