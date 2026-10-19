/*  "Trusted by" band (styles in trusted-band.css): each row's tiles are repeated until the row
    is at least twice the band's width, then the whole set is doubled, so the CSS drift
    (translateX -50%) wraps without a gap. Copies are hidden from screen readers and the
    keyboard. Re-run on resize in case the band got wider.
    The band is far down the page, so this waits until the page is ready and the browser is idle:
    measuring the rows while the page is still being built forced full layouts that froze the
    preloader's count. Rows only start drifting once they are filled (.is-ready). */
(function () {
    'use strict';
    var band = document.querySelector('.tb-viewport');
    if (!band) return;
    var rows = [].slice.call(band.querySelectorAll('.tb-row'));

    rows.forEach(function (row) { row._orig = [].slice.call(row.children); });

    function copies(nodes) {
        var frag = document.createDocumentFragment();
        nodes.forEach(function (n) {
            var c = n.cloneNode(true);
            c.setAttribute('aria-hidden', 'true');
            c.setAttribute('tabindex', '-1');
            frag.appendChild(c);
        });
        return frag;
    }
    function fill() {
        // 1. back to the original tiles (writes only)
        rows.forEach(function (row) { while (row.children.length > row._orig.length) row.removeChild(row.lastChild); });
        // 2. measure every row in one go (a single layout)
        var need = band.offsetWidth;
        var spans = rows.map(function (row) { return row.scrollWidth; });
        // 3. then add the copies (writes only): repeat until one half covers the band, then double it
        rows.forEach(function (row, i) {
            if (!spans[i]) return;
            var reps = Math.max(1, Math.ceil(need / spans[i]));
            var half = [];
            for (var r = 0; r < reps; r++) half = half.concat(row._orig);
            if (reps > 1) row.appendChild(copies(half.slice(row._orig.length)));
            row.appendChild(copies(half));
        });
        band.classList.add('is-ready');
    }

    function whenIdle(fn) {
        if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 1500 });
        else setTimeout(fn, 200);
    }
    function start() { whenIdle(fill); }
    if (document.documentElement.classList.contains('dm-loading')) document.addEventListener('dm:ready', start, { once: true });
    else if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    var t = 0;
    window.addEventListener('resize', function () {
        if (!band.classList.contains('is-ready')) return;
        clearTimeout(t);
        t = setTimeout(fill, 250);
    });
}());
