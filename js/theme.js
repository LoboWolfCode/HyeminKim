/* Theme cycler. Remembers the choice in localStorage across pages.
   To add a theme: add a palette block in styles.css under [data-theme='name']
   and add the name + label here. */

(function () {
  var THEMES = [
    { name: 'cream', label: 'CREAM' },
    { name: 'night', label: 'NIGHT' },
    { name: 'gameboy', label: 'GAMEBOY' },
    { name: 'crt', label: 'CRT' }
  ];

  var STORAGE_KEY = 'theme';

  function indexOfTheme(name) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].name === name) return i;
    }
    return -1;
  }

  function read() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function save(name) {
    try {
      localStorage.setItem(STORAGE_KEY, name);
    } catch (e) {
      /* private browsing — the theme just won't persist */
    }
  }

  // Default to night if the visitor's OS prefers dark and they've never chosen.
  function initialTheme() {
    var stored = read();
    if (stored && indexOfTheme(stored) !== -1) return stored;
    var prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'night' : 'cream';
  }

  var current = initialTheme();

  function apply(name) {
    current = name;
    document.documentElement.setAttribute('data-theme', name);
    var btn = document.getElementById('theme-switch');
    if (btn) {
      var i = indexOfTheme(name);
      btn.textContent = THEMES[i].label;
      btn.setAttribute('aria-label', 'Theme: ' + THEMES[i].label + '. Click for next theme.');
    }
  }

  // Set the attribute immediately so the page never flashes the wrong palette.
  document.documentElement.setAttribute('data-theme', current);

  document.addEventListener('DOMContentLoaded', function () {
    apply(current);

    var btn = document.getElementById('theme-switch');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var next = THEMES[(indexOfTheme(current) + 1) % THEMES.length].name;
      apply(next);
      save(next);
    });
  });
})();
