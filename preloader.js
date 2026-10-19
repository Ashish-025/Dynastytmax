/*  Page preloader (home page), like usta.agency:
      - a black screen with a small, thin, wide-spaced "DYNASTYMAX 0%" in the middle
      - the number counts up with the page's loading progress (page parsed + fonts in),
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
    var phone = window.matchMedia && window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
    var countEl = el.querySelector('.dm-pl-count');
    var MIN_MS = phone ? 1000 : 1200;      // the count always takes at least this long (never a blink)
    var MAX_WAIT = phone ? 3500 : 6000;    // never hold the page longer than this
    var DROP_MS = phone ? 650 : 800, DROP_SPREAD = phone ? 350 : 500;   // each letter's fall, and the stagger across all letters
    var start = performance.now();

    /* ---------- progress: the page is ready once it is parsed and its fonts are in ----------
       (it used to wait for window 'load', i.e. every image and three.js - on a phone that held the
       counter for seconds; the images are below the hero and three.js now loads after on phones).
       Event-driven: nothing is polled per frame. */
    var domReady = document.readyState !== 'loading';
    var fontsReady = !document.fonts || document.fonts.status === 'loaded';
    var pageLoaded = document.readyState === 'complete';
    if (!domReady) document.addEventListener('DOMContentLoaded', function () { domReady = true; }, { once: true });
    if (!fontsReady) document.fonts.ready.then(function () { fontsReady = true; });
    if (!pageLoaded) window.addEventListener('load', function () { pageLoaded = true; }, { once: true });
    function progress(now) {
        if (pageLoaded || (domReady && fontsReady) || now - start > MAX_WAIT) return 100;
        // still parsing: creep towards 70% (or 90% once parsed) so the number keeps moving
        var ceil = domReady ? 90 : 70;
        return ceil * (1 - Math.exp(-(now - start) / 900));
    }

    /* ---------- the counter eases towards the progress ---------- */
    var shown = 0, last = start, drawn = -1, done = false, pulse = 0;
    // driven by animation frames AND a light 50ms timer: whichever comes first moves the count, so a
    // phone that throttles animation frames (low-power mode, a busy first load) never stalls it
    function step(now) {
        if (done) return;
        var dt = Math.min(64, now - last);     // a long frame (busy phone) must not make it jump
        if (dt <= 0) return;
        last = now;
        // can't run ahead of the clock: at most 100% over MIN_MS
        var cap = Math.min(100, (now - start) / MIN_MS * 100);
        var goal = Math.min(progress(now), cap);
        shown += (goal - shown) * Math.min(1, dt / 160);
        if (goal - shown < 1) shown = goal;
        if (goal >= 100 && now - start > MIN_MS + 500) shown = 100;   // never hang on 99
        var n = Math.round(shown);
        if (n !== drawn) { countEl.textContent = n; drawn = n; }   // only touch the DOM when it changes
        if (shown >= 100) { done = true; clearInterval(pulse); countEl.textContent = 100; setTimeout(drop, 150); }
    }
    function tick(now) { step(now); if (!done) requestAnimationFrame(tick); }

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
    var dropped = false;
    function drop() {
        if (dropped) return;
        dropped = true;
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
        var wait = function () { if (progress(performance.now()) >= 100) finish(); else setTimeout(wait, 100); };
        wait();
        return;
    }
    requestAnimationFrame(tick);
    pulse = setInterval(function () { step(performance.now()); }, 50);
    // backstop: if animation frames are starved (busy or background tab), open the page anyway
    setTimeout(function () { if (!dropped) { countEl.textContent = 100; drop(); } }, MAX_WAIT + 1500);
}());
