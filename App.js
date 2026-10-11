/* =========================================================================
   MARKON / ICONCOX — app.js
   Theme toggle, nav, scroll reveal, counters, tabs, forms, small widgets.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- Theme (default dark, persisted) ---------- */
  var THEME_KEY = "markon-theme";
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#f6f8fc" : "#080b12");
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(savedTheme === "light" ? "light" : "dark"); // default dark always

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    var next = current === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    toggles.forEach(function (btn) { btn.addEventListener("click", toggleTheme); });

    /* ---------- Sticky header ---------- */
    var header = document.querySelector(".site-header");
    function onScroll() {
      if (!header) return;
      if (window.scrollY > 24) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- Mobile menu ---------- */
    var menuBtn = document.getElementById("mobileMenuBtn");
    var navLinks = document.getElementById("navLinks");
    var overlay = document.querySelector(".nav-overlay");
    function closeMenu() {
      if (menuBtn) menuBtn.classList.remove("open");
      if (navLinks) navLinks.classList.remove("open");
      if (overlay) overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
    if (menuBtn && navLinks) {
      menuBtn.addEventListener("click", function () {
        var isOpen = navLinks.classList.toggle("open");
        menuBtn.classList.toggle("open", isOpen);
        if (overlay) overlay.classList.toggle("open", isOpen);
        document.body.style.overflow = isOpen ? "hidden" : "";
      });
      if (overlay) overlay.addEventListener("click", closeMenu);
      navLinks.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    }

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window && revealEls.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var delay = entry.target.getAttribute("data-delay") || (i % 4) * 80;
            setTimeout(function () { entry.target.classList.add("in-view"); }, delay);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
    }

    /* ---------- Count-up stats ---------- */
    var counters = document.querySelectorAll("[data-count]");
    function animateCount(el) {
      var target = el.getAttribute("data-count");
      var numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
      if (isNaN(numeric)) return; // non-numeric labels (e.g. "India", "Quick") stay as-is
      var suffix = target.replace(/^[0-9.,]+/, "");
      var prefix = target.match(/^[^0-9]*/)[0];
      var duration = 1400, start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = Math.floor(eased * numeric);
        el.textContent = prefix + val.toLocaleString("en-IN") + suffix.replace(/^[0-9.,]+/, "");
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window && counters.length) {
      var cIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); cIo.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cIo.observe(el); });
    }

    /* ---------- Tabs (product detail pages) ---------- */
    document.querySelectorAll(".tabs").forEach(function (tabGroup) {
      var tabs = tabGroup.querySelectorAll(".tab");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var target = tab.getAttribute("data-tab");
          tabs.forEach(function (t) { t.classList.remove("active"); });
          tab.classList.add("active");
          var scope = tabGroup.closest("section") || document;
          scope.querySelectorAll(".tab-content").forEach(function (c) { c.classList.remove("active"); });
          var panel = document.getElementById(target);
          if (panel) panel.classList.add("active");
        });
      });
    });

    /* ---------- Product gallery ---------- */
    document.querySelectorAll(".thumbnail[data-image]").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var wrap = thumb.closest(".product-gallery");
        if (!wrap) return;
        var mainImg = wrap.querySelector(".main-image img");
        wrap.querySelectorAll(".thumbnail").forEach(function (t) { t.classList.remove("active"); });
        thumb.classList.add("active");
        if (mainImg) mainImg.setAttribute("src", thumb.getAttribute("data-image"));
      });
    });

    /* ---------- Form validation + submit handling ---------- */
    document.querySelectorAll("form[data-validate]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        var valid = true;
        form.querySelectorAll("[required]").forEach(function (input) {
          var field = input.closest(".field");
          var ok = input.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value) : input.value.trim().length > 0;
          if (field) field.classList.toggle("invalid", !ok);
          if (!ok) valid = false;
        });
        if (!valid) { e.preventDefault(); return; }

        var successBox = form.parentElement.querySelector(".form-success");
        var errorBox = form.parentElement.querySelector(".form-error");

        if (form.getAttribute("data-demo") === "true") {
          // No backend wired up for this form - just show the success state.
          e.preventDefault();
          if (successBox) successBox.classList.add("show");
          form.reset();
          return;
        }

        if (form.getAttribute("data-fetch-json") === "true") {
          // Backend at `action` returns JSON rather than redirecting, so we
          // intercept the submit, POST as JSON, and render the result inline
          // instead of letting the browser navigate to the raw JSON response.
          e.preventDefault();
          if (errorBox) errorBox.classList.remove("show");
          var submitBtn = form.querySelector('button[type="submit"]');
          var originalBtnHtml = submitBtn ? submitBtn.innerHTML : null;
          if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = "Sending..."; }

          var payload = {};
          new FormData(form).forEach(function (value, key) { payload[key] = value; });

          fetch(form.getAttribute("action"), {
            method: form.getAttribute("method") || "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
            .then(function (res) {
              return res.json().catch(function () { return {}; }).then(function (data) {
                return { ok: res.ok, data: data };
              });
            })
            .then(function (result) {
              if (result.ok && (!result.data || result.data.status !== "error")) {
                if (successBox) successBox.classList.add("show");
                form.reset();
              } else {
                if (errorBox) {
                  errorBox.textContent = (result.data && result.data.message) || "Something went wrong. Please try again or contact us directly.";
                  errorBox.classList.add("show");
                } else {
                  alert((result.data && result.data.message) || "Something went wrong. Please try again or contact us directly.");
                }
              }
            })
            .catch(function () {
              if (errorBox) {
                errorBox.textContent = "Could not reach the server. Please check your connection and try again.";
                errorBox.classList.add("show");
              } else {
                alert("Could not reach the server. Please check your connection and try again.");
              }
            })
            .finally(function () {
              if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalBtnHtml; }
            });
        }
        // Otherwise: let the form submit normally (e.g. formsubmit.co with a real redirect).
      });
      form.querySelectorAll("input,textarea,select").forEach(function (input) {
        input.addEventListener("input", function () {
          var field = input.closest(".field");
          if (field) field.classList.remove("invalid");
        });
      });
    });

    /* ---------- Data table filter (empanelment page) ---------- */
    document.querySelectorAll(".chip-filter[data-filter-group]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var group = chip.getAttribute("data-filter-group");
        var value = chip.getAttribute("data-filter-value");
        document.querySelectorAll('.chip-filter[data-filter-group="' + group + '"]').forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var rows = document.querySelectorAll("table.data-table tbody tr");
        rows.forEach(function (row) {
          var cell = row.getAttribute("data-" + group);
          row.style.display = (value === "all" || cell === value) ? "" : "none";
        });
      });
    });
    var tableSearch = document.getElementById("tableSearch");
    if (tableSearch) {
      tableSearch.addEventListener("input", function () {
        var q = tableSearch.value.toLowerCase();
        document.querySelectorAll("table.data-table tbody tr").forEach(function (row) {
          row.style.display = row.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none";
        });
      });
    }

    /* ---------- Cookie banner ---------- */
    var cookieBanner = document.getElementById("cookieBanner");
    if (cookieBanner) {
      var accepted = false;
      try { accepted = localStorage.getItem("markon-cookies-accepted") === "true"; } catch (e) {}
      if (!accepted) setTimeout(function () { cookieBanner.classList.add("show"); }, 800);
      var acceptBtn = document.getElementById("cookieAccept");
      if (acceptBtn) acceptBtn.addEventListener("click", function () {
        try { localStorage.setItem("markon-cookies-accepted", "true"); } catch (e) {}
        cookieBanner.classList.remove("show");
      });
    }

    /* ---------- Back to top ---------- */
    var topBtn = document.querySelector(".fab-top");
    if (topBtn) topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  });
})();

    /* ---------- Animations ---------- */
    var animateEls = document.querySelectorAll("[data-animate]");
    if ("IntersectionObserver" in window && animateEls.length) {
      var aIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;
          var anim = el.getAttribute("data-animate");
          var dur = el.getAttribute("data-duration") || 600;
          var delayAttr = el.getAttribute("data-delay");
          var delay = delayAttr ? parseInt(delayAttr, 10) : 0;

          setTimeout(function () {
            el.style.animationName = anim;
            el.style.animationDuration = dur + "ms";
            el.style.animationFillMode = "both";
            el.classList.add("animated");
          }, delay);

          aIo.unobserve(el);
        });
      });

      animateEls.forEach(function (el) {
        aIo.observe(el);
      });
    }
