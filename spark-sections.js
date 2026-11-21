/* SparkLayer-style home sections: showcase tabs, ask box (typing placeholder,
   sends the question on WhatsApp), case-study carousel, final WhatsApp box. */
(function () {
    "use strict";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var WA = "https://wa.me/919937020621?text=";

    /* forms open WhatsApp in a new tab (the site's security rules only allow
       forms to post to the site itself, so this is done here, not by the form) */
    [].forEach.call(document.querySelectorAll("[data-sx-ask], [data-sx-final]"), function (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var input = form.querySelector("input");
            var q = (input.value || input.getAttribute("placeholder") || "").trim();
            window.open(WA + encodeURIComponent("Hello DMAX, " + q), "_blank", "noopener");
        });
    });

    /* ask box: the placeholder types out a few example questions */
    var ask = document.querySelector("[data-sx-typing]");
    if (ask && !reduce) {
        var lines = ask.getAttribute("data-sx-typing").split("|");
        var li = 0, ci = 0, del = false;
        (function tick() {
            if (document.activeElement === ask || ask.value) { setTimeout(tick, 800); return; }
            var line = lines[li];
            ci += del ? -1 : 1;
            ask.setAttribute("placeholder", line.slice(0, ci) + (del ? "" : "|"));
            var wait = del ? 28 : 55;
            if (!del && ci >= line.length) { del = true; wait = 1800; ask.setAttribute("placeholder", line); }
            else if (del && ci <= 0) { del = false; li = (li + 1) % lines.length; wait = 350; }
            setTimeout(tick, wait);
        })();
    }

    /* showcase tabs */
    var tabs = [].slice.call(document.querySelectorAll(".sx-tab"));
    var lineEl = document.querySelector("[data-sx-line]");
    function pick(tab, focus) {
        tabs.forEach(function (t) {
            var on = t === tab;
            t.classList.toggle("is-on", on);
            t.setAttribute("aria-selected", on ? "true" : "false");
            t.tabIndex = on ? 0 : -1;
            var p = document.getElementById(t.getAttribute("aria-controls"));
            if (p) { p.hidden = !on; p.classList.toggle("is-on", on); if (on && lineEl) lineEl.innerHTML = p.getAttribute("data-line"); }
        });
        if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { pick(t); });
        t.addEventListener("keydown", function (e) {
            var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
            if (n) { e.preventDefault(); pick(tabs[(i + n + tabs.length) % tabs.length], true); }
        });
    });

    /* case-study carousel: arrows + progress dots */
    [].forEach.call(document.querySelectorAll("[data-sx-carousel]"), function (c) {
        var track = c.querySelector(".sx-track");
        var prev = c.querySelector(".sx-nav--prev"), next = c.querySelector(".sx-nav--next");
        var dotsBox = c.querySelector(".sx-dots");
        var cards = track.children;
        for (var i = 0; i < cards.length; i++) dotsBox.appendChild(document.createElement("i"));
        var dots = dotsBox.children;
        function step() { return cards[0] ? cards[0].getBoundingClientRect().width + 16 : 300; }
        function update() {
            var max = track.scrollWidth - track.clientWidth;
            prev.disabled = track.scrollLeft <= 4;
            next.disabled = track.scrollLeft >= max - 4;
            var idx = Math.round(track.scrollLeft / step());
            for (var d = 0; d < dots.length; d++) dots[d].classList.toggle("is-on", d === idx);
        }
        prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); });
        next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); });
        track.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
        window.addEventListener("resize", update);
        update();
    });
}());
