(function () {
    "use strict";

    function initHeaderScrollIndicator() {
        var links = Array.prototype.slice.call(
            document.querySelectorAll("[data-scroll-section]")
        );
        if (!links.length) return;

        var ids = [];
        links.forEach(function (link) {
            var id = link.getAttribute("data-scroll-section");
            if (id && ids.indexOf(id) === -1 && document.getElementById(id)) {
                ids.push(id);
            }
        });
        if (!ids.length) return;

        // look everything up once (not on every scroll event)
        var header = document.getElementById("siteHeader");
        var sections = ids.map(function (id) { return document.getElementById(id); });
        var lastActive = null;
        var ticking = false;

        function update() {
            ticking = false;
            var line = (header ? header.offsetHeight : 0) + 8;
            var activeId = "";

            for (var i = 0; i < sections.length; i++) {
                if (sections[i].getBoundingClientRect().top <= line) activeId = ids[i];
            }
            if (activeId === lastActive) return;      // nothing changed: leave the menu alone
            lastActive = activeId;

            links.forEach(function (link) {
                var active = link.getAttribute("data-scroll-section") === activeId;
                link.classList.toggle("is-active", active);
            });
        }

        // at most one check per frame, however fast the scroll events arrive
        function requestUpdate() {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }

        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate);
        update();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeaderScrollIndicator);
    } else {
        initHeaderScrollIndicator();
    }
}());