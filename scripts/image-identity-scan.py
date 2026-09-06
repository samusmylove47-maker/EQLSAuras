"""Scan the release images for REAL-WORLD IDENTITY, which is a different search from the
character-name search already done.

The owner's line: character names, play dates and in-game figures are fine. Real-world identity
is not. So this looks for Windows usernames, home paths, emails, Discord handles, the owner's
real name, UNC/machine names and log filenames -- none of which a character-name search finds.

Prints a CONTROL result on a synthetic string, because a scanner that matches nothing and a
scanner that is broken produce the same output.
"""
import os
import re
import sys

PATS = {
    'windows user path': rb'[Cc]:[\\/]{1,2}[Uu]sers[\\/]{1,2}[A-Za-z0-9._-]+',
    'unix home path':    rb'/home/[A-Za-z0-9._-]+',
    'email':             rb'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',
    'discord':           rb'(?i)discord',
    'owner real name':   rb'(?i)lindsey',
    'unc or machine':    rb'\\\\[A-Za-z0-9-]{3,}\\',
    'appdata':           rb'(?i)appdata',
    'eqlog filename':    rb'(?i)eqlog_[A-Za-z]+',
    'users dir plain':   rb'(?i)users[\\/][A-Za-z0-9._-]{3,}',
}


def main():
    d = sys.argv[1]
    files = sorted(x for x in os.listdir(d) if x.lower().endswith(('.png', '.jpg')))
    print('scanning %d files' % len(files))
    hit = False
    for n in files:
        b = open(os.path.join(d, n), 'rb').read()
        for label, p in PATS.items():
            m = re.findall(p, b)
            if m:
                hit = True
                print('  HIT  %-22s %-18s %s' % (n, label, [x[:60] for x in m[:3]]))
    if not hit:
        print('  NO REAL-WORLD IDENTITY MARKER FOUND in any file.')

    probe = (b'here is C:\\Users\\Lindsey\\Desktop and /home/lindsey and a@b.com '
             b'and discord.gg/xyz and \\\\DESKTOP-A1B2\\share and AppData and '
             b'eqlog_Shara_rivervale.txt')
    matched = [l for l, p in PATS.items() if re.search(p, probe)]
    print('')
    print('  CONTROL, synthetic string: %d of %d pattern classes matched' % (len(matched), len(PATS)))
    print('  matched: %s' % ', '.join(matched))
    missed = [l for l in PATS if l not in matched]
    if missed:
        print('  NOT EXERCISED BY THE CONTROL (so a clean result proves less for these): %s'
              % ', '.join(missed))
    return 0


if __name__ == '__main__':
    sys.exit(main())
