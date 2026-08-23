# Hyemin Kim — Pixel Art Portfolio

A plain static site. No build step, no npm install. Open `index.html` in a
browser, or drop the whole folder on any host.

## Adding artwork

1. **Name the file after the artwork, using underscores for spaces.**
   `Tidal_Glow.jpg` shows up on the site as "Tidal Glow".
2. Save it into the **`pixel/`** folder (PNG, JPG or GIF, any size).
3. Open **`data/pixel-art.js`** and add a line at the top of the list:

   ```js
   { file: 'Tidal_Glow.jpg', featured: true },
   ```
4. Run `python tools/make-thumbs.py` (see below).
5. Save and refresh.

That is the whole thing — `file` is the only required field, because the title
comes from the filename. If you ever want a caption that differs from the
filename, add `title: 'Something Else'` and it wins.

The fuller form, when you want it:

```js
{ file: 'Tidal_Glow.jpg', year: 2026, tags: ['scenes'], featured: true },
```

The filter buttons on the gallery page build themselves from whatever `tags`
you actually use, so a new tag just appears as a new button. With no tags on
anything, the filter bar hides itself.

The first piece with `featured: true` is also the big image on the home page.

**Renaming a piece?** Change the filename and the `file:` line to match, then
re-run `tools/make-thumbs.py` — it deletes the thumbnail under the old name.

## Thumbnails

Full-size artwork is often several MB. `tools/make-thumbs.py` writes a 700px
copy of each piece into `pixel/thumbs/`, which is what the gallery grid loads —
the full-size original is fetched only when someone clicks a piece open.

```
pip install pillow          # once
python tools/make-thumbs.py # after adding artwork
```

It skips thumbnails that are already up to date, so re-running is cheap. If you
forget to run it, the gallery still works — it just falls back to loading the
full-size file.

## The CV

- The PDF lives in `cv/`. Both the download button and the embedded viewer on
  `pages/cv.html` point at `cv/Hyemin Kim CV_2026.pdf`. Swap in a newer file
  and update those two links in `pages/cv.html`.
- Optionally, fill in `data/cv.js` to also render a pixel-styled CV on the page
  itself (better on phones, and readable by search engines). While that file's
  list is empty the on-page block stays hidden.

## Themes

Four palettes, cycled by the button in the nav bar and remembered per visitor:
`cream`, `night`, `gameboy`, `crt`. First-time visitors get `night` if their
system is set to dark mode, otherwise `cream`.

To add one: copy a `[data-theme='...']` block in `styles.css`, change the
colours, and add its name to the `THEMES` list at the top of `js/theme.js`.

## Korean font

Korean text uses **DOS Iyagi Boldface**, a 16px Korean bitmap font. Latin keeps
using Press Start 2P.

The source font `fonts/DOSIyagiBoldface.ttf` is 3.2 MB — far too heavy for
a web page. `tools/make-korean-font.py` scans the site for the Korean characters
actually used and writes a WOFF2 with only those glyphs:

```
pip install fonttools brotli     # once
python tools/make-korean-font.py # after changing Korean text
```

Currently that's 9 characters and **0.9 KB**, down from 3.2 MB.

Two things to know:

- **Re-run it if you add Korean text**, or the new characters won't be in the
  subset. Nothing breaks if you forget — they fall back to Galmuri, which is
  also a Korean pixel font, so text stays readable and on-theme.
- Wrap Korean runs in `<span class="kr">`. The font is a 16px bitmap, so it is
  only crisp at 16px and multiples; `.kr` pins that size. Without the span,
  Korean inherits the surrounding 11–14px Latin size and goes soft.

The `@font-face` uses `unicode-range` to restrict the font to Hangul, which is
why `'DOSIyagi'` can sit first in every font stack without ever affecting Latin.


## Motion

Five ambient effects, in `js/motion.js` and the MOTION section at the bottom of
`styles.css`:

| Effect | Where it lives |
| --- | --- |
| Rising bubbles | `js/motion.js` builds them; `.bubble` / `@keyframes rise` |
| Cards bob | CSS only — `.motion .gallery-card` |
| Scroll reveal | Add `class="reveal"` to anything; JS reveals it on scroll |
| Hover sweep | CSS only — `.gallery-card .thumb::after` |
| Typewriter | Add `data-typed` to an element (currently the home page name) |

To reveal a new section on scroll, just add `reveal` to its class list —
gallery cards are picked up automatically as they're built.

Two things worth preserving if you edit this:

- `motion.js` loads in `<head>` **without `defer`**, like `theme.js`, so
  `<html class="motion">` is set before first paint. Deferring it makes
  revealed elements flash in and then hide.
- Everything that hides content is scoped under `.motion`, which only the
  script adds. If the JS fails to load, the page renders complete and static
  rather than blank. There's also a 2.5s failsafe that reveals everything
  regardless. Don't remove either safeguard.

Visitors whose system asks for reduced motion get none of it — `motion.js`
returns early, so there are no bubbles, no bobbing and no typing.

To turn the whole thing off, delete the four `motion.js` script tags (one per
page) — or just delete `js/motion.js`. Either way the CSS alone hides nothing,
because `.motion` never gets added.

## Contact form

Handled by Formspree — the form posts to `https://formspree.io/f/xdkozqgo`.
Submissions land in whichever inbox that Formspree form is configured for.

## Layout

```
index.html            home — hero + selected work
pages/gallery.html    full gallery with tag filters
pages/cv.html         CV download + embedded PDF
pages/contact.html    contact form
data/pixel-art.js     >>> the artwork list — edit this one
data/cv.js            optional on-page CV content
js/theme.js           theme cycler
js/motion.js          bubbles, scroll reveal, typewriter
js/gallery.js         builds the gallery from the artwork list
js/cv.js              builds the on-page CV
styles.css            all styling, themes at the top
pixel/                the artwork itself
pixel/thumbs/         generated — do not edit by hand
tools/make-thumbs.py  regenerates pixel/thumbs/
fonts/DOSIyagi-subset.woff2   the only font file the site serves
fonts/DOSIyagiBoldface.ttf    source for the subset (not served)
tools/make-korean-font.py     rebuilds the Korean subset
cv/                   CV PDFs
lightbox/             vendored lightbox2 (full-size image viewer)
```
