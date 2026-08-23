"""Build the Korean web font.

    python tools/make-korean-font.py

fonts/DOSIyagiBoldface.ttf is 3.2 MB, which is far too heavy to put on a web
page. This scans the site for the Korean characters that are ACTUALLY used, and
writes a WOFF2 containing only those glyphs — under a kilobyte.

Re-run it whenever you add or change Korean text on the site. If you forget,
nothing breaks: characters missing from the subset simply fall back to Galmuri,
which is also a Korean pixel font, so the text stays readable and on-theme.

Needs:  pip install fonttools brotli
"""
import io
import os
import sys

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit('fonttools is not installed. Run:  pip install fonttools brotli')

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))

SOURCE = os.path.join(ROOT, 'fonts', 'DOSIyagiBoldface.ttf')
OUTPUT = os.path.join(ROOT, 'fonts', 'DOSIyagi-subset.woff2')

# Directories that never contain site copy.
SKIP_DIRS = {'.git', 'lightbox', 'fonts', 'pixel', 'cv', 'tools', 'logo', 'cursor'}
SCAN_EXTS = ('.html', '.js')


def is_hangul(ch):
    return ('가' <= ch <= '힣'      # syllables
            or 'ᄀ' <= ch <= 'ᇿ'   # jamo
            or '㄰' <= ch <= '㆏')  # compatibility jamo


def collect():
    found = set()
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if not fn.endswith(SCAN_EXTS):
                continue
            # Throwaway preview pages aren't the real site, and their copy
            # (e.g. Korean font names) would bloat the subset.
            if fn.startswith('preview-'):
                continue
            path = os.path.join(dirpath, fn)
            try:
                text = io.open(path, encoding='utf-8').read()
            except (UnicodeDecodeError, OSError):
                continue
            for ch in text:
                if is_hangul(ch):
                    found.add(ch)
    return found


def main():
    if not os.path.isfile(SOURCE):
        sys.exit('Source font not found:\n  %s' % SOURCE)

    chars = collect()
    if not chars:
        sys.exit('No Korean characters found on the site — nothing to subset.')

    text = ''.join(sorted(chars))
    print('Korean characters in use (%d): %s' % (len(chars), text))

    options = subset.Options()
    options.flavor = 'woff2'
    options.desubroutinize = True
    # Keep the font Hangul-only. Latin must fall through to Press Start 2P and
    # Galmuri, so we deliberately do NOT keep any Latin glyphs here.
    options.layout_features = ['*']
    options.notdef_outline = False
    options.recalc_bounds = True

    font = TTFont(SOURCE)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    font.flavor = 'woff2'
    font.save(OUTPUT)

    before = os.path.getsize(SOURCE) / 1024.0 / 1024.0
    after = os.path.getsize(OUTPUT) / 1024.0

    print('\n%s\n  %.1f MB  ->  %s\n  %.1f KB   (%.3f%% of the original)'
          % (os.path.basename(SOURCE), before,
             os.path.basename(OUTPUT), after, 100 * (after / 1024.0) / before))


if __name__ == '__main__':
    main()
