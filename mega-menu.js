/* Mega menus: the photo panel follows the hovered / focused item, and rotates
   through the photos every 4.5s while the menu is open and nothing is hovered. */
(function () {
    "use strict";
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".site-header .nav-mega").forEach(function (menu) {
        var items = Array.prototype.slice.call(menu.querySelectorAll(".mega-item[data-media]"));
        var slides = Array.prototype.slice.call(menu.querySelectorAll(".mega-slide"));
        if (!slides.length) return;
        var current = 0;
        var timer = null;
        var paused = false;

        function show(i) {
            i = (i + slides.length) % slides.length;
            if (i === current && slides[i].classList.contains("is-active")) return;
            slides[current].classList.remove("is-active");
            slides[i].classList.add("is-active");
            items.forEach(function (it, n) { it.classList.toggle("is-current", n === i); });
            current = i;
        }
        function isOpen() {
            return menu.classList.contains("open") || menu.matches(":has(:focus-visible)");
        }
        function tick() {
            if (!isOpen()) { stop(); return; }
            if (!paused) show(current + 1);
        }
        function start() {
            if (timer || reduceMotion) return;
            timer = setInterval(tick, 4500);
        }
        function stop() { clearInterval(timer); timer = null; }

        items.forEach(function (it) {
            var i = parseInt(it.getAttribute("data-media"), 10);
            it.addEventListener("mouseenter", function () { paused = true; show(i); });
            it.addEventListener("focus", function () { paused = true; show(i); });
            it.addEventListener("mouseleave", function () { paused = false; });
        });

        var media = menu.querySelector(".mega-media");
        if (media) {
            media.addEventListener("mouseenter", function () { paused = true; });
            media.addEventListener("mouseleave", function () { paused = false; });
        }

        menu.addEventListener("mouseenter", start);
        menu.addEventListener("focusin", start);
        menu.addEventListener("mouseleave", function () { paused = false; stop(); });
    });
}());
