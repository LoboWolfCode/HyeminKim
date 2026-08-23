/* Ambient motion: rising bubbles, scroll reveal, typewriter hero.
   (Card bob and the hover sweep are pure CSS — see styles.css.)

   Everything here is additive and fails open: the reveal styles only apply
   while <html> carries the "motion" class, which only this script adds. If the
   script never runs, the page renders exactly as it would without it — nothing
   is left invisible.

   Load it in <head> WITHOUT defer, like theme.js, so the class is set before
   first paint and revealed elements don't flash in and then hide. */

(function () {
  var root = document.documentElement;

  var reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Someone who asked for less motion gets none of it — no class, no bubbles,
  // no typing. The page is simply static.
  if (reduced) return;

  root.classList.add('motion');

  var BUBBLE_COUNT = 20;

  function makeBubbles() {
    var layer = document.createElement('div');
    layer.className = 'fx-layer';
    layer.setAttribute('aria-hidden', 'true');

    for (var i = 0; i < BUBBLE_COUNT; i++) {
      var b = document.createElement('div');
      b.className = 'bubble';
      var size = 3 + Math.floor(Math.random() * 4) * 2;
      b.style.width = size + 'px';
      b.style.height = size + 'px';
      b.style.left = Math.random() * 100 + '%';
      b.style.setProperty('--drift', Math.random() * 80 - 40 + 'px');
      b.style.animationDuration = 11 + Math.random() * 16 + 's';
      // Negative delay starts each one mid-flight, so the screen isn't empty
      // for the first few seconds after load.
      b.style.animationDelay = '-' + Math.random() * 20 + 's';
      layer.appendChild(b);
    }
    document.body.appendChild(layer);
  }

  /* ---- scroll reveal ---------------------------------------------------- */

  var io = null;

  function reveal(node) {
    node.classList.add('seen');
  }

  function revealAll() {
    var nodes = document.querySelectorAll('.reveal');
    for (var i = 0; i < nodes.length; i++) reveal(nodes[i]);
  }

  function observe(node) {
    if (!node.classList.contains('reveal')) node.classList.add('reveal');
    if (io) {
      io.observe(node);
    } else {
      reveal(node);
    }
  }

  function setupReveal() {
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              reveal(e.target);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
    }

    var marked = document.querySelectorAll('.reveal');
    for (var i = 0; i < marked.length; i++) observe(marked[i]);

    // gallery.js builds cards after this runs, and rebuilds them whenever a
    // filter is clicked. Catch them as they appear rather than coupling the
    // two scripts together.
    if ('MutationObserver' in window) {
      new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          for (var i = 0; i < m.addedNodes.length; i++) {
            var n = m.addedNodes[i];
            if (n.nodeType === 1 && n.classList.contains('gallery-card')) observe(n);
          }
        });
      }).observe(document.body, { childList: true, subtree: true });
    }

    // Failsafe. Whatever happened above, nothing stays hidden.
    setTimeout(revealAll, 2500);
  }

  /* ---- typewriter ------------------------------------------------------- */

  function typewriter() {
    var el = document.querySelector('[data-typed]');
    if (!el) return;

    var full = el.textContent;
    el.classList.add('typing');
    el.textContent = '';

    var n = 0;
    (function step() {
      el.textContent = full.slice(0, ++n);
      if (n < full.length) {
        setTimeout(step, 110);
      } else {
        el.classList.remove('typing');
      }
    })();
  }

  function init() {
    makeBubbles();
    setupReveal();
    setTimeout(typewriter, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
