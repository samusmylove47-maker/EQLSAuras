'use strict';
/**
 * threatView — the DISPLAY MODEL, and the place the epistemic badge is made structural.
 *
 * RULING R72, and it was right about a real defect: the uncertainty statement lived in a 40-line
 * source header, and nobody reading the board opens threatCore.js. A caveat the user cannot see is
 * not a caveat. So the badge moves onto the surface, in the product's own words.
 *
 * THE STRUCTURAL PART, which is why this is a module and not a style guide:
 *
 *   A convention that says "please display the caveat" fails open the first time somebody maps the
 *   object generically. So `panels` is a LIST OF PANELS, each carrying its own `kind`, `heading`
 *   and `qualifier`, and the estimate's rows are not reachable except through the panel that
 *   carries its qualifier. A renderer that loops panels and prints heading + rows prints the badge
 *   by construction. One that tries to print only the numbers has to reach past a field named
 *   `qualifier` to do it, which is a thing a reviewer can see.
 *
 * TWO EPISTEMIC OBJECTS, TWO TREATMENTS:
 *
 *   kind: 'measurement'  the aggro board. Who the mob was OBSERVED attacking. No coefficient
 *                        anywhere in it, and validated at 72.2% against 133 decidable in-log
 *                        ground-truth events ("You capture <mob>'s attention!").
 *   kind: 'ranking'      the threat estimate. An ORDERING built from weights that are not
 *                        published for this game. Not a measurement, and it says so on the screen.
 */

const core = require('./threatCore');

/** The one sentence a user must be able to read without opening source. */
const RANKING_QUALIFIER =
  'ESTIMATE — a ranking, not a measurement. The weights are not published for EverQuest Legends.';

const RANKING_DETAIL = [
  'Ordering only. Do not read the gap between two rows as a real difference.',
  'Melee hate may not be damage at all: the reference server implementation charges hate per SWING ' +
  'from the weapon’s damage stat, a number no log line contains, and misses are never logged.',
  'Healing is EXCLUDED, not weighted: hate keys off the spell’s base value, which the log does ' +
  'not print. Including it with the printed number would be wrong rather than approximate.',
  'EverQuest Legends is not the server this model comes from. Its own wiki has no Aggro or Hate ' +
  'Management page — the Threat page redirects to one that does not exist.',
];

const MEASUREMENT_QUALIFIER =
  'MEASURED — who the mob was actually observed attacking. No coefficients.';

/**
 * Build the display model for one target.
 * @returns {{target:string, panels:Array}} JSON-clonable. Every panel carries its own qualifier.
 */
function viewForTarget(state, target, opts) {
  const board = core.aggroBoard(state, target, opts);
  if (!board) return null;
  const est = core.threatEstimate(state, target, opts);

  const panels = [];

  panels.push({
    kind: 'measurement',
    heading: 'HOLDING AGGRO',
    qualifier: MEASUREMENT_QUALIFIER,
    holder: board.holder,
    switches: board.switches,
    captures: board.captures,
    observations: board.observations,
    rows: board.rows.slice(0, 4).map((r, i) => ({
      rank: i + 1,
      who: r.who,
      value: r.hits,
      unit: 'hits taken',
      isHolder: r.who === board.holder,
      identity: r.identity,
    })),
    // Shown, never dropped. An actor the meter cannot classify does not silently vanish.
    unknownActors: board.rows.filter((r) => r.identity === 'unknown').length,
  });

  if (est && est.rows.length) {
    panels.push({
      kind: 'ranking',
      heading: 'THREAT ESTIMATE',
      qualifier: RANKING_QUALIFIER,
      detail: RANKING_DETAIL,
      rows: est.rows.slice(0, 4).map((r, i) => ({
        rank: i + 1,
        who: r.who,
        value: r.damage,
        unit: 'damage',
        identity: r.identity,
      })),
    });
  }

  return { target, panels };
}

/**
 * The single overlay line the owner specified: the holder, and who is closest behind.
 * Deliberately drawn from the MEASUREMENT panel only — the one line a player glances at while
 * fighting must not be the one carrying unsourced weights.
 */
function overlayLine(state, target, opts) {
  const board = core.aggroBoard(state, target, opts);
  if (!board || !board.rows.length) return null;
  const top = board.rows[0];
  const next = board.rows[1];
  return {
    text: next
      ? board.holder + '  ▸ ' + next.who
      : String(board.holder),
    holder: board.holder,
    challenger: next ? next.who : null,
    margin: next ? top.hits - next.hits : null,
    basis: 'observed',
    switches: board.switches,
  };
}

/** Plain-text render, used by the demo and by anything without a DOM. */
function renderText(view) {
  if (!view) return '(no data)';
  const out = [];
  out.push('TARGET: ' + view.target);
  for (const p of view.panels) {
    out.push('');
    out.push('  ' + p.heading + '   [' + p.kind.toUpperCase() + ']');
    out.push('  ' + p.qualifier);
    for (const r of p.rows) {
      const mark = r.isHolder ? '>' : ' ';
      out.push('   ' + mark + ' ' + String(r.rank) + '. ' +
        (r.who + '                    ').slice(0, 20) +
        String(r.value).padStart(9) + '  ' + r.unit +
        (r.identity === 'unknown' ? '   [unidentified actor]' : ''));
    }
    if (p.detail) for (const d of p.detail) out.push('      - ' + d);
    if (p.unknownActors) {
      out.push('      ' + p.unknownActors + ' actor(s) could not be identified as people and are ' +
        'shown rather than dropped.');
    }
  }
  return out.join('\n');
}

module.exports = {
  viewForTarget, overlayLine, renderText,
  RANKING_QUALIFIER, MEASUREMENT_QUALIFIER, RANKING_DETAIL,
};
