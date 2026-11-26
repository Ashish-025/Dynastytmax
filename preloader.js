/*  Page preloader (every page), in the dark tech hero's look (styles in preloader.css):
      - a radar around the Dynasty Max shield, the name, a gradient progress bar and a status line
      - the number and bar count up with the page's loading progress (page parsed + fonts in),
        always easing smoothly towards it; the status line steps GPS -> AIS-140 -> CCTV -> ready
      - at 100% the radar block zooms away and the screen lifts up off the page,
        then 'dm:ready' starts the page's own animations (hero intro)
      - the full count shows once per visit; later pages in the same visit load quicker
    Markup: .dm-preloader right after <body>; <html class="dm-loading"> from the head. */
(function () {
    'use strict';
    var root = document.documentElement;
    var el = document.querySelector('.dm-preloader');
    if (!el) { root.classList.remove('dm-loading'); return; }

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var phone = window.matchMedia && window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
    var countEl = el.querySelector('.dm-pl-count');
    var barEl = el.querySelector('.dm-pl-bar');
    var statusEl = el.querySelector('.dm-pl-status');
    var STEPS = [[0, 'Initialising'], [25, 'Connecting GPS'], [50, 'Linking AIS-140'], [75, 'Securing CCTV'], [100, 'System ready']];
    var seen = false;
    try { seen = sessionStorage.getItem('dmPlSeen') === '1'; sessionStorage.setItem('dmPlSeen', '1'); } catch (e) {}
    var MIN_MS = seen ? 550 : (phone ? 1100 : 1400);   // the count always takes at least this long (never a blink)
    var MAX_WAIT = phone ? 3500 : 6000;    // never hold the page longer than this
    var ZOOM_MS = 450, LIFT_MS = 750;      // the radar block zooms away, then the screen lifts
    var start = performance.now();

    /* ---------- progress: the page is ready once it is parsed and its fonts are in ----------
       (not window 'load': every image and three.js would hold the counter for seconds on a phone).
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

    /* ---------- the counter, bar and status line ---------- */
    function draw(n) {
        countEl.textContent = n < 10 ? '0' + n : n;
        if (barEl) barEl.style.setProperty('--p', n);
        if (statusEl) {
            var t = STEPS[0][1];
            STEPS.forEach(function (st) { if (n >= st[0]) t = st[1]; });
            if (statusEl.textContent !== t) statusEl.textContent = t;
        }
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
        if (n !== drawn) { draw(n); drawn = n; }   // only touch the DOM when it changes
        if (shown >= 100) { done = true; clearInterval(pulse); draw(100); setTimeout(drop, 220); }
    }
    function tick(now) { step(now); if (!done) requestAnimationFrame(tick); }

    /* ---------- exit: the radar block zooms away, then the screen lifts up ---------- */
    var dropped = false;
    function drop() {
        if (dropped) return;
        dropped = true;
        el.classList.add('is-dropping');
        if (reduce) { finish(); return; }
        setTimeout(function () {
            el.classList.add('is-leaving', 'is-lifting');
            // start the page's own intro while the screen is still lifting, so it plays in view
            setTimeout(finish, LIFT_MS * .45);
        }, ZOOM_MS);
    }
    var finished = false;
    function finish() {
        if (finished) return;
        finished = true;
        el.classList.add('is-leaving');
        if (reduce) el.classList.add('is-gone');
        root.classList.remove('dm-loading');
        // tell the page its entrance animations can start now (main.js, hero-cards.js ...)
        document.dispatchEvent(new Event('dm:ready'));
        setTimeout(function () { el.remove(); }, LIFT_MS);
    }

    draw(0);
    if (reduce) {
        // no counting show: open the page as soon as it has loaded
        var wait = function () { if (progress(performance.now()) >= 100) { draw(100); finish(); } else setTimeout(wait, 100); };
        wait();
        return;
    }
    requestAnimationFrame(tick);
    pulse = setInterval(function () { step(performance.now()); }, 50);
    // backstop: if animation frames are starved (busy or background tab), open the page anyway
    setTimeout(function () { if (!dropped) { draw(100); drop(); } }, MAX_WAIT + 1500);
}());
