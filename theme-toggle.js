/*  Light / dark theme switch (moon = dark, sun = light).
    - Every new visit starts in the light theme. A switch to dark is kept only while the visitor
      moves between pages in the same tab (sessionStorage), applied in <head> by a tiny inline
      script (no flash on load).
    - This file adds the round toggle button to the header (or a floating one if a page has no header),
      remembers the choice, and switches with a circular reveal from the button where supported.
    - Other scripts can listen for the "dm-themechange" event on window. */
(function () {
    'use strict';
    var KEY = 'dm-theme';
    var root = document.documentElement;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function current() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        // light = original white/red site: switch the futuristic stylesheets off
        document.querySelectorAll('link[data-theme-css="dark"]').forEach(function (l) { l.media = theme === 'light' ? 'not all' : 'all'; });
        try { sessionStorage.setItem(KEY, theme); } catch (e) { /* private mode: still switches for this page */ }
        buttons.forEach(function (b) {
            b.setAttribute('aria-pressed', String(theme === 'light'));
            b.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
            b.title = theme === 'light' ? 'Dark mode' : 'Light mode';
        });
        window.dispatchEvent(new CustomEvent('dm-themechange', { detail: { theme: theme } }));
    }

    /* simple colour change: a short cross-fade where supported, instant otherwise */
    function toggle() {
        var next = current() === 'light' ? 'dark' : 'light';
        if (!document.startViewTransition || reduce) { apply(next); return; }
        root.classList.add('theme-anim');
        document.startViewTransition(function () { apply(next); })
            .finished.finally(function () { root.classList.remove('theme-anim'); });
    }

    var ICONS =
        '<svg class="tt-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>' +
        '<svg class="tt-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.4 14.7A8.6 8.6 0 1 1 9.3 3.6a7 7 0 0 0 11.1 11.1Z"/></svg>';

    function makeButton(extraClass) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'theme-toggle' + (extraClass ? ' ' + extraClass : '');
        b.innerHTML = ICONS;
        b.addEventListener('click', toggle);
        return b;
    }

    var buttons = [];
    var actions = document.querySelector('.site-header .header-actions');
    if (actions) {
        var btn = makeButton();
        actions.insertBefore(btn, actions.firstChild);
        buttons.push(btn);
    } else {
        var floating = makeButton('theme-toggle--floating');
        document.body.appendChild(floating);
        buttons.push(floating);
    }
    apply(current());
}());
