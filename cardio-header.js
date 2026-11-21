/* Header: white frosted bar with a shadow once the page is scrolled past 60px. */
(function () {
    "use strict";
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var ticking = false;
    function update() {
        ticking = false;
        header.classList.toggle("scrolled", window.scrollY > 60);
    }
    window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
}());
