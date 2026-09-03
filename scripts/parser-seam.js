'use strict';
/**
 * THE PARSER SEAM — where Shara's `damageLines.js` and Session E's engine already disagree.
 *
 * MEASUREMENT ONLY. Nothing here merges the parsers, proposes a merge, or widens a regex. The
 * standing order against widening a damage regex is discharged for E and does NOT extend to
 * Shara's parser or to any merge across the three. My own parser is benched with the aggro board
 * and is deliberately not in this comparison.
 *
 * WHY THIS EXISTS. Three parsers read the same log lines — Shara's shipped one, E's engine, and
 * mine. Nobody owns the seam between them. Two of the three are live and about to diverge with
 * nobody watching, and a divergence between two parsers is invisible from inside either one.
 *
 * FIDELITY, because a comparison is only worth what its fidelity is worth:
 *
 *   SHARA'S SIDE is her ACTUAL FILE, required unmodified —
 *   LoxyBee/EQLS-Auras@3a4d119c : src/shared/damageLines.js, blob 0a97f0b6d35f.
 *   Not a transcription. Her code decides her verdicts.
 *
 *   E'S SIDE IS TRANSLITERATED, and that is a real limitation I am not hiding. E's parser is
 *   Python (sky-ledger@1a6654f7 : tools/parse.py) and its four patterns are reproduced here
 *   verbatim. They use only constructs that mean the same thing in both dialects — \w, .+?,
 *   [\d,]+, non-greedy groups — so the translation is faithful, but it IS a translation and any
 *   finding that turns on regex-dialect subtleties should be re-checked against E's own runtime.
 *
 * THE SCOPE ASYMMETRY IS BY DESIGN, NOT A DEFECT. E's engine is ^You-anchored: it measures the
 * logging player's own damage, because it is a personal DPS meter. Shara's is all-actor. So
 * "E does not see Valestia's swing" is E working correctly, and this script does NOT report it as
 * a disagreement. It reports the FIRST-PERSON population, where both parsers are in scope and a
 * difference is a real difference.
 *
 *   node scripts/parser-seam.js
 */
const fs = require('fs');
const path = require('path');

const SHARA = process.env.SHARA_PARSER;
if (!SHARA || !fs.existsSync(SHARA)) {
  console.error('Set SHARA_PARSER to an extracted copy of LoxyBee src/shared/damageLines.js');
  process.exit(2);
}
const { parseDamageLine } = require(SHARA);

// ── E's four patterns, sky-ledger@1a6654f7 : tools/parse.py lines 5-10, verbatim ──────────────
const E_HIT = /^You (\w+) (.+?) for ([\d,]+) points? of damage\.(.*)$/;
const E_SPL = /^You (?:hit )?(.+?) for ([\d,]+) points? of (\w+) damage by (.+?)\.(.*)$/;
const E_DOT = /^(.+?) has taken ([\d,]+) damage from your (.+?)\.(.*)$/;
const E_STAMP = /^\[(\w{3}) (\w{3}) +(\d+) (\d+):(\d+):(\d+) (\d+)\] (.*)$/;

// E tries SPL, then HIT, then DOT — order matters and is preserved.
function eParse(body) {
  let m = E_SPL.exec(body);
  if (m && body.includes('points of') && body.includes(' damage by ')) {
    return { kind: 'spell', amount: Number(m[2].replace(/,/g, '')), tag: m[4] };
  }
  m = E_HIT.exec(body);
  if (m) return { kind: 'melee', amount: Number(m[3].replace(/,/g, '')), tag: m[1] };
  m = E_DOT.exec(body);
  if (m) return { kind: 'dot', amount: Number(m[2].replace(/,/g, '')), tag: m[3] };
  return null;
}

// ── corpus: same discovery and dedup rule as scripts/damage-shield-reconcile.py ───────────────
const DIRS = [
  ['C:/Users/Lindsey/Desktop/EQL Source', /\.txt$/i],
  ['C:/Users/Lindsey/Desktop/EQL Source/Spare Logs', /\.txt$/i],
  ['C:/Users/Lindsey/Desktop', /^eqlog_.*\.txt$/i],
  ['C:/Users/Lindsey/Desktop/Cursor-eqls/state/logs', /^eqlog_Avenrae_.*\.txt$/i],
];
const SKIP = ['inventory', 'transcript', 'caveguide', 'brutalstatic'];

function corpus() {
  const files = [];
  const seen = new Set();
  for (const [dir, rx] of DIRS) {
    let names = [];
    try { names = fs.readdirSync(dir); } catch (e) { continue; }
    for (const n of names) {
      if (!rx.test(n)) continue;
      if (SKIP.some((k) => n.toLowerCase().includes(k))) continue;
      const p = path.join(dir, n);
      let st;
      try { st = fs.statSync(p); } catch (e) { continue; }
      if (!st.isFile()) continue;
      const fd = fs.openSync(p, 'r');
      const buf = Buffer.alloc(Math.min(65536, st.size));
      fs.readSync(fd, buf, 0, buf.length, 0);
      fs.closeSync(fd);
      const sig = st.size + ':' + buf.toString('latin1').length + ':' +
        require('crypto').createHash('md5').update(buf).digest('hex');
      if (seen.has(sig)) continue;
      seen.add(sig);
      files.push(p);
    }
  }
  return files;
}

const FIRST_PERSON = /^You /;

function main() {
  const files = corpus();
  console.log('FILES OPENED: %d   (dedup: size + md5 of first 64KB)', files.length);
  for (const f of files) console.log('    ' + f);
  if (!files.length) { console.log('\nNO FILES.'); return 1; }

  let lines = 0;
  let fpDamage = 0;
  const cell = new Map();          // "shara|e" -> count
  const sameAmount = new Map();    // of those, how many agree on the NUMBER
  const examples = new Map();      // first line for each disagreeing cell
  const eOnlyVerbs = new Map();
  const sharaOnlyShapes = new Map();

  const bump = (k, line) => {
    cell.set(k, (cell.get(k) || 0) + 1);
    if (!examples.has(k)) examples.set(k, line.trim().slice(0, 118));
  };

  for (const f of files) {
    const text = fs.readFileSync(f, 'latin1');
    for (const raw of text.split('\n')) {
      if (!raw) continue;
      lines++;
      const st = E_STAMP.exec(raw);
      if (!st) continue;
      const body = st[8];
      // in-scope population: the logging player as actor, in either grammar
      const isFP = FIRST_PERSON.test(body) || / from your /.test(body);
      if (!isFP) continue;
      if (!/ points? of | has taken /.test(body)) continue;
      fpDamage++;

      const s = parseDamageLine(raw);
      const e = eParse(body);
      const sk = s ? s.kind : 'none';
      const ek = e ? e.kind : 'none';
      if (sk === ek && !(s && e && s.amount !== e.amount)) continue;   // agree
      const key = sk + ' | ' + ek;
      bump(key, body);
      if (sk === 'none' && e) eOnlyVerbs.set(e.tag, (eOnlyVerbs.get(e.tag) || 0) + 1);
      if (s && e && s.amount === e.amount) sameAmount.set(key, (sameAmount.get(key) || 0) + 1);
      if (s && !e) {
        const shape = body.replace(/\d[\d,]*/g, 'N').replace(/^(You \w+).*/, '$1 ...');
        sharaOnlyShapes.set(shape, (sharaOnlyShapes.get(shape) || 0) + 1);
      }
    }
  }

  console.log('\nLINES READ            : %d', lines);
  console.log('FIRST-PERSON DAMAGE   : %d   (the in-scope population; both parsers apply)',
    fpDamage);

  const disagreements = [...cell.values()].reduce((a, b) => a + b, 0);
  console.log('DISAGREEMENTS         : %d   (%s%% of in-scope)',
    disagreements, fpDamage ? (100 * disagreements / fpDamage).toFixed(2) : '0');

  console.log('\n=== DISAGREEMENT MATRIX   shara | E ===');
  const rows = [...cell.entries()].sort((a, b) => b[1] - a[1]);
  for (const [k, c] of rows) {
    console.log('  %s   %s', (k + '                    ').slice(0, 20), String(c).padStart(8));
    const sa = sameAmount.get(k) || 0;
    console.log('      amounts agree on %d of %d  -> %s', sa, c,
      sa === c ? 'TAXONOMY ONLY: same damage, different label'
               : 'SUBSTANTIVE: the damage itself differs or one side sees none');
    console.log('      e.g. %s', examples.get(k));
  }

  if (eOnlyVerbs.size) {
    console.log('\n=== E CATCHES, SHARA RETURNS NULL — by E-verb ===');
    for (const [v, c] of [...eOnlyVerbs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
      console.log('  ' + v.padEnd(22) + String(c).padStart(8));
    }
  }
  if (sharaOnlyShapes.size) {
    console.log('\n=== SHARA CATCHES, E RETURNS NULL — by shape ===');
    for (const [v, c] of [...sharaOnlyShapes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
      console.log('  ' + v.slice(0, 58).padEnd(58) + String(c).padStart(8));
    }
  }
  return 0;
}

process.exit(main());
