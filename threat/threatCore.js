'use strict';
/**
 * threatCore — an AGGRO BOARD for EverQuest Legends, with a badged threat estimate beside it.
 *
 * CONTRACT: lines and an explicit `now` in, JSON-clonable state out. No Electron, no DOM, no
 * filesystem, no timers, no network. CommonJS. The same artifact runs in a browser page or
 * vendored into =Auras, so the delivery question never blocks the build.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * WHY THIS IS AN AGGRO BOARD FIRST AND A THREAT METER SECOND
 *
 * The owner's design sums damage + healing + stuns + flat-hate spells into one ranked number.
 * Three of those four inputs are the wrong quantity or need a coefficient nobody has measured:
 *
 *   MELEE.  EQEmu's server source, verbatim: "Hate Generation is on a per swing basis, regardless
 *           of a hit, miss, or block, its always the same", valued at the WEAPON's Damage stat.
 *           That stat never appears in a log line and misses are never logged. Logged damage is
 *           therefore not a noisy melee-threat signal; it is a different quantity.
 *   STUNS.  Not flat 200/400 but clamp(target_maxHP/15, 25, 1200). The 400 is MaxScalingProcAggro,
 *           a proc cap. No corroboration for 200 was found anywhere.
 *   HEALS.  Hate keys off the spell's BASE value, not the amount healed that the log prints.
 *
 * AND THE CAVEAT THAT CUTS BOTH WAYS: EverQuest Legends is NOT EQEmu. It is a new Daybreak /
 * Game Jawn title launched 2026-07-28, and its own wiki returns {"missing":""} for both `Aggro`
 * and `Hate Management`. So the above is a calibration hypothesis from a different codebase, and
 * nobody — in this project or outside it — can currently say whether EQL follows it.
 *
 * What IS directly observable is the CONSEQUENCE threat exists to produce: which player the mob is
 * actually swinging at. That needs no coefficient, and a player can falsify it by looking at their
 * own health bar. So the board leads, and the estimate rides beside it wearing its uncertainty.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * EVERY LINE SHAPE BELOW WAS MEASURED ON 13 LOGS / 2,390,293 LINES. Counts are in the comments so
 * a future reader can tell a shape that matters from one that does not. Three shapes in here exist
 * only because a first pass MISSED them and reported a confident zero:
 *
 *   `begins casting`      not `begins to cast`      65,238 lines, 820 spells
 *   `has captured X's attention!`   contains no word "taunt"     244 events
 *   `has taken N damage from your <Spell>`   own-DoT, not `by <Actor>`
 *
 * That is the same fault three times: searching for a remembered phrasing instead of enumerating
 * the shapes present. The parser below is built from an enumerated surface with a measured
 * residual, and `unparsed` is a first-class output for exactly that reason.
 */

/* ── the closed verb lexicon ───────────────────────────────────────────────────────────────────
 * 19 stems, established by fixpoint from three independent anchors (actor exactly "You", target
 * exactly "YOU", target beginning with an article) and reproduced by a second independent pass.
 * Residual 0 over 642,043 lines containing " for N points of ".
 * `gore maul rend gouge slam burn` are carried by an open-source EQL parser but appear ZERO times
 * here; they are accepted so a 20th verb does not silently vanish, and anything else is counted. */
const VERB_STEMS = [
  'hit', 'slash', 'cleave', 'kick', 'bash', 'pierce', 'strike', 'punch', 'crush', 'smite',
  'bite', 'shoot', 'claw', 'backstab', 'slice', 'sting', 'smash', 'reave', 'frenzy',
  'gore', 'maul', 'rend', 'gouge', 'slam', 'burn',
];

function inflect(stem) {
  if (stem === 'frenzy') return ['frenzies', 'frenzy'];
  return [stem + (/(s|sh|ch|x|z)$/.test(stem) ? 'es' : 's'), stem];
}

const VERBS_ALL = [];
for (const s of VERB_STEMS) for (const v of inflect(s)) VERBS_ALL.push(v);
// longest-first so `slashes` is not shadowed by `slash`
VERBS_ALL.sort((a, b) => b.length - a.length);
const VERB_ALT = VERBS_ALL.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };

/* EQ Legends writes "[Tue Aug 04 13:33:15 2026] ". The day is zero-padded (measured over 9,026,690
 * stamped lines); the single-space form is accepted anyway because tolerance is free. */
const STAMP = /^\[(\w{3}) (\w{3}) ?(\d{1,2}) (\d\d):(\d\d):(\d\d) (\d{4})\] (.*)$/;

/* ── shapes, with measured corpus counts ────────────────────────────────────────────────────── */
const RX = {
  // 426,647 lines. Bare `hit` is ALWAYS a spell (43,374, every one carrying "by <Spell>"); the
  // third-person `hits` never carries one. That is the hard melee/spell discriminator.
  melee: new RegExp('^(?<actor>.+?) (?<verb>' + VERB_ALT + ') (?<target>.+?) for (?<amt>\\d+) points? of (?:(?<dtype>[a-z]+) )?damage(?: by (?<spell>[^.]+))?\\.$'),
  // 130,952 third-person DoT ticks — fully attributed.
  dotOther: /^(?<target>.+?) (?:has|have) taken (?<amt>\d+) damage from (?<spell>.+?) by (?<actor>.+?)\.$/,
  // own DoT. THE SHAPE A FIRST PASS MISSED, producing a zero that was published.
  dotSelf: /^(?<target>.+?) (?:has|have) taken (?<amt>\d+) damage from your (?<spell>.+?)\.$/,
  // 204,521 heals. The paren form is emitted ONLY when overheal occurred: across all 57,874 pair
  // lines A<B holds, 0 equal and 0 reversed. A = effective, B = full. 317 distinct actors emit it,
  // so it is not a first-person artifact.
  heal: /^(?<actor>.+?) healed (?<target>.+?) for (?<eff>\d+)(?: \((?<full>\d+)\))? hit points?(?: by (?<spell>[^.]+))?\.$/,
  // HoT trap: "You healed Avenrae over time for ..." yields a phantom entity if parsed as above.
  healOverTime: /^(?<actor>.+?) healed (?<target>.+?) over time for (?<eff>\d+)/,
  // 65,238 casts over 820 spells. `begins to cast` is genuinely zero — the string is this one.
  cast: /^(?<actor>.+?) begins (?:casting|singing) (?<spell>.+?)\.$/,
  // 244 events. THE ONLY COEFFICIENT-FREE HATE SIGNAL, and it contains no word "taunt".
  // Measured: 11 of 25 actors captured attention having never attempted a taunt, so this is a
  // general aggro-gain event rather than taunt success.
  // TWO endings, and anchoring on `attention!` missed the second: 25 of 537 events read
  // "... has captured X's attention with an unparalleled approach!". Suffix-tolerant now.
  capture: /^(?<actor>.+?) has captured (?<target>.+?)'s attention[^!]*!$/,
  // FIRST-PERSON capture, present tense - a SEPARATE shape, and it names the mob. 600 events in
  // Avenrae's logs and ZERO in Shara's: it fires only for the logging player, so whether it appears
  // at all depends on whether that character tanks. Missing this was the fifth instance of
  // searching for a remembered phrasing instead of enumerating shapes.
  captureSelf: /^You capture (?<target>.+?)'s attention[^!]*!$/,
  // THE FREE GROUND TRUTH. The client asserting YOU ARE TOP OF THIS MOB'S HATE LIST, right now.
  // 192 events. It does not name the mob, so it validates a moment rather than a target.
  topOfHate: /^You already have your target's attention\.$/,
  tauntFail: /^(?<actor>.+?) failed to taunt (?<target>.+?)[.!]$/,
  slain: /^(?<target>.+?) has been slain by (?<killer>.+?)!$/,
  youSlain: /^You have slain (?<target>.+?)!$/,
  stunLand: /^(?<target>.+?) (?:is|are) stunned(?: by (?<source>[^.!]+))?[.!]$/,
};

const ARTICLE = /^(a|an|the)\s/i;   // case-INSENSITIVE: EQ capitalises at line start

/* A line that mentions damage, healing or a hate event but that the grammar did not consume. */
const COMBATISH = /points? of|hit points?|damage from|has captured|is stunned|has been slain/;

/* The log writes the logging player as `You` in first person and `YOU` when a mob hits them.
 * Left unnormalised these are two rows for one person. */
/**
 * `You` MEANS A DIFFERENT PERSON IN EVERY LOG. Merging two characters' logs into one state without
 * resolving it records one player under two names. A validation pass caught exactly that: agreement
 * sat at 63.2% and nearly every disagreement read "board saw Avenrae instead of You" - while the
 * ground-truth line came from Avenrae's OWN log, where Avenrae IS "You".
 *
 * A caller MUST pass `self`, the logging character's name, with that character's lines. Feeding two
 * characters' logs under one `self` is a caller error the engine cannot detect.
 */
function canonActor(n, self) {
  // THREE casings for one person, in three shapes, and each was found only by a failure:
  //   'You'  actor, first person melee          89,395
  //   'YOU'  target of mob MELEE                57,955
  //   'you'  target of mob SPELL damage          6,101   <- found when validation disagreed 122/122
  // Leaving any of them unnormalised splits one player into several rows and makes the board wrong.
  if (n === 'You' || n === 'YOU' || n === 'you') return self || 'You';
  return n;
}

function parseStamp(line) {
  const m = STAMP.exec(line);
  if (!m) return null;
  return {
    ms: Date.UTC(+m[7], (MONTHS[m[2]] || 1) - 1, +m[3], +m[4], +m[5], +m[6]),
    body: m[8],
  };
}

/**
 * Classify an actor three ways. NEVER a boolean.
 *
 * A boolean forces every unrecognised name to a side, and the meter then fails SILENTLY. Two charm
 * pets rank #2 and #3 by damage in the real corpus (Innoruuk's Chosen 1,911,171 and Heart harpie
 * 2,428,388, above every human but one), so a raw name-shaped leaderboard ships a charmed mob at
 * the top and cannot know it did.
 *
 * THE COLLISION RULE, and it is the dangerous direction: a name that appears in the mob catalogue
 * yields `unknown`, NOT `not-a-person`, unless a second discriminator agrees. Dropping a real
 * player from their own board with no signal is worse than showing an extra row.
 */
function classifyActor(name, ctx) {
  if (!name) return 'unknown';
  if (name === 'You') return 'person';
  if (ARTICLE.test(name)) return 'not-a-person';
  if (/\bpet$/i.test(name) || /'s warder$/i.test(name) || /`s warder$/i.test(name)) return 'not-a-person';

  const inCatalogue = ctx.mobNames && ctx.mobNames.has(normaliseName(name));
  const heals = (ctx.healsGiven && ctx.healsGiven.get(name)) || 0;

  if (inCatalogue && heals >= 3) return 'unknown';       // COLLISION — never not-a-person
  if (inCatalogue) return 'not-a-person';
  if (heals >= 3) return 'person';
  return 'unknown';
}

function normaliseName(s) {
  return String(s).trim().toLowerCase()
    .replace(/^(a|an|the)\s+/, '')
    .replace(/\s+pet$/, '')
    .replace(/[`']/g, "'");
}

function newState() {
  return {
    v: 1,
    lines: 0, parsed: 0,
    unparsedCombat: 0,   // combat-SHAPED and my grammar failed. This is the real residual.
    nonCombat: 0,        // chat, loot, zoning, system. Never was combat.
    unparsedSamples: [],
    targets: {},          // target -> encounter accumulator
    healsGiven: {},       // actor -> count, used by classifyActor
    captures: [],         // the hard hate signal, both persons
    topOfHate: [],        // "You already have your target's attention." - binary ground truth
    lastMs: null,
  };
}

function bump(map, k, n) { map[k] = (map[k] || 0) + n; }

/**
 * EQ capitalises the leading article at the START of a line and not mid-sentence, so ONE mob
 * arrives under two spellings:
 *     "A vis ghoul knight hits Avenrae for 33 points of damage."     <- line-initial
 *     "You capture a vis ghoul knight's attention!"                  <- mid-sentence
 * Keying on the raw string made those two targets. The capture created one that was never attacked
 * and every attack accumulated on the other, which is what produced 255 ground-truth events
 * against a mob that had "never attacked anybody, ever". Key on a canonical form; keep the
 * first-seen spelling for display.
 */
function targetKey(name) { return String(name).trim().toLowerCase(); }

function ensureTarget(state, target, ms) {
  const key = targetKey(target);
  let t = state.targets[key];
  if (!t) {
    t = state.targets[key] = {
      name: target, firstMs: ms, lastMs: ms,
      damage: {}, dot: {}, heals: {}, casts: {},
      mobAttacks: {},       // player -> times the MOB hit them. THE AGGRO SIGNAL.
      aggroEvents: [],      // {ms, holder, kind}
      captures: 0, stuns: 0, slain: false,
    };
  }
  t.lastMs = ms;
  return t;
}

/**
 * Feed lines. Pure: no clock read of its own, `now` is passed in.
 *
 * @param {string[]} lines
 * @param {object}   opts  { state, now, mobNames:Set<string>, encounterGapMs }
 * @returns {object} JSON-clonable state
 */
function ingest(lines, opts) {
  const o = opts || {};
  const state = o.state || newState();
  const gap = o.encounterGapMs != null ? o.encounterGapMs : 45000;
  const self = o.self || null;   // the logging character's name. REQUIRED for correct merging.
  const ctx = {
    mobNames: o.mobNames || null,
    healsGiven: new Map(Object.entries(state.healsGiven)),
  };

  for (const raw of lines) {
    state.lines += 1;
    const st = parseStamp(raw);
    if (!st) { state.unparsed += 1; keepSample(state, raw); continue; }
    const { ms, body } = st;
    state.lastMs = ms;
    let hit = false;

    // ORDER MATTERS. healOverTime before heal, dotSelf before dotOther, capture before slain.
    let m = RX.captureSelf.exec(body);
    if (m) {
      const t = ensureTarget(state, m.groups.target, ms);
      t.captures += 1;
      t.aggroEvents.push({ ms, holder: self || 'You', kind: 'capture' });
      state.captures.push({ ms, actor: self || 'You', target: m.groups.target, person: 'first' });
      state.parsed += 1;
      continue;
    }
    if (RX.topOfHate.test(body)) {
      // Ground truth with no target named. Recorded for VALIDATION, not for the board.
      state.topOfHate.push({ ms });
      state.parsed += 1;
      continue;
    }
    m = RX.capture.exec(body);
    if (m) {
      const t = ensureTarget(state, m.groups.target, ms);
      t.captures += 1;
      t.aggroEvents.push({ ms, holder: m.groups.actor, kind: 'capture' });
      state.captures.push({ ms, actor: m.groups.actor, target: m.groups.target });
      hit = true;
    }

    if (!hit && (m = RX.healOverTime.exec(body))) {
      bump(state.healsGiven, m.groups.actor, 1);
      hit = true;   // consumed so the plain heal regex cannot invent a phantom target
    }

    if (!hit && (m = RX.heal.exec(body))) {
      const eff = +m.groups.eff;
      const full = m.groups.full != null ? +m.groups.full : eff;
      bump(state.healsGiven, m.groups.actor, 1);
      // Heals are recorded against the healer, not a target: a heal line never names the mob.
      // Apportioning heal-hate needs a policy, and every policy is unmeasured — so the board keeps
      // the raw totals and the estimate applies a NAMED assumption downstream.
      state._pendingHeals = state._pendingHeals || [];
      state._pendingHeals.push({ ms, actor: m.groups.actor, eff, full, overheal: full - eff });
      hit = true;
    }

    if (!hit && (m = RX.dotSelf.exec(body))) {
      const t = ensureTarget(state, m.groups.target, ms);
      bump(t.dot, self || 'You', +m.groups.amt);
      hit = true;
    }

    if (!hit && (m = RX.dotOther.exec(body))) {
      const t = ensureTarget(state, m.groups.target, ms);
      bump(t.dot, m.groups.actor, +m.groups.amt);
      hit = true;
    }

    if (!hit && (m = RX.melee.exec(body))) {
      const { actor, target, amt } = m.groups;
      const A = canonActor(actor, self);
      const T = canonActor(target, self);
      const actorIsMob = ARTICLE.test(A);
      // A target is only a PLAYER-SIDE aggro holder if it is not itself article-shaped AND not a
      // known mob. Without the catalogue test, `Maestro of Rancor` and `Innoruuk, the Prince of
      // Hate` were recorded as players a mob was attacking - charmed pets fighting each other.
      const targetLooksPlayer = !ARTICLE.test(T) && !(ctx.mobNames && ctx.mobNames.has(normaliseName(T)));
      if (actorIsMob && targetLooksPlayer) {
        // THE AGGRO OBSERVATION. 10,553 third-person + 1,169 "hits YOU" in the corpus.
        const t = ensureTarget(state, A, ms);
        bump(t.mobAttacks, T, 1);
        recordAggro(t, ms, T);
      } else if (!actorIsMob) {
        const t = ensureTarget(state, T, ms);
        bump(t.damage, A, +amt);
      }
      hit = true;
    }

    if (!hit && (m = RX.cast.exec(body))) {
      state._pendingCasts = state._pendingCasts || [];
      state._pendingCasts.push({ ms, actor: m.groups.actor, spell: m.groups.spell });
      hit = true;
    }

    if (!hit && (m = RX.stunLand.exec(body))) {
      const t = ensureTarget(state, m.groups.target, ms);
      t.stuns += 1;
      hit = true;
    }

    if (!hit && ((m = RX.slain.exec(body)) || (m = RX.youSlain.exec(body)))) {
      const t = state.targets[targetKey(m.groups.target)];
      if (t) t.slain = true;
      hit = true;
    }

    if (hit) { state.parsed += 1; continue; }
    // A residual is only meaningful if it separates "this was never a combat line" (chat, loot,
    // zoning, system) from "this LOOKED like combat and my grammar failed". Only the second is a
    // defect, and lumping them reported a 64.97% failure rate that was mostly people talking.
    if (COMBATISH.test(body)) { state.unparsedCombat += 1; keepSample(state, body); }
    else state.nonCombat += 1;
  }

  // DEFECT FOUND BY RUNNING IT: this used to read
  //     state.healsGiven = Object.fromEntries(ctx.healsGiven);
  // which overwrote every bump made during the loop with the snapshot taken BEFORE it. Avenrae,
  // with 74,876 heals, classified as `unknown`. The heal counter is the main person-discriminator,
  // so the bug silently disabled actor identity while every number still looked plausible.
  state._gap = gap;
  return state;
}

function keepSample(state, s) {
  if (state.unparsedSamples.length < 40) state.unparsedSamples.push(String(s).slice(0, 160));
}

function recordAggro(t, ms, holder) {
  const last = t.aggroEvents[t.aggroEvents.length - 1];
  if (!last || last.holder !== holder) {
    t.aggroEvents.push({ ms, holder, kind: last ? 'switch' : 'initial' });
  }
  // The change-log alone cannot answer "who held it at time T" when nothing changed, which made a
  // validation pass report 478 of 600 events as `no data` that were really steady-state holds.
  t.lastAttacked = holder;
  t.lastAttackedMs = ms;
  (t.observations = t.observations || []).push({ ms, holder });
  if (t.observations.length > 4000) t.observations.splice(0, 2000);
}

/**
 * THE AGGRO BOARD — a direct observation, no coefficient anywhere in it.
 *
 * `holder` is who the mob has most recently been observed attacking. `switches` counts how many
 * times that changed hands. Both are consequences, not estimates, and a player can check them
 * against their own health bar in the moment.
 */
function aggroBoard(state, target, opts) {
  const t = state.targets[targetKey(target)];
  if (!t) return null;
  const ctx = { mobNames: (opts && opts.mobNames) || null, healsGiven: new Map(Object.entries(state.healsGiven)) };
  const rows = Object.entries(t.mobAttacks)
    .map(([who, hits]) => ({ who, hits, identity: classifyActor(who, ctx) }))
    .sort((a, b) => b.hits - a.hits);
  const ev = t.aggroEvents;
  return {
    target: t.name,
    holder: ev.length ? ev[ev.length - 1].holder : null,
    switches: ev.filter((e) => e.kind === 'switch').length,
    captures: t.captures,
    observations: Object.values(t.mobAttacks).reduce((a, b) => a + b, 0),
    rows,
    basis: 'DIRECT OBSERVATION of which player the mob attacked. No coefficient.',
  };
}

/**
 * THE THREAT ESTIMATE — badged, secondary, and it names its own assumptions in the payload.
 *
 * Every coefficient here is UNMEASURED for EverQuest Legends. The `assumptions` array is returned
 * WITH the numbers, so a surface cannot render the figure without also having the caveat in hand.
 * That is the same structural trick E used for `measured` vs `deltas`: a convention that says
 * "display the caveat" fails open the first time somebody maps the object generically; a payload
 * that carries the caveat in a sibling field cannot be separated from it.
 */
const ESTIMATE_MODEL = {
  damagePerPoint: 1.0,
  healPerPoint: 0.0,      // DEFAULT OFF. Heal-hate needs the spell BASE value, not the logged amount.
  capturedFlat: 0.0,      // the one real signal, but its magnitude is unknown
};

function threatEstimate(state, target, opts) {
  const t = state.targets[targetKey(target)];
  if (!t) return null;
  const model = Object.assign({}, ESTIMATE_MODEL, (opts && opts.model) || {});
  const ctx = { mobNames: (opts && opts.mobNames) || null, healsGiven: new Map(Object.entries(state.healsGiven)) };

  const totals = {};
  for (const [who, dmg] of Object.entries(t.damage)) bump(totals, who, dmg * model.damagePerPoint);
  for (const [who, dmg] of Object.entries(t.dot)) bump(totals, who, dmg * model.damagePerPoint);

  const rows = Object.entries(totals)
    .map(([who, score]) => ({
      who, score,
      damage: (t.damage[who] || 0) + (t.dot[who] || 0),
      identity: classifyActor(who, ctx),
    }))
    .filter((r) => r.identity !== 'not-a-person')
    .sort((a, b) => b.score - a.score);

  return {
    target,
    rows,
    isEstimate: true,
    assumptions: [
      'MELEE HATE MAY NOT BE DAMAGE. EQEmu computes it per SWING from the weapon Damage stat, ' +
      'a number no log line contains; misses generate hate and are not logged.',
      'damagePerPoint=' + model.damagePerPoint + ' is a PLACEHOLDER. No damage-to-hate rate is ' +
      'published for EverQuest Legends at any tier.',
      'healPerPoint=' + model.healPerPoint + '. Heal hate keys off the spell BASE value, not the ' +
      'logged amount, so healing is OFF by default rather than wrong by default.',
      'Stun hate is clamp(target_maxHP/15, 25, 1200) in EQEmu, not a flat 200 or 400, and ' +
      'target max HP is not in the log.',
      'EverQuest Legends is not EQEmu. Its own wiki has no Aggro or Hate Management page.',
    ],
  };
}

module.exports = {
  ingest, newState, aggroBoard, threatEstimate, classifyActor, normaliseName, targetKey,
  VERB_STEMS, RX, ESTIMATE_MODEL,
};
