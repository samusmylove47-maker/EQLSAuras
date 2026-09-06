"""SWEEP THE ESTATE FOR THE CRLF/$-ANCHOR DEFECT CLASS.

WHY. Two sessions independently shipped the same fault against the same Windows-generated corpus:
Session E's gap engine 1.3.0 returned ZERO events on a CRLF log because `(.*)$` cannot match past
a carriage return; my seam tool v1 carried the identical pattern and returned 25% of the corpus
while reporting it as the whole. Same regex, same anchor, same language, five days apart, neither
found the other.

THE FAILURE MODES ARE OPPOSITE AND THAT IS WHY. A tool that reads NOTHING announces itself. A tool
that reads a QUARTER looks like a tool that works.

WHAT COUNTS AS A CANDIDATE, wider than the literal string:
  JS/TS   a regex literal anchored with `$` and no /m flag           -- `.` never matches \r
          `.split('\n')` with no \r handling                          -- leaves \r on every line
  PYTHON  mostly safe: text-mode read translates newlines. NOT SAFE:
          open(..., 'rb') then regex, or re applied to bytes          -- no translation
          .split(b'\n') / .split('\n') on binary-read content

Read-only. Emits JSON so a second pass can judge reachability and corpus.

  python scripts/crlf-class-sweep.py <repo-list-file>
"""
import json
import os
import re
import subprocess
import sys

# a JS regex literal that ends with an anchor, capturing any flags that follow
JS_ANCHORED = re.compile(r'/(?:[^/\\\n]|\\.)*\$/([gimsuyd]*)')
JS_SPLIT_N = re.compile(r"\.split\(\s*['\"]\\n['\"]\s*\)")
PY_BINARY_OPEN = re.compile(r"open\([^)]*['\"]rb['\"]")
PY_BYTES_RE = re.compile(r"re\.(?:match|search|findall|finditer|sub|split)\(\s*rb['\"]")
PY_SPLIT_BYTES = re.compile(r"\.split\(\s*b['\"]\\n['\"]\s*\)")

CODE_EXT = ('.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py')
SKIP_DIR = ('node_modules/', 'dist/', 'build/', '.min.', 'package-lock',
            'bundle/', 'vendor/', 'archive/')


def files_at(remote, ref):
    out = subprocess.run(['git', 'ls-tree', '-r', '--name-only', ref],
                         capture_output=True, text=True, cwd=os.getcwd())
    if out.returncode:
        return []
    keep = []
    for p in out.stdout.splitlines():
        if not p.endswith(CODE_EXT):
            continue
        if any(s in p for s in SKIP_DIR):
            continue
        keep.append(p)
    return keep


def blob(ref, path):
    out = subprocess.run(['git', 'show', '%s:%s' % (ref, path)],
                         capture_output=True, text=True, cwd=os.getcwd(),
                         errors='replace')
    return out.stdout if out.returncode == 0 else ''


def scan(repo, ref, path, text):
    hits = []
    lang = 'python' if path.endswith('.py') else 'javascript'
    for i, line in enumerate(text.splitlines(), 1):
        s = line.strip()
        if s.startswith(('#', '//', '*')):
            continue
        if lang == 'javascript':
            for m in JS_ANCHORED.finditer(line):
                flags = m.group(1) or ''
                if 'm' not in flags:
                    hits.append(dict(repo=repo, ref=ref, file=path, line=i, lang=lang,
                                     kind='anchored-regex-no-m',
                                     snippet=s[:150]))
                    break
            if JS_SPLIT_N.search(line):
                hits.append(dict(repo=repo, ref=ref, file=path, line=i, lang=lang,
                                 kind='split-on-bare-\\n', snippet=s[:150]))
        else:
            for rx, kind in ((PY_BINARY_OPEN, 'python-binary-open'),
                             (PY_BYTES_RE, 'python-bytes-regex'),
                             (PY_SPLIT_BYTES, 'python-split-bytes-\\n')):
                if rx.search(line):
                    hits.append(dict(repo=repo, ref=ref, file=path, line=i, lang=lang,
                                     kind=kind, snippet=s[:150]))
    return hits


def main():
    repos = []
    for raw in open(sys.argv[1], encoding='utf-8'):
        raw = raw.strip()
        if not raw or raw.startswith('#'):
            continue
        name, ref = raw.split()
        repos.append((name, ref))

    allhits = []
    for name, ref in repos:
        fs = files_at(name, ref)
        n = 0
        for p in fs:
            t = blob(ref, p)
            if not t:
                continue
            h = scan(name, ref, p, t)
            allhits.extend(h)
            n += len(h)
        print('  %-24s %s  %4d code files  %3d candidates' % (name, ref[:8], len(fs), n),
              file=sys.stderr)

    by_kind = {}
    for h in allhits:
        by_kind[h['kind']] = by_kind.get(h['kind'], 0) + 1
    print('', file=sys.stderr)
    print('  BY KIND:', file=sys.stderr)
    for k, v in sorted(by_kind.items(), key=lambda x: -x[1]):
        print('    %-28s %d' % (k, v), file=sys.stderr)

    json.dump(allhits, sys.stdout, indent=1)
    return 0


if __name__ == '__main__':
    sys.exit(main())
