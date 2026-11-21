/* SparkLayer homepage motion (styles in spark-motion.css):
   - adds the drifting colour ribbons to the home hero
   - marks the main buttons for the running edge light and the section labels for the shimmer
   - adds the orbiting border light to the service panels and the How We Work photo
   - fades more blocks up into view (service panels, How We Work, call-to-action band...)
   Load after dark-spark.js and fx-enhance.js. */
(function () {
    "use strict";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* hero ribbons */
    var ground = document.querySelector(".dmh-ground");
    if (ground && !ground.querySelector(".dmh-ribbon")) {
        var rb = document.createElement("div");
        rb.className = "dmh-ribbon";
        rb.setAttribute("aria-hidden", "true");
        rb.innerHTML = "<i></i><i></i><i></i><i></i>";
        ground.insertBefore(rb, ground.firstChild);
    }

    /* running edge light on the main buttons */
    [].forEach.call(document.querySelectorAll(".dmh-btn--white, .site-header .app-button"), function (b) {
        b.classList.add("sl-shimmer");
    });

    /* shimmering section labels */
    [].forEach.call(document.querySelectorAll(".dm-services-label, .section-label, .ssi-kicker, .ssi-eyebrow, .contact-eyebrow"), function (l) {
        l.classList.add("sl-eyebrow");
    });

    /* orbiting border light on more cards */
    [].forEach.call(document.querySelectorAll(".sb-box, .dm-ft-media"), function (card, i) {
        if (card.querySelector(":scope > .ds-orbit")) return;
        var o = document.createElement("span");
        o.className = "ds-orbit";
        o.setAttribute("aria-hidden", "true");
        o.style.animationDelay = (-2.2 * (i % 3)).toFixed(1) + "s";
        card.appendChild(o);
    });

    /* more blocks fade up into view */
    var blocks = [].slice.call(document.querySelectorAll(
        ".sb-boxes, .dm-ft-tabs, .dm-ft-content, .dm-cta, .tb-wrap, .trusted-band, .google-rating, .dm-rating"
    )).filter(function (b) { return !b.classList.contains("ds-rv"); });
    blocks.forEach(function (b) { b.classList.add("ds-rv"); });
    function show(b) { b.classList.add("ds-in"); }
    if (reduce || !("IntersectionObserver" in window)) {
        blocks.forEach(show);
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                show(en.target);
                io.unobserve(en.target);
            });
        }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
        blocks.forEach(function (b) { io.observe(b); });
    }
}());
