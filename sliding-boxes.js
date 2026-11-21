/* Our Services panels: the hovered (or tapped / focused) panel opens wide.
   On a mouse, moving onto a panel opens it; on touch, a tap opens it and a tap on
   the round arrow then follows the link. The last opened panel stays open. */
(function () {
    "use strict";
    var canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    document.querySelectorAll("[data-sb-boxes]").forEach(function (group) {
        var boxes = Array.prototype.slice.call(group.querySelectorAll(".sb-box"));
        var hoverTimer = null;

        function open(box) {
            boxes.forEach(function (b) {
                var on = b === box;
                b.classList.toggle("is-active", on);
                var t = b.querySelector(".sb-toggle");
                if (t) t.setAttribute("aria-expanded", on ? "true" : "false");
            });
        }

        boxes.forEach(function (box) {
            var toggle = box.querySelector(".sb-toggle");
            if (canHover) {
                // a short delay so sweeping the mouse across doesn't flick every panel open
                box.addEventListener("mouseenter", function () {
                    clearTimeout(hoverTimer);
                    hoverTimer = setTimeout(function () { open(box); }, 90);
                });
                box.addEventListener("mouseleave", function () { clearTimeout(hoverTimer); });
            }
            if (toggle) {
                toggle.addEventListener("click", function () { open(box); });
                toggle.addEventListener("focus", function () { open(box); });
            }
        });
    });
}());
