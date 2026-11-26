/* Home page hero: the enquiry box and the quick buttons open a WhatsApp chat with the
   message filled in (the site's CSP only allows forms to post to itself, so this is
   done here rather than with a form action). */
(function () {
    "use strict";
    var WA = "https://wa.me/919937020621?text=";
    function openChat(msg) {
        var text = "Hello DMAX, " + (msg || "I would like to talk to you.");
        window.open(WA + encodeURIComponent(text), "_blank", "noopener");
    }

    var form = document.querySelector("[data-hm-ask]");
    if (form) {
        var input = form.querySelector("input");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var q = input.value.trim();
            if (!q) { input.focus(); return; }
            openChat(q);
            input.value = "";
            input.blur();
        });

        /* the placeholder types out example requests, one after another; it pauses
           while the visitor is in the field, off screen, or prefers less motion */
        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduce) {
            var LINES = ["GPS tracking for 10 trucks", "AIS-140 device for RTO passing", "CCTV for my shop", "Biometric attendance for my office", "A website for my business", "Logo and branding for my brand"];
            var base = input.placeholder, li = 0, ci = 0, del = false, seen = true;
            if ("IntersectionObserver" in window) {
                new IntersectionObserver(function (es) { seen = es[es.length - 1].isIntersecting; }).observe(form);
            }
            var tick = function () {
                if (!seen || document.hidden || document.documentElement.classList.contains("dm-loading")) { setTimeout(tick, 800); return; }
                if (document.activeElement === input || input.value) { input.placeholder = base; setTimeout(tick, 1200); return; }
                var line = LINES[li];
                ci += del ? -1 : 1;
                input.placeholder = line.slice(0, ci) || " ";
                var wait = del ? 24 : 55;
                if (!del && ci >= line.length) { del = true; wait = 2000; }
                else if (del && ci <= 0) { del = false; li = (li + 1) % LINES.length; wait = 350; }
                setTimeout(tick, wait);
            };
            setTimeout(tick, 1500);
        }
    }

    [].forEach.call(document.querySelectorAll("[data-hm-say]"), function (b) {
        b.addEventListener("click", function () { openChat(b.getAttribute("data-hm-say")); });
    });
}());
