/*  Home page motion, timed like usta.agency's GSAP timeline:
      - header bar drops in from above (1s, Power4.easeOut)
      - hero headline: word by word, each rising from 200% below with a 15deg tilt,
        1s per word, 0.1s apart (Power4.easeOut), starting 0.45s after the loader
      - hero subtitle: letter by letter, rising 50px with a tilt, 0.5s each,
        spread over 0.5s, starting 0.25s after the headline
      - section headings: letters rise into view when scrolled to (0.5s each,
        spread over 0.25s, power3.out)
    Starts on 'dm:ready' (sent by preloader.js) or straight away if there is no loader.
    Styles in usta-motion.css. */
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    var root = document.documentElement;
    root.classList.add('um-on');

    // wrap each word (or letter) of an element in a masked span; elements listed in `keep`
    // stay whole and become one unit (e.g. the rotating hero word)
    function split(el, mode, keep) {
        var units = [];
        (function walk(node) {
            [].slice.call(node.childNodes).forEach(function (n) {
                if (n.nodeType === 1) {
                    if (keep && n.matches(keep)) {
                        // kept whole and animated in place (a mask would break its layout)
                        n.classList.add('um-unit', 'um-free');
                        units.push(n);
                    } else if (!n.matches('.hero-rotator__sr, br')) {
                        walk(n);
                    }
                    return;
                }
                if (n.nodeType !== 3 || !n.textContent.trim()) return;
                var frag = document.createDocumentFragment();
                n.textContent.split(/(\s+)/).forEach(function (part) {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                    var mask = document.createElement('span');
                    mask.className = 'um-mask';
                    if (mode === 'chars') {
                        part.split('').forEach(function (ch) {
                            var c = document.createElement('span');
                            c.className = 'um-unit';
                            c.textContent = ch;
                            mask.appendChild(c);
                            units.push(c);
                        });
                    } else {
                        var u = document.createElement('span');
                        u.className = 'um-unit';
                        u.textContent = part;
                        mask.appendChild(u);
                        units.push(u);
                    }
                    frag.appendChild(mask);
                });
                n.parentNode.replaceChild(frag, n);
            });
        }(el));
        return units;
    }

    function stagger(units, start, step) {
        units.forEach(function (u, i) { u.style.transitionDelay = (start + i * step).toFixed(3) + 's'; });
    }

    var h1 = document.querySelector('.hero-content h1');
    var sub = document.querySelector('.hero-subtitle');
    var header = document.getElementById('siteHeader');

    var words = h1 ? split(h1, 'words', 'strong') : [];
    var subChars = sub ? split(sub, 'chars') : [];
    if (h1) h1.classList.add('um-words');
    if (sub) sub.classList.add('um-chars');
    stagger(words, 0, 0.08);                                       // headline straight away, 0.08s apart
    stagger(subChars, 0.3, subChars.length > 1 ? 0.5 / (subChars.length - 1) : 0);   // 0.5s spread
    var headerInner = header && header.querySelector('.header-container');
    if (headerInner) headerInner.style.transitionDelay = '0s';

    function play() {
        requestAnimationFrame(function () { root.classList.add('um-play'); });
    }
    if (root.classList.contains('dm-loading')) document.addEventListener('dm:ready', play, { once: true });
    else play();

    // section headings: letters rise in when they scroll into view
    var heads = [].slice.call(document.querySelectorAll('.dm-services-heading h2, .products-heading h2, .dm-cta-text h2'));
    if (!('IntersectionObserver' in window) || !heads.length) return;
    heads.forEach(function (h) {
        var chars = split(h, 'chars', '.dm-heading-line');
        h.classList.add('um-chars', 'um-scroll');
        stagger(chars, 0, chars.length > 1 ? 0.25 / (chars.length - 1) : 0);
    });
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            en.target.classList.add('um-in');
            io.unobserve(en.target);
        });
    }, { rootMargin: '0px 0px -10% 0px' });
    heads.forEach(function (h) { io.observe(h); });
}());
