/* Renders the gallery from window.PIXEL_ART (see data/pixel-art.js).

   Mount points, both optional per page:
     [data-gallery]  - full grid, plus [data-filters] for the tag buttons
     [data-featured] - home page strip, shows items marked featured:true

   Paths are resolved against <html data-root="..."> so the same script works
   from the site root and from pages/. */

(function () {
  var root = document.documentElement.getAttribute('data-root') || '';
  var items = Array.isArray(window.PIXEL_ART) ? window.PIXEL_ART : [];

  // Title defaults to the filename with underscores as spaces, so naming a
  // file Tidal_Glow.jpg is enough — no need to repeat the title in the entry.
  function titleOf(item) {
    if (item.title) return item.title;
    return item.file.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
  }

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  // Thumbnails live in pixel/thumbs/ as .webp (see tools/make-thumbs.py).
  // If one hasn't been generated, fall back to the full-size original so the
  // gallery still works without running the script.
  function withThumb(img, file) {
    var full = root + 'pixel/' + file;
    img.src = root + 'pixel/thumbs/' + file.replace(/\.[^.]+$/, '') + '.webp';
    img.addEventListener('error', function onError() {
      img.removeEventListener('error', onError);
      img.src = full;
    });
    return full;
  }

  // Nearest-neighbour is what makes pixel art crisp — but only when blowing an
  // image UP. Applied while shrinking a 3000px export into a 300px card it
  // just drops most of the pixels and makes fine linework shimmer.
  function setScalingMode(img) {
    function decide() {
      var shown = img.clientWidth;
      if (!shown || !img.naturalWidth) return;
      img.classList.toggle('is-upscaled', img.naturalWidth <= shown);
    }
    if (img.complete) decide();
    img.addEventListener('load', decide);

    // Re-measure whenever the element is resized — the lightbox animates its
    // frame open, and the viewport can change under us.
    if ('ResizeObserver' in window) {
      new ResizeObserver(decide).observe(img);
    }
  }

  // The lightbox <img> is created by lightbox2 and reused across openings, so
  // watch for it instead of wiring it up at build time. Without this the
  // full-size view would use nearest-neighbour even when shrinking a 6000px
  // export down to fit the screen, which aliases the artwork badly.
  function watchLightbox() {
    if (!('MutationObserver' in window)) return;
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        for (var i = 0; i < m.addedNodes.length; i++) {
          var n = m.addedNodes[i];
          if (n.nodeType !== 1) continue;
          var img = n.classList && n.classList.contains('lb-image')
            ? n
            : n.querySelector && n.querySelector('.lb-image');
          if (img && !img.dataset.scaled) {
            img.dataset.scaled = '1';
            img.classList.add('pixel-img');
            setScalingMode(img);
          }
        }
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  function emptyState(message) {
    var box = el('div', 'gallery-empty');
    box.innerHTML = message;
    return box;
  }

  // One card: checkerboard thumb linking into the lightbox, title + year below.
  function card(item, lightboxGroup) {
    var name = titleOf(item);
    var caption = name + (item.note ? ' — ' + item.note : '');

    var article = el('article', 'gallery-card');

    var img = el('img', 'pixel-img');
    img.alt = name;
    img.loading = 'lazy';
    // The card shows the thumbnail; the lightbox opens the full-size original.
    var full = withThumb(img, item.file);
    setScalingMode(img);

    var link = el('a', 'thumb');
    link.href = full;
    link.setAttribute('data-lightbox', lightboxGroup);
    link.setAttribute('data-title', caption);
    link.appendChild(img);

    var meta = el('div', 'meta');
    var title = el('span', 'title');
    title.textContent = name;
    meta.appendChild(title);

    var subParts = [];
    if (item.year) subParts.push(item.year);
    if (item.tags && item.tags.length) subParts.push(item.tags.join(' / '));
    if (subParts.length) {
      var sub = el('span', 'sub');
      sub.textContent = subParts.join('  ·  ');
      meta.appendChild(sub);
    }

    article.appendChild(link);
    article.appendChild(meta);
    return article;
  }

  function renderGrid(grid, list) {
    grid.innerHTML = '';
    if (!list.length) {
      grid.appendChild(emptyState('Nothing here yet.'));
      return;
    }
    list.forEach(function (item) {
      grid.appendChild(card(item, 'gallery'));
    });
  }

  function uniqueTags(list) {
    var seen = {};
    var tags = [];
    list.forEach(function (item) {
      (item.tags || []).forEach(function (tag) {
        if (!seen[tag]) {
          seen[tag] = true;
          tags.push(tag);
        }
      });
    });
    return tags.sort();
  }

  function buildFilters(container, grid) {
    var tags = uniqueTags(items);
    // Nothing to filter by if every piece is untagged — hide the whole bar
    // rather than leaving an empty gap above the grid.
    if (!tags.length) {
      container.hidden = true;
      return;
    }

    var all = ['all'].concat(tags);
    all.forEach(function (tag) {
      var btn = el('button', 'filter-btn');
      btn.type = 'button';
      btn.textContent = tag.toUpperCase();
      btn.setAttribute('aria-pressed', tag === 'all' ? 'true' : 'false');

      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(container.children, function (other) {
          other.setAttribute('aria-pressed', 'false');
        });
        btn.setAttribute('aria-pressed', 'true');

        var filtered =
          tag === 'all'
            ? items
            : items.filter(function (item) {
                return (item.tags || []).indexOf(tag) !== -1;
              });
        renderGrid(grid, filtered);
      });

      container.appendChild(btn);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    watchLightbox();

    var grid = document.querySelector('[data-gallery]');
    if (grid) {
      if (!items.length) {
        grid.appendChild(
          emptyState(
            'No artwork yet.<br><br>Add pieces to <code>data/pixel-art.js</code>.'
          )
        );
      } else {
        renderGrid(grid, items);
        var filters = document.querySelector('[data-filters]');
        if (filters) buildFilters(filters, grid);
      }
    }

    // Big home page image: the pinned profile picture if one is set, otherwise
    // the newest featured artwork. Pinning is what keeps it from being bumped
    // every time new work is added to the top of the list.
    var hero = document.querySelector('[data-hero]');
    var profile = window.PIXEL_PROFILE;

    if (hero && (profile || items.length)) {
      var lead = profile || items.filter(function (item) {
        return item.featured;
      })[0] || items[0];

      var heroImg = hero.querySelector('img');
      var heroCap = hero.querySelector('figcaption');

      if (heroImg) {
        heroImg.alt = profile ? 'Hyemin Kim' : titleOf(lead);
        withThumb(heroImg, lead.file);
        setScalingMode(heroImg);
      }

      if (heroCap) {
        // A profile picture only gets a caption if one is written for it;
        // artwork falls back to its title.
        var cap = profile ? profile.caption : titleOf(lead);
        if (cap) {
          heroCap.textContent = cap;
        } else {
          heroCap.hidden = true;
        }
      }
    }

    var strip = document.querySelector('[data-featured]');
    if (strip) {
      var featured = items.filter(function (item) {
        return item.featured;
      });
      // Fall back to the newest few so the home page is never blank.
      if (!featured.length) featured = items.slice(0, 3);
      featured.slice(0, 6).forEach(function (item) {
        strip.appendChild(card(item, 'featured'));
      });
    }
  });
})();
