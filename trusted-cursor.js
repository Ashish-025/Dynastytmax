/*  Moving tile bands (trusted-band.js): hovering a tile that carries a person shows a small
    floating card that follows the mouse - photo, name and role - exactly as on sparklayer.io's
    "Trusted by" band. Styles in trusted-band.css (.tb-cursor).

    A tile opts in with:
      data-person="Name"                      the name line
      data-role="Job title, Company"          split at the last comma onto two lines
      data-avatar="images/....png"            photo (initials are shown without one)
      data-avatar-fit="contain"               optional: show the whole picture (logos) instead
                                              of filling the square (faces)
    Only use real people. Hidden on phones and touch screens (no hover). */
(function () {
    'use strict';
    var bands = document.querySelectorAll('.tb-viewport');
    if (!bands.length || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var cursor = document.createElement('div');
    cursor.className = 'tb-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<span class="tb-cursor-pic"><img alt=""><b></b></span>' +
        '<div><div class="tb-cursor-name"></div><div class="tb-cursor-role"></div></div>';
    document.body.appendChild(cursor);
    var pic = cursor.querySelector('.tb-cursor-pic'),
        avatar = pic.querySelector('img'),
        initials = pic.querySelector('b'),
        name = cursor.querySelector('.tb-cursor-name'),
        role = cursor.querySelector('.tb-cursor-role');

    // the card eases after the pointer (22% of the gap each frame), 14 / 15px below-right of it
    var cx = 0, cy = 0, tx = 0, ty = 0, raf = null;
    function follow() {
        cx += (tx - cx) * 0.22;
        cy += (ty - cy) * 0.22;
        cursor.style.translate = Math.round(cx + 14) + 'px ' + Math.round(cy + 15) + 'px';
        raf = requestAnimationFrame(follow);
    }
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });

    function show(tile) {
        var src = tile.getAttribute('data-avatar') || '';
        var who = tile.getAttribute('data-person') || '';
        pic.classList.toggle('is-contain', tile.getAttribute('data-avatar-fit') === 'contain');
        if (src) { avatar.src = src; pic.classList.remove('is-initials'); }
        else {
            avatar.removeAttribute('src');
            initials.textContent = who.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
            pic.classList.add('is-initials');
        }
        name.textContent = who;
        // "Job title, Company" -> company on its own line (split on the last comma)
        var text = tile.getAttribute('data-role') || '', split = text.lastIndexOf(',');
        role.textContent = '';
        if (split > -1) {
            role.appendChild(document.createElement('span')).textContent = text.slice(0, split).trim();
            role.appendChild(document.createElement('span')).textContent = text.slice(split + 1).trim();
        } else {
            role.textContent = text;
        }
        // jump to the pointer before fading in, so it doesn't fly across the screen
        cx = tx; cy = ty;
        cursor.classList.add('is-visible');
        if (!raf) follow();
    }

    Array.prototype.forEach.call(bands, function (band) {
        band.addEventListener('mouseover', function (e) {
            var tile = e.target.closest('[data-person]');
            if (tile) show(tile);
        });
        band.addEventListener('mouseout', function (e) {
            var tile = e.target.closest('[data-person]');
            if (!tile || tile.contains(e.relatedTarget)) return;
            cursor.classList.remove('is-visible');
        });
        band.addEventListener('mouseleave', function () {
            cursor.classList.remove('is-visible');
            if (raf) { cancelAnimationFrame(raf); raf = null; }
        });
    });
}());
