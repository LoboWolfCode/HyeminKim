/* Renders the optional on-page CV from window.CV_SECTIONS (see data/cv.js).
   When the list is empty the whole block stays hidden and only the PDF
   download + embed remain. */

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var mount = document.querySelector('[data-cv]');
    if (!mount) return;

    var sections = Array.isArray(window.CV_SECTIONS) ? window.CV_SECTIONS : [];
    if (!sections.length) {
      mount.hidden = true;
      return;
    }

    sections.forEach(function (section) {
      var wrap = document.createElement('section');
      wrap.className = 'cv-section';

      var h2 = document.createElement('h2');
      h2.textContent = section.heading || '';
      wrap.appendChild(h2);

      (section.entries || []).forEach(function (entry) {
        var row = document.createElement('div');
        row.className = 'cv-entry';

        var when = document.createElement('div');
        when.className = 'when';
        when.textContent = entry.when || '';

        var right = document.createElement('div');
        var what = document.createElement('div');
        what.className = 'what';
        what.textContent = entry.what || '';
        right.appendChild(what);

        if (entry.where) {
          var where = document.createElement('div');
          where.className = 'where';
          where.textContent = entry.where;
          right.appendChild(where);
        }

        row.appendChild(when);
        row.appendChild(right);
        wrap.appendChild(row);
      });

      mount.appendChild(wrap);
    });
  });
})();
