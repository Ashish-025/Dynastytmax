/*  Touch screens behave like the desktop (mouse) version.
    On a phone / tablet there is no hover, so the hover effects (services & product cards,
    footer map zoom, Mobility / security product cards ...) either never showed or the link
    opened straight away. Here:
      - every ":hover" style in the site's stylesheets is copied to a ".is-hovered" twin
        (so nothing is styled twice by hand: the desktop styles ARE the touch styles)
      - 1st tap on a hover element = desktop hover: it (and its parents, like real :hover)
        gets .is-hovered and the link does NOT open yet
      - 2nd tap on the same element = desktop click: the link opens
      - a tap anywhere else = mouse moved away: the hover state is cleared
    Only runs on devices without a real hover (phones, most tablets). */
(function () {
    'use strict';
    if (!window.matchMedia || !window.matchMedia('(hover: none)').matches) return;

    // elements whose desktop hover state matters (first tap previews, second tap opens)
    var TARGETS = [
        '.dm-service-card', '.dm-product-card', '.products-grid .product-card',
        '.ssi-service-card', '.ssi-product-card', '.dm-office-gmap', '.app-card',
        '.dbs-page .service-item', '.dbs-page .inner-box'
    ].join(',');

    /* ---------- 1. copy every :hover rule to an .is-hovered twin ---------- */
    var out = [];
    function copyRules(rules, wrapOpen, wrapClose) {
        for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            if (r.cssRules && r.media) {                          // @media: keep the condition
                copyRules(r.cssRules, '@media ' + r.media.mediaText + '{', '}');
            } else if (r.cssRules && r.conditionText !== undefined) { // @supports
                copyRules(r.cssRules, '@supports ' + r.conditionText + '{', '}');
            } else if (r.selectorText && r.selectorText.indexOf(':hover') > -1) {
                var sel = r.selectorText.split(',').filter(function (s) { return s.indexOf(':hover') > -1; })
                    .map(function (s) { return s.replace(/:hover/g, '.is-hovered'); }).join(',');
                out.push(wrapOpen + sel + '{' + r.style.cssText + '}' + wrapClose);
            }
        }
    }
    function buildTwins() {
        out = [];
        [].forEach.call(document.styleSheets, function (ss) {
            var rules;
            try { rules = ss.cssRules; } catch (e) { return; }   // other-site sheets (fonts) can't be read
            if (rules && !(ss.media && ss.media.mediaText === 'not all')) copyRules(rules, '', '');
        });
        var tag = document.getElementById('touch-hover-twins');
        if (!tag) {
            tag = document.createElement('style');
            tag.id = 'touch-hover-twins';
            document.head.appendChild(tag);
        }
        tag.textContent = out.join('\n');
    }
    buildTwins();
    // the dark / light theme switches stylesheets on and off: rebuild the twins when it changes
    new MutationObserver(buildTwins).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    /* ---------- 2. tap = hover, second tap = click ---------- */
    var current = null;
    function clear() {
        document.querySelectorAll('.is-hovered').forEach(function (e) { e.classList.remove('is-hovered'); });
        current = null;
    }
    function hover(el) {
        clear();
        current = el;
        for (var e = el; e && e !== document.documentElement; e = e.parentElement) e.classList.add('is-hovered');
    }

    document.addEventListener('click', function (ev) {
        var el = ev.target.closest && ev.target.closest(TARGETS);
        if (!el) { if (current) clear(); return; }               // tapped elsewhere: "mouse left"
        if (el === current) return;                               // second tap: let the click through
        // first tap: show the hover state instead of opening the link
        if (ev.target.closest('a[href], button') || el.matches('a[href]')) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        hover(el);
    }, true);

    // the page moving under the finger (scroll) also counts as the mouse leaving
    var scrollY = window.pageYOffset;
    window.addEventListener('scroll', function () {
        if (current && Math.abs(window.pageYOffset - scrollY) > 60) clear();
        if (!current) scrollY = window.pageYOffset;
    }, { passive: true });
}());
