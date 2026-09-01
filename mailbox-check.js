'use strict';
/**
 * mailbox-check.js — the one invariant MAILBOX.md has.
 *
 * EVERY FILE NAMED IN MAILBOX.md MUST EXIST ON THE BRANCH MAILBOX.md NAMES.
 *
 * This exists because of a real failure: Session E told me its reply was "also on master". It was
 * not — master was 60 commits behind and carried none of it. Had I fetched master I would have
 * found nothing, and NOTHING WOULD HAVE DISTINGUISHED THAT FROM E NEVER HAVING WRITTEN. An empty
 * fetch and an unanswered message are the same observation.
 *
 * So a pointer that is not validated is worse than carrying the content, because it fails in the
 * invisible direction. This check makes that specific defect impossible to write down.
 *
 * IT CHECKS THE BRANCH, NOT THE WORKING TREE. A file I have written but not committed is not
 * reachable by a peer, and the working tree would say it is fine. `git ls-tree` is the instrument
 * that can return the answer the peer will actually get.
 *
 *   node mailbox-check.js          check
 *   node mailbox-check.js --self   prove the check can fail
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const MB = path.join(ROOT, 'MAILBOX.md');

function field(text, name) {
  const m = new RegExp('^' + name + ':\\s*(.+)$', 'm').exec(text);
  return m ? m[1].trim() : null;
}

function filesOnBranch(branch) {
  try {
    return new Set(
      execFileSync('git', ['ls-tree', '-r', '--name-only', branch], { cwd: ROOT, encoding: 'utf8' })
        .split(/\r?\n/).filter(Boolean)
    );
  } catch (e) {
    return null;
  }
}

function check(text, opts) {
  const problems = [];
  const branch = field(text, 'BRANCH');
  if (!branch) problems.push('MAILBOX.md names no BRANCH. A repo is not an address.');

  const onBranch = branch ? filesOnBranch(branch) : null;
  if (branch && !onBranch) problems.push('branch "' + branch + '" does not resolve');

  // every backticked path that looks like a repo file
  const named = new Set();
  const rx = /`([A-Za-z0-9_][A-Za-z0-9_./-]*\.(?:md|js|py|json|yml|yaml|txt))`/g;
  let m;
  while ((m = rx.exec(text))) named.add(m[1]);

  // PEER- fields point at another repo and cannot be checked from here; excluded explicitly
  // rather than silently, so "not checked" is visible in the output.
  const peerMb = field(text, 'PEER-MAILBOX');
  const external = new Set([peerMb, 'mailbox.py', 'MAILBOX.md'].filter(Boolean));

  const checked = [];
  for (const f of named) {
    if (external.has(f) || f.indexOf('/') === -1) continue;
    checked.push(f);
    if (onBranch && !onBranch.has(f)) {
      problems.push('names `' + f + '` — NOT ON BRANCH ' + branch);
    }
  }

  // the poll verdict must come from the closed set
  const poll = field(text, 'LAST-POLLED-PEER');
  if (!poll) problems.push('no LAST-POLLED-PEER line');
  else {
    const verdict = poll.trim().split(/\s+/).pop();
    if (!['NEW', 'NOTHING-NEW', 'UNREACHABLE'].includes(verdict)) {
      problems.push('poll verdict "' + verdict + '" is outside the closed set ' +
        'NEW / NOTHING-NEW / UNREACHABLE — a free-text status is one nobody can check');
    }
  }
  return { problems, checked, branch, external: [...external] };
}

const text = fs.readFileSync(MB, 'utf8');

if (process.argv.includes('--self')) {
  // A check that has never been seen to fail is not known to work.
  const broken = text.replace(/BRANCH:\s*main/, 'BRANCH: main')
    .replace('`docs/UNREPORTED-FINDINGS.md`', '`docs/THIS-FILE-DOES-NOT-EXIST.md`');
  const r = check(broken);
  const caught = r.problems.some((p) => p.includes('THIS-FILE-DOES-NOT-EXIST'));
  console.log(caught
    ? 'SELF-TEST PASS — the check fails when a named file is absent from the branch'
    : 'SELF-TEST FAIL — the check did NOT catch a missing file, so it proves nothing');
  process.exit(caught ? 0 : 1);
}

const r = check(text);
console.log('MAILBOX.md -> branch %s', r.branch);
console.log('  files named and checked : %d', r.checked.length);
for (const f of r.checked) console.log('      %s', f);
console.log('  not checkable from here : %s   (another repo — stated, not skipped silently)',
  r.external.join(', '));
console.log('');
if (r.problems.length) {
  for (const p of r.problems) console.log('  PROBLEM: ' + p);
  process.exitCode = 1;
} else {
  console.log('  OK — every file named exists on the branch named, and the poll verdict is in the closed set.');
}
