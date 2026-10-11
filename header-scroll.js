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

        function update() {
            var header = document.getElementById("siteHeader");
            var line = (header ? header.offsetHeight : 0) + 8;
            var activeId = "";

            ids.forEach(function (id) {
                var section = document.getElementById(id);
                if (section && section.getBoundingClientRect().top <= line) {
                    activeId = id;
                }
            });

            links.forEach(function (link) {
                var active = link.getAttribute("data-scroll-section") === activeId;
                link.classList.toggle("is-active", active);
            });
        }

        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        update();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeaderScrollIndicator);
    } else {
        initHeaderScrollIndicator();
    }
}());