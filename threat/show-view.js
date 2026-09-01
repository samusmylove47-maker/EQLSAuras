'use strict';
// Render the display model for the biggest fights, so the badge can be SEEN rather than asserted.
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const core = require('./threatCore'); const view = require('./threatView');
const DIRS = ['C:/Users/Lindsey/Desktop/EQL Source','C:/Users/Lindsey/Desktop/EQL Source/Spare Logs','C:/Users/Lindsey/Desktop','C:/Users/Lindsey/Desktop/Cursor-eqls/state/logs'];
const SKIP = /inventory|transcript|caveguide|brutalstatic/i;
const seen = new Map(); const files = [];
for (const d of DIRS) { let ns=[]; try { ns = fs.readdirSync(d); } catch(e){ continue; }
  for (const n of ns) { if (!/^eqlog_.*\.txt$/i.test(n) || SKIP.test(n)) continue;
    const p = path.join(d,n); let sz; try { sz = fs.statSync(p).size; } catch(e){ continue; }
    const fd = fs.openSync(p,'r'); const b = Buffer.alloc(Math.min(65536,sz));
    fs.readSync(fd,b,0,b.length,0); fs.closeSync(fd);
    const k = sz+':'+crypto.createHash('sha1').update(b).digest('hex');
    if (seen.has(k)) continue; seen.set(k,p); files.push(p); } }
let mobNames = null;
try { const cat = JSON.parse(fs.readFileSync('C:/Users/Lindsey/AppData/Local/Temp/claude/C--Users-Lindsey-EQLS-Auras/2cc2d853-d38b-45a3-8d0f-3b2d5ce2406e/scratchpad/bis-catalog.json','utf8'));
  mobNames = new Set(); for (const r of cat.records) { const s = r.src||{};
    for (const it of (Array.isArray(s)?s:[s])) if (it&&it.m) for (const nm of (Array.isArray(it.m)?it.m:[it.m]))
      if (typeof nm==='string'&&nm.trim()) mobNames.add(core.normaliseName(nm)); } } catch(e){}
let state = core.newState();
for (const f of files) { const self = (path.basename(f).match(/^eqlog_([A-Za-z]+)_/)||[])[1]||null;
  state = core.ingest(fs.readFileSync(f,'utf8').split(/\r?\n/), { state, mobNames, self, now: 0 }); }
const ranked = Object.values(state.targets)
  .map((t)=>({t,obs:Object.values(t.mobAttacks).reduce((a,b)=>a+b,0)}))
  .filter((x)=>x.obs>=150)
  .sort((a,b)=>b.obs-a.obs).slice(0,2);
for (const {t} of ranked) {
  console.log('='.repeat(78));
  console.log(view.renderText(view.viewForTarget(state, t.name, { mobNames })));
  const ol = view.overlayLine(state, t.name, { mobNames });
  console.log(''); console.log('  OVERLAY LINE (the one line in =Auras): "' + ol.text + '"   margin ' + ol.margin);
  console.log('');
}
