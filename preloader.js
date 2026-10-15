/*  Page preloader (home page), like usta.agency:
      - a black screen with a small, thin, wide-spaced "DYNASTYMAX 0%" in the middle
      - the number counts up with the page's real loading progress (images + page load),
        always easing smoothly towards it
      - at 100% the letters drop down and fade one after another (back-in ease, staggered),
        then the screen goes and 'dm:ready' starts the page's own animations (hero intro)
    Markup: .dm-preloader right after <body>; <html class="dm-loading"> from the head. */
(function () {
    'use strict';
    var root = document.documentElement;
    var el = document.querySelector('.dm-preloader');
    if (!el) { root.classList.remove('dm-loading'); return; }

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var countEl = el.querySelector('.dm-pl-count');
    var MIN_MS = 1200;           // the count always takes at least this long (never a blink)
    var MAX_WAIT = 8000;         // never hold the page longer than this
    var DROP_MS = 800, DROP_SPREAD = 500;   // each letter's fall, and the stagger across all letters
    var start = performance.now();

    /* ---------- real progress: page images + the page's load event ---------- */
    var target = 0, loaded = document.readyState === 'complete';
    window.addEventListener('load', function () { loaded = true; });
    function progress() {
        if (loaded || performance.now() - start > MAX_WAIT) return 100;
        var imgs = document.images, total = 0, done = 0;
        for (var i = 0; i < imgs.length; i++) {
            if (imgs[i].loading === 'lazy') continue;     // lazy images only load later on scroll
            total++;
            if (imgs[i].complete) done++;
        }
        var parsed = document.readyState === 'loading' ? 0 : 20;   // page parsed: first 20%
        return Math.min(95, parsed + (total ? done / total * 75 : 0));
    }

    /* ---------- the counter eases towards the progress ---------- */
    var shown = 0, last = start;
    function tick(now) {
        var dt = now - last;
        last = now;
        target = progress();
        // can't run ahead of the clock: at most 100% over MIN_MS
        var cap = Math.min(100, (now - start) / MIN_MS * 100);
        var goal = Math.min(target, cap);
        shown += (goal - shown) * Math.min(1, dt / 220);
        if (goal - shown < .4) shown = goal;
        countEl.textContent = Math.round(shown);
        if (shown >= 100) { countEl.textContent = '100'; setTimeout(drop, 180); return; }
        requestAnimationFrame(tick);
    }

    /* ---------- exit: the letters fall away one after another ---------- */
    function splitChars(node) {
        [].slice.call(node.childNodes).forEach(function (n) {
            if (n.nodeType === 3) {
                var frag = document.createDocumentFragment();
                n.textContent.split('').forEach(function (ch) {
                    var s = document.createElement('span');
                    s.className = 'dm-pl-ch';
                    s.textContent = ch;
                    frag.appendChild(s);
                });
                node.replaceChild(frag, n);
            } else if (n.nodeType === 1) {
                splitChars(n);
            }
        });
    }
    function drop() {
        var line = el.querySelector('.dm-pl-load');
        splitChars(line);
        var chars = line.querySelectorAll('.dm-pl-ch');
        [].forEach.call(chars, function (c, i) {
            c.style.transitionDelay = (chars.length > 1 ? i / (chars.length - 1) * DROP_SPREAD : 0) + 'ms';
        });
        void line.offsetWidth;                            // start from the resting state
        el.classList.add('is-dropping');
        setTimeout(finish, reduce ? 0 : DROP_MS + DROP_SPREAD);
    }
    function finish() {
        el.classList.add('is-leaving', 'is-gone');
        root.classList.remove('dm-loading');
        // tell the page its entrance animations can start now (main.js, hero-rocket.js ...)
        document.dispatchEvent(new Event('dm:ready'));
        setTimeout(function () { el.remove(); }, 400);
    }

    if (reduce) {
        // no counting show: open the page as soon as it has loaded
        var wait = function () { if (progress() >= 100) finish(); else setTimeout(wait, 100); };
        wait();
        return;
    }
    requestAnimationFrame(tick);
}());
