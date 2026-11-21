/* How We Work tabs: click (or arrow keys) to switch the panel below. */
(function () {
    "use strict";
    var list = document.querySelector(".dm-ft-tabs");
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll(".dm-ft-tab"));

    function select(tab, focus) {
        tabs.forEach(function (t) {
            var on = t === tab;
            t.classList.toggle("is-active", on);
            t.setAttribute("aria-selected", on ? "true" : "false");
            t.tabIndex = on ? 0 : -1;
            var pane = document.getElementById(t.getAttribute("aria-controls"));
            if (pane) {
                pane.hidden = !on;
                pane.classList.toggle("is-active", on);
            }
        });
        if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { select(tab); });
        tab.addEventListener("keydown", function (e) {
            var next = null;
            if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
            else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
            else if (e.key === "Home") next = tabs[0];
            else if (e.key === "End") next = tabs[tabs.length - 1];
            if (next) { e.preventDefault(); select(next, true); }
        });
    });
}());
