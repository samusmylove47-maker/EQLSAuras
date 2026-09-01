'use strict';
/**
 * SPLIT THE 467, per R75. It is a COVERAGE figure, not a validation one.
 *
 * 467 of 600 ground-truth events produced no board observation in a 30s window. Folding that into
 * accuracy would answer nothing. The two causes have OPPOSITE product consequences:
 *
 *   LEGITIMATE QUIET   the mob genuinely was not swinging -> the overlay owes the player a
 *                      STALENESS indicator, because the board being blank is the truth
 *   INSTRUMENT BLIND   the board could have seen it and did not -> fixable defect
 *
 * A PRIME SUSPECT OF MY OWN MAKING, tested first because it would invalidate the rest: I capped
 * `t.observations` at 4,000 entries with `splice(0, 2000)`, which DISCARDS THE OLDEST HALF. A
 * target with 14,277 recorded hits keeps only the most recent slice, so every early capture event
 * looks like "no observation" when the data was simply thrown away. That is an instrument that
 * cannot report what it deleted.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const core = require('./threatCore');

const DIRS = [
  'C:/Users/Lindsey/Desktop/EQL Source',
  'C:/Users/Lindsey/Desktop/EQL Source/Spare Logs',
  'C:/Users/Lindsey/Desktop',
  'C:/Users/Lindsey/Desktop/Cursor-eqls/state/logs',
];
const SKIP = /inventory|transcript|caveguide|brutalstatic/i;

const seen = new Map(); const files = [];
for (const d of DIRS) {
  let ns = []; try { ns = fs.readdirSync(d); } catch (e) { continue; }
  for (const n of ns) {
    if (!/^eqlog_.*\.txt$/i.test(n) || SKIP.test(n)) continue;
    const p = path.join(d, n); let sz;
    try { sz = fs.statSync(p).size; } catch (e) { continue; }
    const fd = fs.openSync(p, 'r'); const b = Buffer.alloc(Math.min(65536, sz));
    fs.readSync(fd, b, 0, b.length, 0); fs.closeSync(fd);
    const k = sz + ':' + crypto.createHash('sha1').update(b).digest('hex');
    if (seen.has(k)) continue;
    seen.set(k, p); files.push(p);
  }
}
// R75's control, adopted: a command that reads a FILE SET states the count it actually opened.
console.log('FILES OPENED: ' + files.length);

let mobNames = null;
try {
  const cat = JSON.parse(fs.readFileSync('C:/Users/Lindsey/AppData/Local/Temp/claude/C--Users-Lindsey-EQLS-Auras/2cc2d853-d38b-45a3-8d0f-3b2d5ce2406e/scratchpad/bis-catalog.json', 'utf8'));
  mobNames = new Set();
  for (const r of cat.records) {
    const s = r.src || {};
    for (const it of (Array.isArray(s) ? s : [s])) if (it && it.m)
      for (const nm of (Array.isArray(it.m) ? it.m : [it.m]))
        if (typeof nm === 'string' && nm.trim()) mobNames.add(core.normaliseName(nm));
  }
} catch (e) { console.log('catalogue not loaded'); }

let state = core.newState();
for (const f of files) {
  const self = (path.basename(f).match(/^eqlog_([A-Za-z]+)_/) || [])[1] || null;
  state = core.ingest(fs.readFileSync(f, 'utf8').split(/\r?\n/), { state, mobNames, self, now: 0 });
}

const fp = state.captures.filter((c) => c.person === 'first');
console.log('ground-truth events: ' + fp.length);
console.log('');

// Was the observations buffer truncated for any target a ground-truth event points at?
let truncated = 0, targetsHit = new Set();
for (const ev of fp) {
  const t = state.targets[core.targetKey(ev.target)];
  if (!t) continue;
  targetsHit.add(ev.target);
  const totalHits = Object.values(t.mobAttacks).reduce((a, b) => a + b, 0);
  if ((t.observations || []).length < totalHits) truncated += 1;
}
console.log('=== SUSPECT 1: my own ring buffer ===');
console.log('  ground-truth events whose target had its observation list TRUNCATED: ' +
  truncated + ' of ' + fp.length);
console.log('  (observations kept < mobAttacks total means splice(0,2000) discarded history)');
console.log('');

// Expanding-window census. If coverage saturates quickly, the 30s window was the constraint.
// If it stays flat, the mob genuinely was not swinging.
const WINDOWS = [5, 15, 30, 60, 120, 300, 900];
console.log('=== SUSPECT 2: was 30s simply too narrow? expanding-window census ===');
console.log('  %-9s %8s %8s %8s', 'window', 'hasObs', 'agree', 'disagree');
for (const w of WINDOWS) {
  let has = 0, ag = 0, dis = 0;
  for (const ev of fp) {
    const t = state.targets[core.targetKey(ev.target)];
    if (!t) continue;
    const obs = (t.observations || []).filter((e) => e.ms > ev.ms && e.ms <= ev.ms + w * 1000);
    if (!obs.length) continue;
    has += 1;
    if (obs[0].holder === ev.actor) ag += 1; else dis += 1;
  }
  console.log('  ' + String(w + 's').padEnd(9) + String(has).padStart(8) +
    String(ag).padStart(8) + String(dis).padStart(8) +
    '   ' + (has ? (100 * ag / has).toFixed(1) + '% agree' : ''));
}
console.log('');

// How many events point at a target the board never recorded at all?
let noTarget = 0, targetNoAttacks = 0;
for (const ev of fp) {
  const t = state.targets[core.targetKey(ev.target)];
  if (!t) { noTarget += 1; continue; }
  if (!Object.keys(t.mobAttacks).length) targetNoAttacks += 1;
}
console.log('=== SUSPECT 3: the target itself ===');
console.log('  events whose target the board never saw at all      : ' + noTarget);
console.log('  events whose target NEVER attacked anybody, ever    : ' + targetNoAttacks);
console.log('    ^ a mob that never swings is LEGITIMATE QUIET - the board is correctly blank,');
console.log('      and the overlay owes the player a staleness indicator rather than a fix.');
