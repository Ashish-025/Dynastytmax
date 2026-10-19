/*  "Trusted by" band (styles in trusted-band.css): each row's tiles are repeated until the row
    is at least twice the band's width, then the whole set is doubled, so the CSS drift
    (translateX -50%) wraps without a gap. Copies are hidden from screen readers and the
    keyboard. Re-run on resize in case the band got wider. */
(function () {
    'use strict';
    var band = document.querySelector('.tb-viewport');
    if (!band) return;
    var rows = [].slice.call(band.querySelectorAll('.tb-row'));

    rows.forEach(function (row) { row._orig = [].slice.call(row.children); });

    function copy(nodes, row) {
        var frag = document.createDocumentFragment();
        nodes.forEach(function (n) {
            var c = n.cloneNode(true);
            c.setAttribute('aria-hidden', 'true');
            c.setAttribute('tabindex', '-1');
            frag.appendChild(c);
        });
        row.appendChild(frag);
    }
    function fill() {
        var need = band.offsetWidth;
        rows.forEach(function (row) {
            // back to the original tiles, then repeat them until one half covers the band
            while (row.children.length > row._orig.length) row.removeChild(row.lastChild);
            var span = row.scrollWidth;
            if (!span) return;
            var reps = Math.max(1, Math.ceil(need / span));
            for (var i = 1; i < reps; i++) copy(row._orig, row);
            copy([].slice.call(row.children), row);   // second half = exact copy of the first
        });
    }
    fill();
    var t = 0;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fill, 250); });
}());
