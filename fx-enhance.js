/*  Futuristic interaction layer (pairs with site-futuristic.css):
    - scroll progress bar
    - cursor spotlight + gentle 3D tilt on cards
    - staggered rise-in for cards as they scroll into view
    Respects prefers-reduced-motion and touch devices. */
(function () {
    'use strict';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var root = document.documentElement;
    root.classList.add('fx-on');

    /* ---------- scroll progress ---------- */
    var bar = document.createElement('div');
    bar.className = 'fx-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    function progress() {
        var max = root.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.pageYOffset / max) : 0) + ')';
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(progress); }
    }, { passive: true });
    window.addEventListener('resize', progress);
    progress();

    /* ---------- cards: spotlight, tilt, staggered reveal ---------- */
    var CARD = [
        '.dm-service-card', '.achievements-section .stat-card', '.dm-i3ms-tile', '.dm-i3ms-login',
        '.ssi-service-card', '.ssi-product-card', '.products-grid .product-card',
        '.contact-form', '.contact-detail-note', '.app-card', '.dbs-features > div', '.dbs-bars'
    ].join(',');
    var TILT = '.dm-service-card, .ssi-service-card, .ssi-product-card, .products-grid .product-card, .app-card';
    var cards = Array.prototype.slice.call(document.querySelectorAll(CARD));

    cards.forEach(function (card) {
        card.classList.add('fx-card');
        if (!finePointer || reduce) return;
        var tilt = card.matches(TILT);
        card.addEventListener('pointermove', function (e) {
            var r = card.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
            card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
            card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
            if (tilt) card.style.setProperty('--tilt', 'perspective(900px) rotateX(' + ((.5 - y) * 6).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 8).toFixed(2) + 'deg)');
        });
        card.addEventListener('pointerleave', function () {
            card.style.removeProperty('--tilt');
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
