const themeButton = document.getElementById("themeButton");
const mobileButton = document.getElementById("mobileMenuButton");
const mobileNav = document.getElementById("mobileNav");

let darkMode = true;

const revealItems = document.querySelectorAll(".dm-reveal");

if (revealItems.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("dm-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealItems.forEach(function (item) {
        revealObserver.observe(item);
    });
}

if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", function () {
        const isOpen = mobileNav.classList.contains("active");

        mobileNav.classList.toggle("active");
        mobileButton.classList.toggle("active");
        mobileButton.setAttribute("aria-expanded", String(!isOpen));
        mobileButton.setAttribute(
            "aria-label",
            isOpen ? "Open navigation menu" : "Close navigation menu"
        );

        if (isOpen) {
            document.querySelectorAll(".mobile-nav-item.open").forEach(function (item) {
                item.classList.remove("open");
            });
        }
    });

    document.querySelectorAll(".mobile-dropdown-toggle").forEach(function (button) {
        button.addEventListener("click", function () {
            const parent = button.closest(".mobile-nav-item");
            if (!parent) return;

            const isOpen = parent.classList.contains("open");

            document.querySelectorAll(".mobile-nav-item.open").forEach(function (item) {
                if (item !== parent) {
                    item.classList.remove("open");
                }
            });

            parent.classList.toggle("open", !isOpen);
        });
    });

    document.querySelectorAll(".mobile-nav a").forEach(function (link) {
        link.addEventListener("click", function () {
            mobileNav.classList.remove("active");
            mobileButton.classList.remove("active");
            mobileButton.setAttribute("aria-expanded", "false");
            mobileButton.setAttribute("aria-label", "Open navigation menu");
            document.querySelectorAll(".mobile-nav-item.open").forEach(function (item) {
                item.classList.remove("open");
            });
        });
    });
}

if (themeButton) {
    themeButton.addEventListener("click", () => {
        darkMode = !darkMode;

        const header = document.querySelector(".site-header");

        if (!darkMode) {
            document.body.style.background = "#f3f5f8";
            document.body.style.color = "#111827";

            if (header) {
                header.style.background = "#ffffff";
            }

            themeButton.textContent = "☀";
        } else {
            document.body.style.background = "#05080f";
            document.body.style.color = "#ffffff";

            if (header) {
                header.style.background = "#080c15";
            }

            themeButton.textContent = "☾";
        }
    });
}

window.addEventListener("resize", function () {
    if (window.innerWidth > 850 && mobileNav && mobileButton) {
        mobileNav.classList.remove("active");
        mobileButton.classList.remove("active");
        mobileButton.setAttribute("aria-expanded", "false");
        mobileButton.setAttribute("aria-label", "Open navigation menu");
        document.querySelectorAll(".mobile-nav-item.open").forEach(function (item) {
            item.classList.remove("open");
        });
    }
});