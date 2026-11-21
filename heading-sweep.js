/* Heading sweep (sparklayer.io): every h1 and h2 gets one pass of a rainbow band
   across the letters of its highlighted phrase, once, as it comes into view.
   The phrase is:
     1. its coloured words (.ds-accent, .products-accent, .sx-accent, .dmh-key), or else
     2. its last sentence, or its last few words, wrapped here in a span.
   Coloured words settle on a blue -> purple -> pink gradient (pale on dark
   backgrounds); plain words settle on their own colour, so at rest nothing jumps.
   Styles: spark-motion.css (.acc-sw). */
(function () {
    "use strict";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ACCENT = ".ds-accent, .products-accent, .sx-accent, .dmh-key, .dbs-accent";
    var HIDDEN = ".dbs-sr, .sr-only, .hero-rotator__sr";
    var DARK_GROUND = ".dm-fhero, .sx-band, .sx-final, .sx-showcase, .dm-topbar";
    var SKIP = ".dm-footer, .dm-preloader, .sr-only, .mega-panel, .pv-body, [aria-hidden='true']";

    function wrapTail(h) {
        // the last text node with words in it
        var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), n, last = null;
        while ((n = walker.nextNode())) if (n.nodeValue.trim() && !n.parentElement.closest(HIDDEN)) last = n;
        if (!last) return null;
        var text = last.nodeValue;
        var trimmed = text.replace(/\s+$/, "");
        // last sentence if the text has more than one, else its last few words
        var cut = -1;
        var m = trimmed.match(/^(.*[.!?])\s+\S[\s\S]*$/);
        if (m) cut = m[1].length + 1;
        if (cut < 0) {
            var words = trimmed.split(/\s+/);
            var all = h.textContent.trim().split(/\s+/).length;
            var take = Math.max(1, Math.min(4, Math.ceil(all / 3)));
            if (words.length <= take) cut = trimmed.length - trimmed.replace(/^\s+/, "").length;
            else {
                var keep = words.slice(-take).join(" ");
                cut = trimmed.lastIndexOf(keep);
            }
        }
        while (cut < text.length && /\s/.test(text.charAt(cut))) cut++;
        if (cut <= 0 && last === h.firstChild) cut = 0;
        var tail = last.splitText(cut);
        var span = document.createElement("span");
        span.className = "acc-sw acc-auto";
        tail.parentNode.insertBefore(span, tail);
        span.appendChild(tail);
        return span;
    }

    var items = [];
    [].forEach.call(document.querySelectorAll("h1, h2"), function (h) {
        if (h.closest(SKIP) || !h.textContent.trim()) return;
        var phrase = h.querySelector(ACCENT);
        var isAccent = !!phrase;
        if (phrase) phrase.classList.add("acc-sw");
        else {
            var ink = getComputedStyle(h).color;
            phrase = wrapTail(h);
            if (!phrase) return;
            phrase.style.setProperty("--acc-a", ink);
            phrase.style.setProperty("--acc-b", ink);
            phrase.style.setProperty("--acc-c", ink);
        }
        if (isAccent && h.closest(DARK_GROUND)) phrase.classList.add("acc-sw--pale");
        items.push(phrase);
    });

    function go(s) { s.classList.add("acc-go"); }
    if (reduce || !("IntersectionObserver" in window)) { items.forEach(go); return; }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            go(en.target);
            io.unobserve(en.target);
        });
    }, { threshold: .4 });
    items.forEach(function (s) { io.observe(s); });
}());
