"""Generate gallery thumbnails from the full-size artwork.

    python tools/make-thumbs.py

Reads every image in  pixel/  and writes a smaller copy into  pixel/thumbs/  .
The gallery grid shows the thumbnail; the full-size original is loaded only
when someone clicks a piece open, so the page stays light.

Re-run after adding artwork. Thumbnails newer than their original are skipped,
so running it again is cheap. Needs Pillow:  pip install pillow

Note: this deliberately does NOT try to downsample to the artwork's "native"
pixel grid. That sounds appealing for pixel art, but detecting the grid is
unreliable on JPEG exports and guessing wrong quietly destroys fine detail.
Resampling to a safe display size never does.
"""
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow is not installed. Run:  pip install pillow')

HERE = os.path.dirname(os.path.abspath(__file__))
PIXDIR = os.path.normpath(os.path.join(HERE, '..', 'pixel'))
OUTDIR = os.path.join(PIXDIR, 'thumbs')

# Cards render at roughly 340 CSS px, so 700 stays sharp on 2x retina screens.
MAX_SIDE = 700
QUALITY = 90
EXTS = ('.png', '.jpg', '.jpeg', '.gif', '.webp')


def main():
    if not os.path.isdir(PIXDIR):
        sys.exit('No pixel/ folder found.')
    os.makedirs(OUTDIR, exist_ok=True)

    made = skipped = 0
    saved_kb = 0.0

    for fn in sorted(os.listdir(PIXDIR)):
        if not fn.lower().endswith(EXTS):
            continue
        src = os.path.join(PIXDIR, fn)
        if not os.path.isfile(src):
            continue

        out = os.path.join(OUTDIR, os.path.splitext(fn)[0] + '.webp')

        if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
            skipped += 1
            continue

        img = Image.open(src)

        # Animated GIFs pass through untouched — resizing would flatten the
        # animation, and pixel-art GIFs are small already.
        if getattr(img, 'is_animated', False):
            print('skip (animated): %s' % fn)
            continue

        img = img.convert('RGBA' if 'A' in img.getbands() else 'RGB')
        w, h = img.size

        if max(w, h) > MAX_SIDE:
            scale = MAX_SIDE / float(max(w, h))
            # LANCZOS keeps fine linework — the thin tentacles and sparkles —
            # that NEAREST would drop entirely at this reduction.
            img = img.resize((max(1, round(w * scale)), max(1, round(h * scale))),
                             Image.LANCZOS)

        img.save(out, 'WEBP', quality=QUALITY, method=6)

        before = os.path.getsize(src) / 1024.0
        after = os.path.getsize(out) / 1024.0
        saved_kb += before - after
        made += 1
        print('%-20s %5dx%-5d -> %4dx%-4d  %6.0f KB -> %5.0f KB'
              % (fn, w, h, img.size[0], img.size[1], before, after))

    # Renaming an artwork leaves its old thumbnail behind. Drop any thumbnail
    # whose original is gone, so the folder can't drift out of sync.
    originals = set()
    for fn in os.listdir(PIXDIR):
        if fn.lower().endswith(EXTS) and os.path.isfile(os.path.join(PIXDIR, fn)):
            originals.add(os.path.splitext(fn)[0])

    removed = 0
    for fn in sorted(os.listdir(OUTDIR)):
        if not fn.lower().endswith('.webp'):
            continue
        if os.path.splitext(fn)[0] not in originals:
            os.remove(os.path.join(OUTDIR, fn))
            print('removed orphan: %s' % fn)
            removed += 1

    print('\n%d written, %d already current, %d orphan(s) removed.'
          % (made, skipped, removed))
    if saved_kb > 0:
        print('Saved %.0f KB per full gallery load.' % saved_kb)


if __name__ == '__main__':
    main()
