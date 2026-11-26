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

    /* background texture (in the place of SparkLayer's hero photo, drawn here as our own
       artwork): a blue light cone rising from a bright core at the bottom, at 22% */
    if (ground && !ground.querySelector(".dmh-tex")) {
        var tex = document.createElement("div");
        tex.className = "dmh-tex";
        tex.setAttribute("aria-hidden", "true");
        tex.innerHTML = '<i class="dmh-tex-band"></i><i class="dmh-tex-core"></i>';
        ground.insertBefore(tex, ground.firstChild);
    }

    /* tech grid: fine lines that fade to the edges, a few glowing nodes on the crossings
       and a slow scanning light */
    if (ground && !ground.querySelector(".dmh-grid-bg")) {
        var gb = document.createElement("div");
        gb.className = "dmh-grid-bg";
        gb.setAttribute("aria-hidden", "true");
        var nodes = "";
        // [column, row] crossings on the 56px grid, spread around the copy and the cards
        [[3, 2], [7, 5], [12, 3], [16, 7], [20, 2], [22, 9], [5, 10], [14, 11], [18, 4], [9, 8], [24, 6], [2, 6],
         [11, 13], [17, 10], [21, 12], [26, 3], [6, 14], [15, 1], [10, 5], [25, 10]].forEach(function (p, i) {
            nodes += '<i style="left:' + (p[0] * 56) + 'px;top:' + (p[1] * 56) + 'px;animation-delay:' + (-(i * 0.7)).toFixed(1) + 's"></i>';
        });
        // circuit tracks along the grid lines (in 56px cells), each with a data pulse running along it
        var C = 56, TRACKS = [
            [[0, 4], [5, 4], [5, 7], [9, 7]],
            [[30, 2], [24, 2], [24, 5], [20, 5]],
            [[13, 0], [13, 3], [17, 3]],
            [[30, 12], [26, 12], [26, 9], [22, 9]],
            [[0, 13], [4, 13], [4, 10], [8, 10]],
            [[18, 18], [18, 14], [23, 14]],
            [[8, 0], [8, 2], [11, 2]],
            [[30, 7], [27, 7], [27, 6]],
            [[0, 1], [2, 1], [2, 3]],
            [[12, 18], [12, 15], [15, 15], [15, 12]]
        ];
        var svgT = '<svg class="dmh-traces" width="' + (30 * C) + '" height="' + (18 * C) + '" viewBox="0 0 ' + (30 * C) + ' ' + (18 * C) + '">';
        TRACKS.forEach(function (t, i) {
            var d = t.map(function (p, j) { return (j ? "L" : "M") + (p[0] * C) + " " + (p[1] * C); }).join(" ");
            var end = t[t.length - 1];
            svgT += '<path class="tr-line" d="' + d + '"/>' +
                    '<path class="tr-pulse" pathLength="100" d="' + d + '" style="animation-duration:' + (3.2 + (i % 4) * 0.9).toFixed(1) + 's;animation-delay:' + (-(i * 0.8)).toFixed(1) + 's"/>' +
                    '<circle class="tr-pad" cx="' + (end[0] * C) + '" cy="' + (end[1] * C) + '" r="3.5"/>';
        });
        svgT += '</svg>';
        gb.innerHTML = svgT + nodes + '<b class="dmh-scan"></b>';
        var after = ground.querySelector(".dmh-tex");
        ground.insertBefore(gb, after ? after.nextSibling : ground.firstChild);
    }

    /* advanced tech layers: moving 3D grid floor, radar behind the cards, HUD readouts
       with a live India time clock, and HUD corner brackets */
    if (ground && !ground.querySelector(".dmh-floor")) {
        var floor = document.createElement("div");
        floor.className = "dmh-floor";
        floor.setAttribute("aria-hidden", "true");
        floor.innerHTML = "<i></i>";
        ground.appendChild(floor);

        var radar = document.createElement("div");
        radar.className = "dmh-radar";
        radar.setAttribute("aria-hidden", "true");
        radar.innerHTML = '<i class="rd-sweep"></i><b style="--a:40deg;--r:34%"></b><b style="--a:155deg;--r:22%"></b><b style="--a:250deg;--r:40%"></b><b style="--a:320deg;--r:15%"></b>';
        ground.appendChild(radar);

        var hud = document.createElement("div");
        hud.className = "dmh-hud";
        hud.setAttribute("aria-hidden", "true");
        hud.innerHTML =
            '<span class="hud-c hud-tl"></span><span class="hud-c hud-tr"></span><span class="hud-c hud-bl"></span><span class="hud-c hud-br"></span>' +
            '<p class="hud-tag hud-status"><i></i>LIVE &middot; GPS &middot; AIS-140 &middot; CCTV</p>' +
            '<p class="hud-tag hud-coords">20.2961&deg; N &nbsp;85.8245&deg; E &nbsp;<span>BBSR</span> &nbsp;<b data-hud-clock>--:--:--</b> IST</p>';
        ground.appendChild(hud);

        var clock = hud.querySelector("[data-hud-clock]");
        var tickClock = function () {
            try {
                clock.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Kolkata" });
            } catch (e) { clock.textContent = new Date().toTimeString().slice(0, 8); }
        };
        tickClock();
        setInterval(tickClock, 1000);
    }

    /* light arcs (SparkLayer's hero streaks): pink -> orange and blue -> violet */
    if (ground && !ground.querySelector(".dmh-arcs")) {
        var NS = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(NS, "svg");
        svg.setAttribute("class", "dmh-arcs");
        svg.setAttribute("viewBox", "0 0 1100 900");
        svg.setAttribute("preserveAspectRatio", "xMaxYMin slice");
        svg.setAttribute("aria-hidden", "true");
        svg.innerHTML =
            '<defs>' +
            '<linearGradient id="dmhArcA" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9243" stop-opacity="0"/><stop offset=".25" stop-color="#ff9243"/><stop offset=".55" stop-color="#ff026a"/><stop offset="1" stop-color="#a855f7" stop-opacity="0"/></linearGradient>' +
            '<linearGradient id="dmhArcB" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0bcefc" stop-opacity="0"/><stop offset=".3" stop-color="#0bcefc"/><stop offset=".65" stop-color="#671ef3"/><stop offset="1" stop-color="#671ef3" stop-opacity="0"/></linearGradient>' +
            '</defs>' +
            '<g><path class="arc-glow" stroke="url(#dmhArcA)" d="M1120 120 C 900 170 700 320 520 520 S 220 820 60 900"/>' +
            '<path class="arc-line" stroke="url(#dmhArcA)" d="M1120 120 C 900 170 700 320 520 520 S 220 820 60 900"/></g>' +
            '<g><path class="arc-glow" stroke="url(#dmhArcB)" d="M1120 300 C 940 330 780 430 640 580 S 380 860 240 940"/>' +
            '<path class="arc-line" stroke="url(#dmhArcB)" d="M1120 300 C 940 330 780 430 640 580 S 380 860 240 940"/>' +
            '<path class="arc-line" stroke="url(#dmhArcB)" opacity=".5" d="M1120 40 C 980 60 860 120 760 210"/></g>';
        ground.appendChild(svg);
    }

    /* bottom of the hero: a sweeping white curve with a thin cyan -> violet -> pink ->
       orange band along it (SparkLayer's hero edge; our own curve, their gradient colours) */
    var stage = document.querySelector(".dmh-stage");
    if (stage && !stage.querySelector(".dmh-curve")) {
        var cv = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        cv.setAttribute("class", "dmh-curve");
        cv.setAttribute("viewBox", "0 0 1800 171");
        cv.setAttribute("preserveAspectRatio", "none");
        cv.setAttribute("aria-hidden", "true");
        cv.innerHTML =
            '<defs><linearGradient id="dmhCurveGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1800" y2="0">' +
            '<stop offset="0" stop-color="#0dccfc"/><stop offset=".125" stop-color="#0dccfc"/>' +
            '<stop offset=".376" stop-color="#5b36f5"/><stop offset=".624" stop-color="#fc2f86"/>' +
            '<stop offset=".874" stop-color="#ff9443"/><stop offset="1" stop-color="#ff9443"/></linearGradient></defs>' +
            '<path fill="url(#dmhCurveGrad)" d="M1800 -16 C1420 72 1290 134 900 134 C560 134 270 88 0 70 V171 H1800 Z"/>' +
            '<path fill="#fff" d="M1800 -2 C1420 86 1290 148 900 148 C560 148 270 102 0 84 V171 H1800 Z"/>';
        stage.appendChild(cv);
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
