(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {

        /* =====================================
           INFINITE MARQUEE (product cards)
           Repeat the set until one half of the track is wider than the
           screen, then double it: the CSS animation slides by -50%, so the
           second half lands exactly where the first began (seamless loop).
           ===================================== */

        function setupMarquee(track, pxPerSecond) {
            if (!track) return;
            const items = Array.from(track.children);

            function appendClones() {
                items.forEach(function (item) {
                    const clone = item.cloneNode(true);
                    clone.setAttribute("aria-hidden", "true");
                    clone.setAttribute("tabindex", "-1");
                    clone.querySelectorAll("a, button").forEach(function (el) {
                        el.setAttribute("tabindex", "-1");
                    });
                    // copies are never watched by the scroll-reveal script, so show them as-is
                    clone.classList.remove("fx-rise");
                    track.appendChild(clone);
                });
            }

            const setWidth = track.scrollWidth || 1;
            const minWidth = Math.max(window.innerWidth, screen.width || 0);
            let copies = 1;

            while (setWidth * copies < minWidth && copies < 10) {
                appendClones();
                copies++;
            }

            for (let i = 0; i < copies; i++) {
                appendClones();
            }

            // Keep a steady speed however many items there are.
            track.style.animationDuration =
                Math.round((setWidth * copies) / pxPerSecond) + "s";
        }

        setupMarquee(document.getElementById("productsTrack"), 90);   // px per second
        setupPressZoom(document.getElementById("productsTrack"));

        /* =====================================
           PRESS-TO-ZOOM (product cards)
           Cards all stay the same size in one straight row. Putting a finger
           (or pressing the mouse) on a card zooms it in instantly and holds the
           row still until the finger is lifted; hover does the same on desktop
           (see products-logos.css). One listener on the track also covers the
           cloned cards.
           ===================================== */

        function setupPressZoom(track) {
            if (!track) return;
            const wrap = track.parentElement;
            let pressed = null;

            function release() {
                if (pressed) pressed.classList.remove("is-pressed");
                pressed = null;
                wrap.classList.remove("is-holding");
            }

            track.addEventListener("pointerdown", function (e) {
                const card = e.target.closest(".dm-product-card");
                if (!card) return;
                release();
                pressed = card;
                card.classList.add("is-pressed");
                wrap.classList.add("is-holding");
            });
            ["pointerup", "pointercancel", "pointerleave"].forEach(function (type) {
                track.addEventListener(type, release);
            });
            // a touch that turns into a sideways/vertical scroll should not leave the card zoomed
            window.addEventListener("scroll", release, { passive: true });
        }

        /* =====================================
           DESKTOP DROPDOWNS
           ===================================== */

        const navItems = document.querySelectorAll(".nav-item.has-dropdown");
        const canHoverDropdowns = window.matchMedia &&
            window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        navItems.forEach(function (item) {

            const button = item.querySelector(".dropdown-toggle");

            if (button) {
                button.setAttribute("aria-haspopup", "true");
                button.setAttribute(
                    "aria-expanded",
                    item.classList.contains("open") ? "true" : "false"
                );
            }

            function setDropdownOpen(isOpen) {
                item.classList.toggle("open", isOpen);
                if (button) {
                    button.setAttribute("aria-expanded", String(isOpen));
                }
            }

            // Always clear a click-open state once the pointer leaves the item.
            // This also covers browsers with incomplete hover media-query support.
            item.addEventListener("mouseleave", function () {
                setDropdownOpen(false);
            });

            if (canHoverDropdowns) {
                item.addEventListener("mouseenter", function () {
                    setDropdownOpen(true);
                });

                item.addEventListener("focusin", function () {
                    setDropdownOpen(true);
                });

                item.addEventListener("focusout", function (event) {
                    if (!item.contains(event.relatedTarget)) {
                        setDropdownOpen(false);
                    }
                });
            }

            button.addEventListener("click", function (event) {

                event.stopPropagation();

                // Pointer hover and keyboard focus control desktop menus.
                // Keep click toggling for touch and non-hover devices.
                if (canHoverDropdowns) {
                    return;
                }

                const isOpen = item.classList.contains("open");

                // Close all dropdowns
                navItems.forEach(function (otherItem) {
                    otherItem.classList.remove("open");

                    const otherButton =
                        otherItem.querySelector(".dropdown-toggle");

                    if (otherButton) {
                        otherButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                });

                // Open selected dropdown
                if (!isOpen) {
                    item.classList.add("open");

                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );
                }
            });
        });


        /* =====================================
           CLOSE DESKTOP DROPDOWN ON OUTSIDE CLICK
           ===================================== */

        document.addEventListener("click", function () {

            navItems.forEach(function (item) {
                item.classList.remove("open");

                const button =
                    item.querySelector(".dropdown-toggle");

                if (button) {
                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            });

        });


        /* =====================================
           MOBILE MENU
           ===================================== */

        const mobileButton =
            document.getElementById("mobileMenuButton");

        const mobileNav =
            document.getElementById("mobileNav");

        if (mobileButton && mobileNav) {

            mobileButton.addEventListener("click", function () {

                const isOpen =
                    mobileNav.classList.contains("active");

                mobileNav.classList.toggle("active");

                mobileButton.classList.toggle("active");

                mobileButton.setAttribute(
                    "aria-expanded",
                    String(!isOpen)
                );

                mobileButton.setAttribute(
                    "aria-label",
                    isOpen
                        ? "Open navigation menu"
                        : "Close navigation menu"
                );

                // Close mobile dropdowns when menu closes
                if (isOpen) {
                    closeMobileDropdowns();
                }
            });
        }


        /* =====================================
           MOBILE DROPDOWNS
           ===================================== */

        const mobileDropdownButtons =
            document.querySelectorAll(
                ".mobile-dropdown-toggle"
            );

        mobileDropdownButtons.forEach(function (button) {

            button.addEventListener("click", function () {

                const parent =
                    button.closest(".mobile-nav-item");

                if (!parent) {
                    return;
                }

                const isOpen =
                    parent.classList.contains("open");

                // Close other mobile dropdowns
                document
                    .querySelectorAll(".mobile-nav-item.open")
                    .forEach(function (item) {

                        if (item !== parent) {
                            item.classList.remove("open");
                        }
                    });

                parent.classList.toggle("open", !isOpen);
            });
        });


        function closeMobileDropdowns() {

            document
                .querySelectorAll(".mobile-nav-item.open")
                .forEach(function (item) {
                    item.classList.remove("open");
                });
        }


        /* =====================================
           CLOSE MOBILE MENU WHEN LINK IS CLICKED
           ===================================== */

        const mobileLinks =
            document.querySelectorAll(
                ".mobile-nav a"
            );

        mobileLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                if (!mobileNav || !mobileButton) {
                    return;
                }

                mobileNav.classList.remove("active");
                mobileButton.classList.remove("active");

                mobileButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                mobileButton.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );

                closeMobileDropdowns();
            });
        });
/* =====================================
           ESC KEY
           ===================================== */

        document.addEventListener("keydown", function (event) {

            if (event.key !== "Escape") {
                return;
            }

            // Close desktop dropdowns
            navItems.forEach(function (item) {
                item.classList.remove("open");

                const button =
                    item.querySelector(".dropdown-toggle");

                if (button) {
                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            });

            // Close mobile menu
            if (mobileNav && mobileButton) {

                mobileNav.classList.remove("active");
                mobileButton.classList.remove("active");

                mobileButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                mobileButton.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );

                closeMobileDropdowns();
            }
        });


        /* =====================================
           SECTION REVEAL EFFECT
           ===================================== */

        const revealItems = document.querySelectorAll(".dm-reveal");

        // on the home page, wait for the preloader to finish so the hero animates in view
        function whenPageReady(start) {
            if (document.documentElement.classList.contains("dm-loading")) {
                document.addEventListener("dm:ready", start, { once: true });
            } else {
                start();
            }
        }

        if (revealItems.length) whenPageReady(function () {
            const revealObserver = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("dm-visible");
                            revealObserver.unobserve(entry.target);
                        }
                    });
                },
                {
                    // reveal once the element's top is ~12% of the screen into view. (A ratio
                    // threshold never fired for sections taller than the screen - e.g. the
                    // Mobility products on a phone - so they stayed invisible.)
                    threshold: 0,
                    rootMargin: "0px 0px -12% 0px"
                }
            );

            revealItems.forEach(function (item) {
                revealObserver.observe(item);
            });
        });

        /* =====================================
           ACHIEVEMENT COUNTERS
           Count up from 0 like a real counter: every number ticks through (3,000 shows
           1, 2 ... 2,999), fast at first and slowing into the final value. Starts once
           the strip is well in view (after the preloader), the cards a beat apart, and
           counts again each time the strip is scrolled back into view.
           ===================================== */

        const COUNT_TIME = 2600;
        const countFormat = new Intl.NumberFormat("en-IN");

        function showCount(counter, value) {
            counter.textContent = countFormat.format(value) + (counter.dataset.suffix || "");
        }

        function animateCounter(counter, delay) {
            const target = Number(counter.dataset.target || 0);
            const run = ++counter.countRun;                      // a newer run cancels this one
            let startTime = 0;

            showCount(counter, 0);

            function updateCounter(now) {
                if (run !== counter.countRun) return;
                if (!startTime) startTime = now + delay;
                const progress = Math.max(0, Math.min((now - startTime) / COUNT_TIME, 1));
                const eased = 1 - Math.pow(1 - progress, 2.2);   // steady ticking, easing off at the end
                showCount(counter, Math.floor(target * eased));

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    showCount(counter, target);
                }
            }

            requestAnimationFrame(updateCounter);
        }

        const achievementCounters = document.querySelectorAll(".stat-number");

        if (achievementCounters.length) {
            achievementCounters.forEach(function (counter, index) {
                counter.countRun = 0;
                counter.countIndex = index;
                showCount(counter, 0);
            });

            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            whenPageReady(function () {
                if (reduceMotion || !("IntersectionObserver" in window)) {
                    achievementCounters.forEach(function (counter) {
                        showCount(counter, Number(counter.dataset.target || 0));
                    });
                    return;
                }

                const counterObserver = new IntersectionObserver(
                    function (entries) {
                        entries.forEach(function (entry) {
                            const counter = entry.target;
                            if (entry.intersectionRatio >= 0.6 && !counter.counting) {
                                counter.counting = true;
                                animateCounter(counter, counter.countIndex * 140);
                            } else if (!entry.isIntersecting && counter.counting) {
                                counter.counting = false;    // off screen: ready to count again
                                counter.countRun++;
                                showCount(counter, 0);
                            }
                        });
                    },
                    {
                        threshold: [0, 0.6]
                    }
                );

                achievementCounters.forEach(function (counter) {
                    counterObserver.observe(counter);
                });
            });
        }

        /* =====================================
           HANDLE WINDOW RESIZE
           ===================================== */

        let resizeTimer;

        window.addEventListener("resize", function () {

            clearTimeout(resizeTimer);

            resizeTimer = setTimeout(function () {

                if (window.innerWidth > 850) {

                    if (mobileNav) {
                        mobileNav.classList.remove("active");
                    }

                    if (mobileButton) {
                        mobileButton.classList.remove("active");

                        mobileButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        mobileButton.setAttribute(
                            "aria-label",
                            "Open navigation menu"
                        );
                    }

                    closeMobileDropdowns();
                }

            }, 100);
        });

    });

})();
/* Rotates mining and fleet photos through the lower mosaic tile, always entering from the right. */
(function () {
    const tile = document.querySelector(".dm-i3ms-mine-photo");
    if (!tile || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const images = Array.from(tile.querySelectorAll("img"));
    if (images.length < 2) return;

    let activeIndex = Math.max(0, images.findIndex(function (image) {
        return image.classList.contains("is-active");
    }));

    images.forEach(function (image, index) {
        image.style.transform = index === activeIndex ? "translateX(0)" : "translateX(100%)";
    });

    const slideDelay = 3600 + Math.random() * 2400;

    window.setInterval(function () {
        if (document.hidden) return;

        const outgoing = images[activeIndex];
        const nextIndex = (activeIndex + 1) % images.length;
        const incoming = images[nextIndex];
        const direction = Math.random() < 0.5 ? -1 : 1;
        const incomingStart = direction < 0 ? "translateX(-100%)" : "translateX(100%)";
        const outgoingEnd = direction < 0 ? "translateX(100%)" : "translateX(-100%)";

        incoming.style.transition = "none";
        incoming.style.transform = incomingStart;
        void incoming.offsetWidth;
        incoming.style.transition = "";

        window.requestAnimationFrame(function () {
            incoming.style.transform = "translateX(0)";
            outgoing.style.transform = outgoingEnd;
        });

        outgoing.classList.remove("is-active");
        incoming.classList.add("is-active");
        activeIndex = nextIndex;

        incoming.addEventListener("transitionend", function onTransitionEnd(event) {
            if (event.propertyName !== "transform") return;
            incoming.removeEventListener("transitionend", onTransitionEnd);
            outgoing.style.transition = "none";
            outgoing.style.transform = incomingStart;
            void outgoing.offsetWidth;
            outgoing.style.transition = "";
        });
    }, slideDelay);
})();

/* Rotates the Reports and Returns tile through related photos, moving right to left. */
(function () {
    const tile = document.querySelector(".dm-i3ms-reports");
    if (!tile || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const slides = Array.from(tile.querySelectorAll(".dm-i3ms-report-slide"));
    if (slides.length < 2) return;

    let activeIndex = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
    }));

    slides.forEach(function (slide, index) {
        slide.style.transform = index === activeIndex ? "translateX(0)" : "translateX(100%)";
    });

    const slideDelay = 3200 + Math.random() * 2800;

    window.setInterval(function () {
        if (document.hidden) return;

        const outgoing = slides[activeIndex];
        const nextIndex = (activeIndex + 1) % slides.length;
        const incoming = slides[nextIndex];
        const direction = Math.random() < 0.5 ? -1 : 1;
        const incomingStart = direction < 0 ? "translateX(-100%)" : "translateX(100%)";
        const outgoingEnd = direction < 0 ? "translateX(100%)" : "translateX(-100%)";

        incoming.style.transition = "none";
        incoming.style.transform = incomingStart;
        void incoming.offsetWidth;
        incoming.style.transition = "";

        window.requestAnimationFrame(function () {
            incoming.style.transform = "translateX(0)";
            outgoing.style.transform = outgoingEnd;
        });

        outgoing.classList.remove("is-active");
        incoming.classList.add("is-active");
        activeIndex = nextIndex;

        incoming.addEventListener("transitionend", function onTransitionEnd(event) {
            if (event.propertyName !== "transform") return;
            incoming.removeEventListener("transitionend", onTransitionEnd);
            outgoing.style.transition = "none";
            outgoing.style.transform = incomingStart;
            void outgoing.offsetWidth;
            outgoing.style.transition = "";
        });
    }, slideDelay);
})();

/* Cycles the upper mining photo tile with the same right-to-left slide. */
(function () {
    const tile = document.querySelector(".dm-i3ms-mining-photo");
    if (!tile || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const images = Array.from(tile.querySelectorAll("img"));
    if (images.length < 2) return;

    let activeIndex = Math.max(0, images.findIndex(function (image) {
        return image.classList.contains("is-active");
    }));

    images.forEach(function (image, index) {
        image.style.transform = index === activeIndex ? "translateX(0)" : "translateX(100%)";
    });

    const slideDelay = 3800 + Math.random() * 2600;

    window.setInterval(function () {
        if (document.hidden) return;

        const outgoing = images[activeIndex];
        const nextIndex = (activeIndex + 1) % images.length;
        const incoming = images[nextIndex];
        const direction = Math.random() < 0.5 ? -1 : 1;
        const incomingStart = direction < 0 ? "translateX(-100%)" : "translateX(100%)";
        const outgoingEnd = direction < 0 ? "translateX(100%)" : "translateX(-100%)";

        incoming.style.transition = "none";
        incoming.style.transform = incomingStart;
        void incoming.offsetWidth;
        incoming.style.transition = "";

        window.requestAnimationFrame(function () {
            incoming.style.transform = "translateX(0)";
            outgoing.style.transform = outgoingEnd;
        });

        outgoing.classList.remove("is-active");
        incoming.classList.add("is-active");
        activeIndex = nextIndex;

        incoming.addEventListener("transitionend", function onTransitionEnd(event) {
            if (event.propertyName !== "transform") return;
            incoming.removeEventListener("transitionend", onTransitionEnd);
            outgoing.style.transition = "none";
            outgoing.style.transform = incomingStart;
            void outgoing.offsetWidth;
            outgoing.style.transition = "";
        });
    }, slideDelay);
})();

/* Alternates the I3MS-style "Do you know?" tile with a mining image. */
(function () {
    const tile = document.querySelector(".dm-i3ms-know");
    if (!tile || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const infoPanel = tile.querySelector(".dm-i3ms-know-panel");
    const imagePanel = tile.querySelector(".dm-i3ms-know-image");
    if (!infoPanel || !imagePanel) return;

    let visiblePanel = infoPanel;
    const panels = [infoPanel, imagePanel];
    panels.forEach(function (panel) {
        panel.style.transform = panel === infoPanel ? "translateX(0)" : "translateX(100%)";
    });

    const slideDelay = 4000 + Math.random() * 2200;

    window.setInterval(function () {
        if (document.hidden) return;

        const enteringPanel = visiblePanel === infoPanel ? imagePanel : infoPanel;
        const leavingPanel = visiblePanel;
        const direction = Math.random() < 0.5 ? -1 : 1;
        const enteringStart = direction < 0 ? "translateX(-100%)" : "translateX(100%)";
        const leavingEnd = direction < 0 ? "translateX(100%)" : "translateX(-100%)";

        enteringPanel.style.transition = "none";
        enteringPanel.style.transform = enteringStart;
        void enteringPanel.offsetWidth;
        enteringPanel.style.transition = "";

        window.requestAnimationFrame(function () {
            enteringPanel.style.transform = "translateX(0)";
            leavingPanel.style.transform = leavingEnd;
        });

        visiblePanel = enteringPanel;

        enteringPanel.addEventListener("transitionend", function onTransitionEnd(event) {
            if (event.propertyName !== "transform") return;
            enteringPanel.removeEventListener("transitionend", onTransitionEnd);
            leavingPanel.style.transition = "none";
            leavingPanel.style.transform = enteringStart;
            void leavingPanel.offsetWidth;
            leavingPanel.style.transition = "";
        });
    }, slideDelay);
})();
