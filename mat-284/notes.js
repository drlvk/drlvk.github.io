/* ============================================================
   Lecture notes — shared behavior
   Used by every lecture page in this folder.

   Load it in <head>, BEFORE the MathJax script, and without
   defer or async — it has to set window.MathJax first:

     <script src="notes.js"></script>
     <script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.js"></script>
   ============================================================ */


/* Runs immediately, before the body paints, so the stylesheet can
   hide solutions until they're collapsed. */
document.documentElement.className += ' js';


/* MathJax configuration.
   '$' is deliberately NOT a math delimiter — these notes are full of
   dollar amounts. Write inline math as \( ... \) and display math as
   \[ ... \]. displayAlign:left both matches how the math is written on
   the board and avoids MathJax measuring width inside a hidden panel. */
window.MathJax = {
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']],
    processEscapes: true
  },
  chtml: { displayAlign: 'left', displayIndent: '0' },
  options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] }
};


document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('toggle-all');

  function all() {
    return Array.prototype.slice.call(document.querySelectorAll('details.sol'));
  }

  function syncButton() {
    if (!btn) return;
    var anyOpen = all().some(function (d) { return d.open; });
    btn.textContent = anyOpen ? 'Hide all solutions' : 'Show all solutions';
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var anyOpen = all().some(function (d) { return d.open; });
      all().forEach(function (d) { d.open = !anyOpen; });
      syncButton();
    });
  }

  all().forEach(function (d) { d.addEventListener('toggle', syncButton); });

  /* Start in study mode: problems visible, solutions collapsed.
     Done after MathJax finishes so nothing is measured while hidden. */
  var settled = false;
  function collapseAll() {
    if (settled) return;
    settled = true;
    all().forEach(function (d) { d.open = false; });
    document.documentElement.className += ' ready';
    syncButton();
  }

  if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
    window.MathJax.startup.promise.then(collapseAll).catch(collapseAll);
  }
  /* If MathJax is slow or blocked, don't leave the page in limbo. */
  window.addEventListener('load', function () { setTimeout(collapseAll, 1200); });

  /* Printing gives the complete notes, not the study version. */
  var reopened = [];
  window.addEventListener('beforeprint', function () {
    reopened = all().filter(function (d) { return !d.open; });
    reopened.forEach(function (d) { d.open = true; });
  });
  window.addEventListener('afterprint', function () {
    reopened.forEach(function (d) { d.open = false; });
    reopened = [];
    syncButton();
  });
});
