/*  Futuristic interaction layer (pairs with site-futuristic.css):
    - scroll progress bar
    - cursor spotlight + gentle 3D tilt on cards
    - staggered rise-in for cards as they scroll into view
    On touch screens the finger acts like the mouse (spotlight + tilt follow it, then ease back).
    Respects prefers-reduced-motion. */
(function () {
    'use strict';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = document.documentElement;
    root.classList.add('fx-on');

    /* ---------- scroll progress ---------- */
    var bar = document.createElement('div');
    bar.className = 'fx-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false, max = 0;
    // page height is measured only when it can change (load / resize / every 2s), not on every scroll:
    // reading scrollHeight while scrolling forces a full layout
    function measure() { max = root.scrollHeight - window.innerHeight; progress(); }
    function progress() {
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.pageYOffset / max) : 0) + ')';
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(progress); }
    }, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    setInterval(measure, 2000);
    measure();

    /* ---------- cards: spotlight, tilt, staggered reveal ---------- */
    var CARD = [
        '.dm-service-card', '.achievements-section .stat-card', '.dm-i3ms-tile', '.dm-i3ms-login',
        '.ssi-service-card', '.ssi-product-card', '.products-grid .product-card',
        '.contact-form', '.contact-detail-note', '.app-card', '.dbs-features > div', '.dbs-bars'
    ].join(',');
    var TILT = '.ssi-service-card, .ssi-product-card, .app-card';   // Mobility cards: lift only, no tilt (as iconcox.in)
    var cards = Array.prototype.slice.call(document.querySelectorAll(CARD));

    cards.forEach(function (card) {
        card.classList.add('fx-card');
        if (reduce) return;
        var tilt = card.matches(TILT), release = 0;
        function aim(e) {
            var r = card.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
            card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
            card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
            if (tilt) card.style.setProperty('--tilt', 'perspective(900px) rotateX(' + ((.5 - y) * 6).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 8).toFixed(2) + 'deg)');
        }
        function untilt() { card.style.removeProperty('--tilt'); }
        // follows the mouse only: on a phone a finger moving over a card is a scroll, and re-measuring
        // the card + repainting its spotlight on every move made scrolling stutter
        card.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') aim(e); });
        card.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') untilt(); });
        // touch / pen: the card reacts where the finger lands, then eases back after it lifts
        card.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse') return;
            clearTimeout(release);
            aim(e);
        });
        ['pointerup', 'pointercancel'].forEach(function (n) {
            card.addEventListener(n, function (e) {
                if (e.pointerType === 'mouse') return;
                clearTimeout(release);
                release = setTimeout(untilt, 700);
            });
        });
    });

    if (reduce || !('IntersectionObserver' in window)) return;

    // stagger siblings: each card waits a little longer than the one before it
    cards.forEach(function (card) {
        var sibs = Array.prototype.filter.call(card.parentElement.children, function (c) { return c.matches(CARD); });
        card.style.setProperty('--fx-delay', (Math.max(0, sibs.indexOf(card)) % 6) * 90 + 'ms');
        card.classList.add('fx-rise');
    });
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            en.target.classList.add('fx-in');
            io.unobserve(en.target);
        });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    cards.forEach(function (c) { io.observe(c); });
}());
