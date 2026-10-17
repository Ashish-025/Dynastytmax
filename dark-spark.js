/*  Dark theme, sparklayer.io "One B2B platform" look (styles in dark-spark.css, dark theme only):
      - section headings: the second part of each heading becomes a highlighted phrase that a
        cyan -> violet -> pink -> orange band sweeps across once, when it scrolls into view
      - section heading blocks fade up 12px into view
      - cards get a thin violet / cyan light orbiting their border
    Only adds classes and small spans; in the light theme nothing is styled by them.
    Load before usta-motion.js (it splits headings into letters) and fx-enhance.js. */
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- highlighted phrase in section headings ---------- */
    var ACCENTS = [
        ['#dm-services-title', 'for every Business need'],
        ['.achievements-head h2', 'So Far'],
        ['#dm-projects-title', 'for Government & Industry'],
        ['#dm-cta-title', 'Success Story'],
        ['#ssi-services-title', 'and security services'],
        ['#ssi-products-title', 'security systems'],
        ['.ssi-contact-band h2', 'for your space.']
    ];
    function wrapPhrase(h, phrase) {
        var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), n;
        while ((n = walker.nextNode())) {
            var i = n.nodeValue.indexOf(phrase);
            if (i < 0) continue;
            var rest = n.splitText(i);
            rest.splitText(phrase.length);
            var span = document.createElement('span');
            span.className = 'ds-accent';
            rest.parentNode.replaceChild(span, rest);
            span.appendChild(rest);
            return;
        }
    }
    ACCENTS.forEach(function (a) {
        var h = document.querySelector(a[0]);
        if (h && !h.querySelector('.ds-accent')) wrapPhrase(h, a[1]);
    });
    [].forEach.call(document.querySelectorAll('.products-accent'), function (s) { s.classList.add('ds-accent'); });

    /* ---------- heading blocks fade up; the highlight sweeps once when seen ---------- */
    var HEADS = '.achievements-head, .dm-services-heading, .products-heading, .dm-projects-heading, ' +
        '.ssi-section-heading, .ssi-contact-inner > div, .dbs-services-intro, .products-intro';
    var blocks = [].slice.call(document.querySelectorAll(HEADS));
    var projTitle = document.getElementById('dm-projects-title');
    if (projTitle && blocks.indexOf(projTitle.parentElement) < 0) blocks.push(projTitle.parentElement);
    var accents = [].slice.call(document.querySelectorAll('.ds-accent'));

    function show(el) {
        el.classList.add('ds-in');
        [].forEach.call(el.querySelectorAll('.ds-accent'), function (s) { s.classList.add('ds-go'); });
        if (el.classList.contains('ds-accent')) el.classList.add('ds-go');
    }
    blocks.forEach(function (b) { b.classList.add('ds-rv'); });
    if (reduce || !('IntersectionObserver' in window)) {
        blocks.forEach(show);
        accents.forEach(show);
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                show(en.target);
                io.unobserve(en.target);
            });
        }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
        blocks.forEach(function (b) { io.observe(b); });
        // highlights outside a heading block (e.g. the CTA band) start on their own
        accents.forEach(function (s) { if (!s.closest('.ds-rv')) io.observe(s); });
    }

    /* ---------- orbiting border light on cards ---------- */
    var CARD = [
        '.dm-service-card', '.achievements-section .stat-card', '.dm-i3ms-tile', '.dm-i3ms-login',
        '.ssi-service-card', '.ssi-product-card', '.products-grid .product-card',
        '.contact-form', '.contact-detail-note', '.app-card', '.dbs-features > div'
    ].join(',');
    [].forEach.call(document.querySelectorAll(CARD), function (card) {
        if (card.querySelector(':scope > .ds-orbit')) return;
        var sibs = [].filter.call(card.parentElement.children, function (c) { return c.matches(CARD); });
        var o = document.createElement('span');
        o.className = 'ds-orbit';
        o.setAttribute('aria-hidden', 'true');
        o.style.animationDelay = (-2.2 * (Math.max(0, sibs.indexOf(card)) % 3)).toFixed(1) + 's';   // neighbours out of step
        card.appendChild(o);
    });
}());
