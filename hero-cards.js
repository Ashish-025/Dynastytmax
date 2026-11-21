/* Home hero card fan: every 4s the cards step one place along the arc.
   Click a card (or a category in the panel) to bring it to the front; the
   panel shows the front card's name, category, line and link.
   Pauses on hover, with the pause button, and while the hero is off screen. */
(function () {
    "use strict";
    var deck = document.querySelector("[data-dmh-deck]");
    if (!deck) return;

    var cards = Array.prototype.slice.call(deck.querySelectorAll(".dmh-card"));
    var n = cards.length;
    if (!n) return;
    var STEP = 4000;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nameEl = deck.querySelector("[data-dmh-name]");
    var textEl = deck.querySelector("[data-dmh-text]");
    var linkEl = deck.querySelector("[data-dmh-link]");
    var playBtn = deck.querySelector("[data-dmh-play]");
    var cats = Array.prototype.slice.call(deck.querySelectorAll("[data-dmh-cat]"));

    var active = 0, timer = null, userPaused = reduce, hovering = false, visible = true;
    deck.style.setProperty("--dmh-step", STEP + "ms");

    function layout() {
        cards.forEach(function (card, i) {
            var d = ((i - active) % n + n) % n;
            var slot = d <= Math.floor(n / 2) ? d : d - n;
            card.style.setProperty("--slot", slot);
            card.style.setProperty("--abs", Math.abs(slot));
            card.classList.toggle("is-live", slot === 0);
            card.setAttribute("aria-pressed", slot === 0 ? "true" : "false");
        });
        var c = cards[active];
        if (nameEl) nameEl.textContent = c.getAttribute("data-name");
        if (textEl) textEl.textContent = c.getAttribute("data-text");
        if (linkEl) linkEl.href = c.getAttribute("data-href");
        cats.forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-dmh-cat") === c.getAttribute("data-cat")); });
    }

    function restartRing() {
        deck.classList.remove("is-counting");
        void deck.offsetWidth;                       // restart the countdown animation
        if (timer) deck.classList.add("is-counting");
    }
    function schedule() {
        clearTimeout(timer);
        timer = null;
        if (userPaused || hovering || !visible) { deck.classList.remove("is-counting"); return; }
        timer = setTimeout(function () { go(active + 1); }, STEP);
        restartRing();
    }
    function go(i) {
        active = ((i % n) + n) % n;
        layout();
        schedule();
    }

    cards.forEach(function (card, i) {
        card.addEventListener("click", function () {
            // the front card opens its service page; a side card comes to the front
            if (i === active && card.getAttribute("data-href")) {
                window.location.href = card.getAttribute("data-href");
            } else {
                go(i);
            }
        });
    });
    cats.forEach(function (b) {
        b.addEventListener("click", function () {
            var cat = b.getAttribute("data-dmh-cat");
            for (var k = 1; k <= n; k++) {              // next card of that category
                var j = (active + k) % n;
                if (cards[j].getAttribute("data-cat") === cat) { go(j); return; }
            }
        });
    });
    if (playBtn) {
        playBtn.addEventListener("click", function () {
            userPaused = !userPaused;
            deck.classList.toggle("is-paused", userPaused);
            playBtn.setAttribute("aria-label", userPaused ? "Play the cards" : "Pause the cards");
            schedule();
        });
    }
    deck.addEventListener("mouseenter", function () { hovering = true; schedule(); });
    deck.addEventListener("mouseleave", function () { hovering = false; schedule(); });

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            schedule();
        }).observe(deck);
    }

    deck.classList.toggle("is-paused", userPaused);
    layout();
    // start once the loading screen has gone
    if (document.documentElement.classList.contains("dm-loading")) {
        document.addEventListener("dm:ready", schedule, { once: true });
    } else {
        schedule();
    }
}());
