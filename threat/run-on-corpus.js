'use strict';
/**
 * Drive threatCore over the real corpus and print aggro boards for the biggest fights.
 * Not a test — a demonstration that the engine produces sensible output on real data.
 * `node threat/run-on-corpus.js [targetSubstring]`
 */
const fs = require('fs');
const path = require('path');
const core = require('./threatCore');
const pad = (s, n) => (String(s) + ' '.repeat(n)).slice(0, n);

const DIRS = [
  'C:/Users/Lindsey/Desktop/EQL Source',
  'C:/Users/Lindsey/Desktop/EQL Source/Spare Logs',
  'C:/Users/Lindsey/Desktop',
  'C:/Users/Lindsey/Desktop/Cursor-eqls/state/logs',
];
const SKIP = /inventory|transcript|caveguide|brutalstatic/i;

function logs() {
  const out = [], seen = new Set();
  for (const d of DIRS) {
    let names = [];
    try { names = fs.readdirSync(d); } catch (e) { continue; }
    for (const n of names) {
      if (!/^eqlog_.*\.txt$/i.test(n) || SKIP.test(n)) continue;
      const p = path.join(d, n);
      let sz;
      try { sz = fs.statSync(p).size; } catch (e) { continue; }
      const key = sz + ':' + n;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

// mob names from B's published catalogue, if present
let mobNames = null;
const catPath = 'C:/Users/Lindsey/AppData/Local/Temp/claude/C--Users-Lindsey-EQLS-Auras/2cc2d853-d38b-45a3-8d0f-3b2d5ce2406e/scratchpad/bis-catalog.json';
try {
  const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  mobNames = new Set();
  for (const r of cat.records) {
    const src = r.src || {};
    for (const it of (Array.isArray(src) ? src : [src])) {
      if (it && it.m) for (const nm of (Array.isArray(it.m) ? it.m : [it.m])) {
        if (typeof nm === 'string' && nm.trim()) mobNames.add(core.normaliseName(nm));
      }
    }
  }
  console.log('catalogue mob names loaded: ' + mobNames.size);
} catch (e) {
  console.log('catalogue NOT loaded (' + e.code + ') — actor identity will be weaker, and says so');
}

const files = logs();
console.log('log files: ' + files.length);

let state = core.newState();
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  state = core.ingest(lines, { state, mobNames, now: 0 });
}

console.log('lines ' + state.lines + '  parsed ' + state.parsed +
  '  UNPARSED-COMBAT ' + state.unparsedCombat + ' (' +
  (100 * state.unparsedCombat / Math.max(1, state.parsed + state.unparsedCombat)).toFixed(3) +
  '% of combat lines)  non-combat ' + state.nonCombat);

console.log('capture events: ' + state.captures.length + '  (first-person ' +
  state.captures.filter(function (c) { return c.person === 'first'; }).length + ')' +
  '   top-of-hate ground truth: ' + state.topOfHate.length);
console.log('');

const filter = process.argv[2];
const ranked = Object.values(state.targets)
  .map((t) => ({ t, obs: Object.values(t.mobAttacks).reduce((a, b) => a + b, 0) }))
  .filter((x) => x.obs >= 20)
  .filter((x) => !filter || x.t.name.toLowerCase().includes(filter.toLowerCase()))
  .sort((a, b) => b.obs - a.obs)
  .slice(0, 6);

console.log('=== AGGRO BOARDS — top targets by observed mob-attack events ===');
for (const { t } of ranked) {
  const b = core.aggroBoard(state, t.name, { mobNames });
  console.log('');
  console.log('  ' + b.target + '   observations=' + b.observations +
    '  switches=' + b.switches + '  captures=' + b.captures);
  for (const r of b.rows.slice(0, 4)) {
    console.log('    ' + (r.who === b.holder ? '>' : ' ') + pad(r.who, 24) +
      String(r.hits).padStart(7) + ' hits   [' + r.identity + ']');
  }
  const est = core.threatEstimate(state, t.name, { mobNames });
  if (est && est.rows.length) {
    console.log('     -- threat ESTIMATE (badged, damage only, coefficient unmeasured) --');
    for (const r of est.rows.slice(0, 4)) {
      console.log('      ' + pad(r.who, 24) + String(r.damage).padStart(11) + ' dmg   [' + r.identity + ']');
    }
  }
}
