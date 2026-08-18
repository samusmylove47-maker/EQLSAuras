'use strict';
/**
 * Regression test for the userData pin.
 *
 * WHY THIS EXISTS
 * ---------------
 * Electron derives the userData directory from the app's display name. Renaming the
 * product therefore moves that directory, and every saved widget, loadout profile,
 * buff and cached icon appears to vanish.
 *
 * src/main/main.js pins userData to the ORIGINAL "EQ Buff Tracker" folder so no rename
 * ever touches real user data. That pin must sit ABOVE every local require(), because
 * widgetManager.js builds its WidgetStore at require() time - module-level code, not
 * inside a function. This is not hypothetical: an earlier version of the pin sat below
 * the requires and silently seeded a second, empty widgets.json under the new folder
 * while buffs, profiles and the spellbook stayed in the old one. A split-brain.
 *
 * These tests fail if that regression is ever reintroduced.
 *
 * Zero dependencies, no test framework - the project has none and should not gain one.
 *   node test/userdata-pin.test.js
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');

const ROOT = path.join(__dirname, '..');
const MAIN_JS = path.join(ROOT, 'src', 'main', 'main.js');
const STORE_JS = path.join(ROOT, 'src', 'main', 'store.js');

const PINNED_FOLDER = 'EQ Buff Tracker'; // must never change without a real data migration

let passed = 0;
const failures = [];
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures.push({ name, err });
    console.log(`  FAIL ${name}\n       ${err.message}`);
  }
}

/**
 * Strip comments so we can reason about CODE ordering only.
 *
 * This matters more than it looks. main.js's own explanatory comment contains the text
 * require('./widgetManager') as an example of what must not appear above the pin. A naive
 * grep for local requires matches that comment and reports the pin as mis-ordered when it
 * is perfectly fine. That false positive has already been hit once by a reviewer, so the
 * stripping below is the difference between a test that works and a test that cries wolf.
 */
function stripComments(src) {
  let out = '';
  let i = 0;
  let state = 'code'; // code | line | block | single | double | template
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (state === 'code') {
      if (c === '/' && next === '/') { state = 'line'; out += '  '; i += 2; continue; }
      if (c === '/' && next === '*') { state = 'block'; out += '  '; i += 2; continue; }
      if (c === "'") state = 'single';
      else if (c === '"') state = 'double';
      else if (c === '`') state = 'template';
      out += c; i++; continue;
    }
    if (state === 'line') {
      if (c === '\n') { state = 'code'; out += '\n'; } else { out += ' '; }
      i++; continue;
    }
    if (state === 'block') {
      if (c === '*' && next === '/') { state = 'code'; out += '  '; i += 2; continue; }
      out += (c === '\n' ? '\n' : ' '); i++; continue;
    }
    // inside a string literal - copy verbatim, honour escapes
    if (c === '\\') { out += c + (next === undefined ? '' : next); i += 2; continue; }
    if ((state === 'single' && c === "'") || (state === 'double' && c === '"') || (state === 'template' && c === '`')) state = 'code';
    out += c; i++;
  }
  return out;
}

const mainSrc = fs.readFileSync(MAIN_JS, 'utf8');
const mainCode = stripComments(mainSrc);
const codeLines = mainCode.split(/\r?\n/);

// ---------------------------------------------------------------- static checks

test('main.js pins userData, and pins it to the original folder name', () => {
  const m = mainCode.match(/app\s*\.\s*setPath\s*\(\s*['"]userData['"]\s*,\s*path\s*\.\s*join\s*\(\s*app\s*\.\s*getPath\s*\(\s*['"]appData['"]\s*\)\s*,\s*['"]([^'"]+)['"]/);
  assert.ok(m, 'no app.setPath(\'userData\', path.join(app.getPath(\'appData\'), ...)) found in main.js');
  assert.equal(
    m[1], PINNED_FOLDER,
    `userData is pinned to "${m[1]}" but must stay "${PINNED_FOLDER}" - changing it orphans every existing user's saved data`
  );
});

test('the pin runs BEFORE any local require()', () => {
  const pinLine = codeLines.findIndex((l) => /app\s*\.\s*setPath\s*\(\s*['"]userData['"]/.test(l));
  assert.notEqual(pinLine, -1, 'pin not found');
  const localRequire = codeLines.findIndex((l) => /require\s*\(\s*['"]\.\.?\//.test(l));
  assert.notEqual(localRequire, -1, 'no local require() found - has main.js been restructured?');
  assert.ok(
    pinLine < localRequire,
    `pin is on code line ${pinLine + 1} but a local require() appears on line ${localRequire + 1}. ` +
    'Any local module required above the pin builds its store against the WRONG folder at require() time.'
  );
});

test('nothing else repoints userData', () => {
  const hits = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) {
        const code = stripComments(fs.readFileSync(p, 'utf8'));
        if (/setPath\s*\(\s*['"]userData['"]/.test(code) && path.resolve(p) !== path.resolve(MAIN_JS)) hits.push(p);
      }
    }
  })(path.join(ROOT, 'src'));
  assert.deepEqual(hits, [], `userData is repointed outside main.js, which can defeat the pin: ${hits.join(', ')}`);
});

// ------------------------------------------------------------ behavioural checks

function withStubbedElectron(appStub, fn) {
  const orig = Module._load;
  Module._load = function (request, ...rest) {
    if (request === 'electron') return { app: appStub };
    return orig.call(this, request, ...rest);
  };
  delete require.cache[require.resolve(STORE_JS)];
  try {
    return fn();
  } finally {
    Module._load = orig;
    delete require.cache[require.resolve(STORE_JS)];
  }
}

/** Mimics Electron: userData defaults to <appData>/<productName> until setPath overrides it. */
function makeAppStub(appDataDir, productName) {
  let userData = path.join(appDataDir, productName);
  return {
    getPath(name) {
      if (name === 'appData') return appDataDir;
      if (name === 'userData') return userData;
      throw new Error(`unexpected getPath(${name})`);
    },
    setPath(name, value) {
      if (name !== 'userData') throw new Error(`unexpected setPath(${name})`);
      userData = value;
    },
  };
}

const productName = require(path.join(ROOT, 'package.json')).productName;

test('saved state written under the old folder still loads after the rename', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'auras-userdata-'));
  try {
    const legacy = path.join(tmp, PINNED_FOLDER);
    fs.mkdirSync(legacy, { recursive: true });
    const saved = { widgets: [{ id: 'w1', kind: 'self-buffs', x: 100, y: 240 }] };
    fs.writeFileSync(path.join(legacy, 'widgets.json'), JSON.stringify(saved), 'utf8');

    const appStub = makeAppStub(tmp, productName);
    appStub.setPath('userData', path.join(appStub.getPath('appData'), PINNED_FOLDER)); // the pin

    const loaded = withStubbedElectron(appStub, () => require(STORE_JS).loadJson('widgets', null));
    assert.deepEqual(loaded, saved, 'existing widgets.json was not read back - saved state would appear lost');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('without the pin the app would read a different folder (proves the pin is load-bearing)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'auras-userdata-'));
  try {
    const legacy = path.join(tmp, PINNED_FOLDER);
    fs.mkdirSync(legacy, { recursive: true });
    fs.writeFileSync(path.join(legacy, 'widgets.json'), JSON.stringify({ real: true }), 'utf8');

    // No pin applied: Electron's default would be <appData>/<productName>.
    const appStub = makeAppStub(tmp, productName);
    const loaded = withStubbedElectron(appStub, () => require(STORE_JS).loadJson('widgets', 'MISS'));

    if (productName === PINNED_FOLDER) return; // pin would be a no-op; nothing to prove
    assert.equal(
      loaded, 'MISS',
      'unpinned lookup found the legacy file, so this test can no longer detect the pin being removed'
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('a stale folder named after the current product is NOT preferred over the pinned one', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'auras-userdata-'));
  try {
    const legacy = path.join(tmp, PINNED_FOLDER);
    const decoy = path.join(tmp, productName);
    fs.mkdirSync(legacy, { recursive: true });
    fs.mkdirSync(decoy, { recursive: true });
    fs.writeFileSync(path.join(legacy, 'widgets.json'), JSON.stringify({ from: 'legacy' }), 'utf8');
    fs.writeFileSync(path.join(decoy, 'widgets.json'), JSON.stringify({ from: 'decoy' }), 'utf8');

    const appStub = makeAppStub(tmp, productName);
    appStub.setPath('userData', path.join(appStub.getPath('appData'), PINNED_FOLDER));

    const loaded = withStubbedElectron(appStub, () => require(STORE_JS).loadJson('widgets', null));
    assert.deepEqual(loaded, { from: 'legacy' }, 'the empty split-brain folder won - this is the exact bug the pin exists to prevent');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ------------------------------------------- saved widgets survive schema growth
//
// Pinning the folder only guarantees we read the RIGHT file. It says nothing about
// whether the contents still parse once new persisted fields are added. The custom
// alert sounds work added landSoundId / expireSoundId / warningSoundId / alertVolume
// to every widget; a widget saved before that must still load, and must pick up sane
// defaults rather than undefined. normalizeWidget() is what guarantees it, so this
// fails if a future field is added to the defaults but forgotten there.

test('a widget saved before the alert-sounds fields still loads, with defaults filled in', () => {
  const { WidgetStore } = require(path.join(ROOT, 'src', 'main', 'widgetStore.js'));

  const legacyWidget = {
    id: 'self-buffs',
    kind: 'self-buffs',
    name: 'Self Buffs',
    enabled: true,
    displayMode: 'icons',
    position: { x: 40, y: 40 },
    // the sound fields as they existed BEFORE custom sounds - note the four new
    // ones are deliberately absent, exactly as an older widgets.json would be
    soundOnLand: true,
    soundOnExpire: false,
    soundWarningSec: 30,
    soundWarningLoopSec: 0,
  };

  let written = null;
  const fakeStore = {
    loadJson: (name, fallback) => (name === 'widgets' ? { version: 1, widgets: [legacyWidget] } : fallback),
    saveJson: (name, data) => { if (name === 'widgets') written = data; },
  };

  const ws = new WidgetStore(fakeStore);
  const w = ws.data.widgets.find((x) => x.id === 'self-buffs');

  assert.ok(w, 'the legacy widget disappeared on load');
  assert.equal(w.soundOnLand, true, 'an existing setting was lost');
  assert.equal(w.soundWarningSec, 30, 'an existing setting was lost');
  assert.equal(w.landSoundId, null, 'landSoundId should default to null (the built-in beep)');
  assert.equal(w.expireSoundId, null, 'expireSoundId should default to null');
  assert.equal(w.warningSoundId, null, 'warningSoundId should default to null');
  assert.equal(w.alertVolume, 100, 'alertVolume should default to 100, not undefined - undefined would mute or NaN the alert');
  assert.ok(written, 'normalized data was not written back');
});

console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
