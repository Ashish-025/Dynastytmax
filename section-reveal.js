/* Every piece of content appears as you scroll, like the Dewi template
   (AOS, MIT licence: vendor/aos):
     - each heading, paragraph, list item, button, image, form, map ... slides up on its own
       as it comes into view
     - things side by side follow one another, 100ms apart (0, 100, 200 ... 500ms)
     - cards slide up as whole boxes, one after another (100, 200 ... 600ms)
     - the hero too: its title, text, buttons and photos; a full-width hero background
       fades in instead
   Same settings as the template: 600ms, ease-in-out, slides up 100px, plays once.
   The attributes are added here, so every page gets the effect without editing its
   markup, and nothing is hidden if JavaScript is off.
     - carousels and sliders slide up as one block (their cards keep sliding as before)
   The slide moves with the "translate" property, not "transform", so cards that already
   use a transform (tilt, lift, centring) reveal too, without jumping.
   Left still: the header and menu, the preloader, the announcement strip and top bar.
   The site's older scroll-in effects (.dm-reveal, .ds-rv, .fx-rise) are switched off so
   only this one plays. Once an element has appeared it is handed back to its own styles,
   so hover effects (card lift, photo zoom) keep working.
   Needs vendor/aos/aos.css + vendor/aos/aos.js loaded before it. */
(function () {
    "use strict";
    if (!window.AOS) return;

    var SKIP = ".site-header, header.header, .dm-preloader, .mobile-nav, .mega-panel, nav, dialog, [aria-modal='true'], [hidden], .dm-unb, .dm-topbar, .ssi-floating-actions";
    var MOVING = "[class*='track'], [class*='marquee'], [class*='swiper'], [class*='slider'], [class*='carousel'], [class*='ticker'], [class*='viewport']";
    var HERO = ".dm-fhero, .hero, .hm-hero, [class*='hero-section'], [class*='page-hero']";
    // the content that reveals, each on its own (the outermost match wins: a paragraph in
    // a list item goes with the item, an image in a figure with the figure)
    var CONTENT = "h1, h2, h3, h4, h5, h6, p, li, blockquote, figure, img, video, iframe, table, form, dl, details, " +
                  ".btn, a[class*='btn'], a[class*='button'], button, [class*='label'], [class*='eyebrow'], [class*='kicker']";

    function visible(el) { return el.getClientRects().length > 0; }
    function eligible(el) {
        return !el.closest(SKIP) && !el.closest(MOVING) && visible(el);
    }

    // the slide-up itself: Dewi's fade-up (100px, with AOS's timing), but moved with the
    // separate "translate" property instead of "transform", so cards that already use a
    // transform (tilt, lift, centring) reveal too, without jumping
    var css = document.createElement("style");
    css.textContent =
        '[data-aos="dm-up"][data-aos]{opacity:0;translate:0 100px;transition-property:opacity,translate}' +
        '[data-aos="dm-up"][data-aos].aos-animate{opacity:1;translate:0 0}' +
        '[data-aos="dm-in"][data-aos]{opacity:0;transition-property:opacity}' +
        '[data-aos="dm-in"][data-aos].aos-animate{opacity:1}' +
        '@media (prefers-reduced-motion:reduce){[data-aos="dm-up"][data-aos],[data-aos="dm-in"][data-aos]{opacity:1;translate:none;transition:none}}';
    document.head.appendChild(css);

    // the older scroll-in effects: shown straight away, this one takes over
    [].forEach.call(document.querySelectorAll(".dm-reveal, .ds-rv, .fx-rise"), function (el) {
        el.classList.remove("dm-reveal", "ds-rv", "fx-rise");
        el.classList.add("dm-visible", "ds-in", "is-visible", "fx-in");
    });

    // the hero: a known hero block, or else the block that holds the page's main heading
    var heroEl = null;
    [].some.call(document.querySelectorAll(HERO), function (h) { if (!h.closest(SKIP) && visible(h)) { heroEl = h; return true; } });
    if (!heroEl) {
        var h1 = [].filter.call(document.querySelectorAll("h1"), function (h) { return !h.closest(SKIP) && visible(h); })[0];
        if (h1) heroEl = h1.closest("section, header") || h1.parentElement;
    }

    // 1. cards: a run of 3+ look-alike siblings (same tag and first class) with real size;
    //    each card slides up as a box, one after another
    var cardSet = [];
    [].forEach.call(document.querySelectorAll("main *, body > section *, footer *"), function (el) {
        if (el.closest(SKIP) || el.closest(MOVING) || el.closest("[data-aos-card]")) return;
        var kids = [].filter.call(el.children, function (k) { return visible(k) && !/^(SCRIPT|STYLE|BR|svg|LI)$/i.test(k.tagName); });
        if (kids.length < 3) return;
        var key = function (k) { return k.tagName + "." + (k.classList[0] || ""); };
        var same = kids.filter(function (k) { return key(k) === key(kids[0]); });
        if (same.length < 3 || same.length < kids.length * .6) return;
        // a card is a box holding a heading or an image, not a single line of text
        var boxy = same.every(function (k) {
            var r = k.getBoundingClientRect();
            return r.width >= 140 && r.height >= 120 && k.querySelector("h2, h3, h4, h5, img, svg, p");
        });
        if (!boxy) return;
        same.forEach(function (c, i) {
            if (!eligible(c)) return;
            c.setAttribute("data-aos-card", "");
            c.setAttribute("data-aos", "dm-up");
            c.setAttribute("data-aos-delay", String(Math.min(i + 1, 6) * 100));
        });
    });

    // carousels and sliders (customer stories, logo strip ...): the whole strip slides up
    // as one block - moving its cards one by one would fight the sliding
    [].forEach.call(document.querySelectorAll(MOVING), function (m) {
        var box = m;
        while (box.parentElement && box.parentElement.closest(MOVING)) box = box.parentElement.closest(MOVING);
        var wrap = box.parentElement;
        if (!wrap || wrap.closest(SKIP) || wrap.closest("[data-aos]") || wrap.querySelector("[data-aos]") ||
            wrap === document.body || /^(MAIN|SECTION|FOOTER)$/.test(wrap.tagName) || !visible(wrap)) return;
        wrap.setAttribute("data-aos", "dm-up");
        wrap.setAttribute("data-aos-delay", "100");
    });

    // 2. every other piece of content, on its own
    var perParent = new Map();
    [].forEach.call(document.querySelectorAll(CONTENT), function (el) {
        if (el.hasAttribute("data-aos") || el.closest("[data-aos]") || !eligible(el)) return;
        // the outermost content element wins
        var up = el.parentElement && el.parentElement.closest(CONTENT);
        if (up && eligible(up) && !up.closest("[data-aos-card]")) return;
        var r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) return;
        // things in the same row / list follow one another, 100ms apart
        var p = el.parentElement, n = perParent.get(p) || 0;
        perParent.set(p, n + 1);
        var bg = heroEl && heroEl.contains(el) && /^(IMG|VIDEO)$/.test(el.tagName) &&
                 r.width >= heroEl.getBoundingClientRect().width * .8;
        el.setAttribute("data-aos", bg ? "dm-in" : "dm-up");
        var d = Math.min(n, 5) * 100 + (heroEl && heroEl.contains(el) ? 100 : 0);
        if (d) el.setAttribute("data-aos-delay", String(d));
    });

    // once an element has appeared, drop the attributes: its own styles (hover lift,
    // photo zoom...) apply again, with no visible change (it is already in place)
    document.addEventListener("transitionend", function (e) {
        var el = e.target;
        if (el.hasAttribute && el.hasAttribute("data-aos") && el.classList.contains("aos-animate") && e.propertyName === "opacity") {
            el.removeAttribute("data-aos");
            el.removeAttribute("data-aos-delay");
            el.removeAttribute("data-aos-card");
            el.classList.remove("aos-init", "aos-animate");
        }
    });

    function start() {
        // our own start event, fired right away: AOS would otherwise wait for
        // DOMContentLoaded, which slow outside scripts can hold back (content stays hidden)
        AOS.init({ duration: 600, easing: "ease-in-out", once: true, mirror: false, startEvent: "dm:aos-start" });
        document.dispatchEvent(new Event("dm:aos-start"));
    }
    // start as soon as the page is parsed (this script runs at the end of <body>), never
    // waiting for slow images or outside files; behind the preloader, wait for it to go
    // so the first content plays in view. Positions are measured again once everything
    // has loaded, in case images changed the layout.
    var started = false;
    function go() { if (!started) { started = true; start(); } }
    if (document.documentElement.classList.contains("dm-loading") && document.querySelector(".dm-preloader")) {
        document.addEventListener("dm:ready", go, { once: true });
        setTimeout(go, 7000);   // never leave the content hidden if the preloader stalls
    } else {
        go();
    }
    window.addEventListener("load", function () { if (window.AOS) AOS.refresh(); }, { once: true });
}());
