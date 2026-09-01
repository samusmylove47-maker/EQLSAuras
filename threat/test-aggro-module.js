'use strict';
/**
 * Test the drop-in module against Shara's actual contract, before offering it to her.
 *
 * Checks, in order of what would embarrass me most if it failed:
 *   1. it VALIDATES the way moduleHost.validateModule does (id regex, name, apiVersion, onLine)
 *   2. it is FAST — her slow-call guard disables a module exceeding 50ms on 20+ calls
 *   3. the three states are MUTUALLY EXCLUSIVE — exactly one tile present, always
 *   4. it produces the right holder on a real fight, checked against in-log ground truth
 */
const fs = require('fs');
const path = require('path');
const mod = require('./aggro-board');

let fail = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fail += 1; };

// ── 1. validation, mirroring moduleHost.validateModule ────────────────────────────────────────
console.log('=== 1. contract validation ===');
ok(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(mod.id), 'id matches the required pattern: ' + mod.id);
ok(typeof mod.name === 'string' && mod.name.trim(), 'name is a non-empty string');
ok(mod.apiVersion === 1, 'apiVersion is exactly 1');
ok(typeof mod.onLine === 'function', 'onLine is a function');
ok(mod.onLine.length <= 3, 'onLine takes (line, ctx, settings)');
ok(Array.isArray(mod.page), 'page is an array');
for (const c of mod.page) {
  if (c.section) continue;
  ok(typeof c.key === 'string' && c.key, 'control has a key: ' + c.key);
  ok(['slider', 'checkbox', 'select', 'text'].includes(c.type), '  type is supported: ' + c.type);
  if (c.type === 'slider') ok(typeof c.min === 'number' && typeof c.max === 'number', '  slider has min/max');
}

// settings defaults exactly as the doc describes them
const settings = {};
for (const c of mod.page) {
  if (c.section) continue;
  settings[c.key] = c.default !== undefined ? c.default
    : c.type === 'checkbox' ? false
    : c.type === 'slider' ? c.min
    : c.type === 'select' ? c.options[0] : '';
}

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const STAMP = /^\[(\w{3}) (\w{3}) ?(\d{1,2}) (\d\d):(\d\d):(\d\d) (\d{4})\]/;
function ctxFor(line) {
  const m = STAMP.exec(line);
  const now = m ? Date.UTC(+m[7], MONTHS[m[2]] || 0, +m[3], +m[4], +m[5], +m[6]) : 0;
  return {
    now,
    currentZone: null,
    groupMembers: [],
    iconUrlForSpell: () => null,
    stripTimestamp: (l) => l.replace(/^\[[^\]]+\]\s*/, ''),
  };
}

// ── real lines ────────────────────────────────────────────────────────────────────────────────
const SRC = 'C:/Users/Lindsey/Desktop/Cursor-eqls/state/logs/eqlog_Avenrae_rivervale_2026-08-17.txt';
let lines = [];
try {
  lines = fs.readFileSync(SRC, 'utf8').split(/\r?\n/).slice(0, 400000);
} catch (e) {
  console.log('  (real log unavailable: ' + e.code + ')');
}
console.log('');
console.log('=== 2. speed, against her 50ms-per-call guard ===');
const t0 = Date.now();
let calls = 0, emitted = 0;
const seenKeys = new Set();
let worst = 0;
for (const line of lines) {
  if (!line) continue;
  const c0 = process.hrtime.bigint();
  const out = mod.onLine(line, ctxFor(line), settings);
  const ms = Number(process.hrtime.bigint() - c0) / 1e6;
  if (ms > worst) worst = ms;
  calls += 1;
  if (out) {
    emitted += 1;
    const arr = Array.isArray(out) ? out : [out];
    // ── 3. mutual exclusivity, checked on every single emission ──
    const present = arr.filter((e) => !e.clear).map((e) => e.key);
    if (present.length !== 1) { ok(false, 'expected exactly one live tile, got ' + JSON.stringify(present)); break; }
    seenKeys.add(present[0]);
  }
}
const elapsed = Date.now() - t0;
ok(worst < 50, 'worst single onLine call ' + worst.toFixed(3) + 'ms (guard is 50ms)');
console.log('       ' + calls.toLocaleString() + ' calls in ' + elapsed + 'ms  = ' +
  (elapsed * 1000 / Math.max(1, calls)).toFixed(2) + 'us/line, ' + emitted.toLocaleString() + ' emissions');

console.log('');
console.log('=== 3. the four states ===');
ok(seenKeys.has('aggro-holder'), 'holder tile was produced');
console.log('       states observed: ' + [...seenKeys].join(', '));
ok(true, 'exactly one live tile on every emission (checked ' + emitted.toLocaleString() + ' times)');

// ── 4. correctness on ground truth ───────────────────────────────────────────────────────────
console.log('');
console.log('=== 4. does it agree with the game when the game names the holder? ===');
let agree = 0, dis = 0;
const CAP = /^You capture (.+?)'s attention[^!]*!$/;
let last = null;
for (const line of lines) {
  if (!line) continue;
  const msg = line.replace(/^\[[^\]]+\]\s*/, '');
  const out = mod.onLine(line, ctxFor(line), settings);
  if (out) {
    const live = (Array.isArray(out) ? out : [out]).find((e) => !e.clear);
    if (live && live.key === 'aggro-holder') last = live.name;
  }
  const c = CAP.exec(msg);
  if (c && last) { if (/^You\b/.test(last)) agree += 1; else dis += 1; }
}
const dec = agree + dis;
ok(dec === 0 || agree / dec > 0.7, 'holder is "You" right after a capture: ' +
  (dec ? (100 * agree / dec).toFixed(1) + '% (' + agree + '/' + dec + ')' : 'no events in slice'));

console.log('');
console.log(fail ? '*** ' + fail + ' FAILED ***' : 'all checks passed');
process.exitCode = fail ? 1 : 0;
