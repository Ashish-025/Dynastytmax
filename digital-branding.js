/* Digital Branding page: typing headline, scroll reveal, portfolio filter. */
(function () {
    'use strict';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- headline: clip each word out and the next one in ---- */
    var wrap = document.querySelector('.dbs-words');
    if (wrap && !wrap.hasAttribute('data-driven')) {   // data-driven="phones": dbs-phones.js flips the words in step with the phones
        var words = Array.prototype.slice.call(wrap.querySelectorAll('b'));
        var index = 0;
        var fit = function () {
            wrap.style.width = '';
            wrap.style.width = wrap.offsetWidth + 'px';
        };
        fit();
        window.addEventListener('resize', fit);
        if (!reduce && words.length > 1) {
            setInterval(function () {
                wrap.style.width = '2px';
                setTimeout(function () {
                    words[index].classList.remove('is-visible');
                    index = (index + 1) % words.length;
                    words[index].classList.add('is-visible');
                    wrap.style.transition = 'none';
                    wrap.style.width = '';
                    var target = wrap.offsetWidth;
                    wrap.style.width = '2px';
                    void wrap.offsetWidth;
                    wrap.style.transition = '';
                    wrap.style.width = target + 'px';
                }, 650);
            }, 3200);
        }
    }

    /* ---- scroll-triggered: the Core Services items slide in once ---- */
    var targets = document.querySelectorAll('.dbs-fade-left');
    var show = function (el) { el.classList.add('is-in'); };
    if (!('IntersectionObserver' in window)) {
        Array.prototype.forEach.call(targets, show);
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                show(entry.target);
                io.unobserve(entry.target);
            });
        }, { threshold: .2 });
        Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
    }

    /* ---- portfolio filter (like the theme's Shuffle grid): non-matching items shrink and
            fade out, then leave the grid so the rest close up; matching ones fade back in ---- */
    var filterBox = document.querySelector('.dbs-filters');
    if (filterBox) {
        var items = Array.prototype.slice.call(document.querySelectorAll('.dbs-work'));
        filterBox.addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-filter]');
            if (!btn) return;
            Array.prototype.forEach.call(filterBox.children, function (b) {
                b.classList.toggle('is-active', b === btn);
                b.setAttribute('aria-pressed', String(b === btn));
            });
            var f = btn.getAttribute('data-filter');
            items.forEach(function (item) {
                var show = f === 'all' || (' ' + item.getAttribute('data-groups') + ' ').indexOf(' ' + f + ' ') > -1;
                if (show) {
                    item.classList.remove('is-hidden');
                    void item.offsetWidth;                      // restart the fade-in
                    item.classList.remove('is-hiding');
                } else if (!item.classList.contains('is-hidden')) {
                    item.classList.add('is-hiding');
                    setTimeout(function () {
                        if (item.classList.contains('is-hiding')) item.classList.add('is-hidden');
                    }, reduce ? 0 : 350);
                }
            });
        });
    }
}());
