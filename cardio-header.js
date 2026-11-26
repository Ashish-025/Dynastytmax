/* Header: turns into the white frosted bar (and drops in) once the page is scrolled.
   On the home page it stays part of the dark hero until the hero has scrolled
   out from under it; elsewhere it switches after 60px. */
(function () {
    "use strict";
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var hero = document.querySelector(".dm-fhero");
    var ticking = false;
    function threshold() {
        if (!hero) return 60;
        // the hero's bottom edge, measured from the top of the page, less the header's height
        return hero.getBoundingClientRect().bottom + window.scrollY - header.offsetHeight;
    }
    function update() {
        ticking = false;
        header.classList.toggle("scrolled", window.scrollY > threshold());
        header.classList.toggle("is-top", window.scrollY < 8);   // see-through at the very top
    }
    window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
}());
