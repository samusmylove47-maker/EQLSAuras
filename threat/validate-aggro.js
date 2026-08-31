'use strict';
/**
 * VALIDATE THE AGGRO BOARD AGAINST GROUND TRUTH.
 *
 * The log contains a line where the GAME asserts who holds aggro:
 *
 *     "You capture <mob>'s attention!"        600 events, and it NAMES THE MOB
 *
 * At that instant the logging player is provably top of that mob's hate list. So for every one of
 * those events we can ask: does the aggro board, built purely from observed mob-attack lines,
 * agree? That is a measured accuracy figure for the product rather than an argument for it.
 *
 * Also present, and used as a second check:
 *     "You already have your target's attention."   192 events, mob NOT named
 *
 * DEDUP BY CONTENT, NOT BY NAME. Cursor-eqls/state/logs holds copies of Shara's logs under the
 * same and different names; keying on size+name let a copy through and inflated every count.
 * Hashing the first 64KB plus the size catches renamed duplicates.
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

function logs() {
  const out = [], seen = new Map();
  for (const d of DIRS) {
    let names = [];
    try { names = fs.readdirSync(d); } catch (e) { continue; }
    for (const n of names) {
      if (!/^eqlog_.*\.txt$/i.test(n) || SKIP.test(n)) continue;
      const p = path.join(d, n);
      let sz;
      try { sz = fs.statSync(p).size; } catch (e) { continue; }
      const fd = fs.openSync(p, 'r');
      const buf = Buffer.alloc(Math.min(65536, sz));
      fs.readSync(fd, buf, 0, buf.length, 0);
      fs.closeSync(fd);
      const key = sz + ':' + crypto.createHash('sha1').update(buf).digest('hex');
      if (seen.has(key)) { console.log('  DUPLICATE skipped: ' + n + '  (same content as ' + path.basename(seen.get(key)) + ')'); continue; }
      seen.set(key, p);
      out.push(p);
    }
  }
  return out;
}

let mobNames = null;
try {
  const cat = JSON.parse(fs.readFileSync('C:/Users/Lindsey/AppData/Local/Temp/claude/C--Users-Lindsey-EQLS-Auras/2cc2d853-d38b-45a3-8d0f-3b2d5ce2406e/scratchpad/bis-catalog.json', 'utf8'));
  mobNames = new Set();
  for (const r of cat.records) {
    const src = r.src || {};
    for (const it of (Array.isArray(src) ? src : [src])) {
      if (it && it.m) for (const nm of (Array.isArray(it.m) ? it.m : [it.m])) {
        if (typeof nm === 'string' && nm.trim()) mobNames.add(core.normaliseName(nm));
      }
    }
  }
} catch (e) { /* reported below */ }

const files = logs();
console.log('log files after content dedup: ' + files.length);

let state = core.newState();
for (const f of files) {
  // THE LOGGING CHARACTER'S NAME comes from the filename, eqlog_<Name>_<server>.txt, and MUST be
  // passed. Without it, `You` from Avenrae's log and `Avenrae` from Shara's log are two rows for
  // one person, and the board silently merges two vantage points.
  const self = (path.basename(f).match(/^eqlog_([A-Za-z]+)_/) || [])[1] || null;
  state = core.ingest(fs.readFileSync(f, 'utf8').split(/\r?\n/), { state, mobNames, self, now: 0 });
}
console.log('lines %s  parsed %s  unparsed-combat %s (%s%%)  captures %s (first-person %s)  top-of-hate %s',
  state.lines, state.parsed, state.unparsedCombat,
  (100 * state.unparsedCombat / Math.max(1, state.parsed + state.unparsedCombat)).toFixed(3),
  state.captures.length,
  state.captures.filter((c) => c.person === 'first').length,
  state.topOfHate.length);
console.log('');

/* ── THE VALIDATION ─────────────────────────────────────────────────────────────────────────────
 * For each first-person capture event (the game saying "You are now top of THIS mob's hate"),
 * look at the mob-attack observations for that same mob in the WINDOW BEFORE and AFTER, and ask
 * what the board would have said. */
const WINDOW = 30000;   // 30s either side

const firstPerson = state.captures.filter((c) => c.person === 'first');
let agree = 0, disagree = 0, noData = 0;
const disagreements = [];

for (const ev of firstPerson) {
  const t = state.targets[ev.target];
  if (!t) { noData += 1; continue; }
  // who was the mob observed attacking in the window AFTER the capture?
  // Use raw OBSERVATIONS, not the change-log: a steady-state hold logs no change event, and
  // reading the change-log alone reported 478 of 600 as "no data" that were really holds.
  const obs = (t.observations || []).filter((e) => e.ms > ev.ms && e.ms <= ev.ms + WINDOW);
  if (!obs.length) { noData += 1; continue; }
  const holder = obs[0].holder;
  if (holder === ev.actor) agree += 1;
  else {
    disagree += 1;
    if (disagreements.length < 8) disagreements.push({ target: ev.target, sawInstead: holder });
  }
}

console.log('=== VALIDATION: "You capture <mob>\'s attention!" vs what the board observed next ===');
console.log('  ground-truth events        : ' + firstPerson.length);
console.log('  board AGREED (next attack on You)   : ' + agree);
console.log('  board DISAGREED                     : ' + disagree);
console.log('  no observation in the window        : ' + noData);
const decided = agree + disagree;
if (decided) {
  console.log('  AGREEMENT WHERE THE BOARD HAD DATA  : ' + (100 * agree / decided).toFixed(1) + '%'
    + '   (' + agree + '/' + decided + ')');
}
console.log('');
console.log('  NOTE ON THE DENOMINATOR: `no observation` is not a failure of the board, it is the');
console.log('  mob not swinging within ' + (WINDOW / 1000) + 's. It is reported separately rather than folded in,');
console.log('  because folding it either way would flatter or damn the result without evidence.');
if (disagreements.length) {
  console.log('');
  console.log('  sample disagreements (board saw someone else attacked next):');
  for (const d of disagreements) console.log('    ' + d.target + '  ->  ' + d.sawInstead);
}
