/*  Hero "recent clients" (home page, under "Smart Solutions for a Safer Tomorrow"):
    three overlapping round client pictures, and beside them who bought which
    device and at what time. Every few seconds the pictures slide sideways by one: the first
    slides out on the left, a new buyer slides in on the right and their purchase replaces
    the line. Pauses while hovered.
    Fills <div class="hero-buyers"> in index.html; styles in hero-buyers.css. */
(function () {
    'use strict';
    var box = document.querySelector('.hero-buyers');
    if (!box) return;

    /* ------------------------------------------------------------------
       CLIENT LIST - REPLACE THESE SAMPLE ENTRIES WITH REAL RECENT ORDERS.
       They are examples only: showing purchases that did not happen can mislead
       buyers, so list real clients (ask them before showing a name or photo).
         name   - as the client is happy to be shown, e.g. "Rakesh M." or a company name
         place  - town / district
         device - what they bought (names from the Mobility page)
         time   - when they bought it, as "YYYY-MM-DD HH:MM" (e.g. "2026-10-15 09:40");
                  shown as that time, e.g. "10:42 AM" (plus the date if not today)
                  (the sample entries use ago: minutes before now instead)
         photo  - optional: path to a small square photo, e.g. "images/clients/rakesh.jpg";
                  leave it out and the client's initials are shown instead
       ------------------------------------------------------------------ */
    var CLIENTS = [
        { name: 'Rakesh M.', place: 'Bhubaneswar', device: 'V5 GPS Tracker', ago: 4 },
        { name: 'Priya S.', place: 'Cuttack', device: 'VL149 4G Tracker', ago: 12 },
        { name: 'Anil K.', place: 'Rourkela', device: 'Wetrack140 AIS 140', ago: 26 },
        { name: 'Sunita P.', place: 'Sambalpur', device: 'EE202L Dashcam', ago: 41 },
        { name: 'Deepak R.', place: 'Berhampur', device: 'Fuel Level Sensor', ago: 58 },
        { name: 'Manoj T.', place: 'Keonjhar', device: 'Speed Governor', ago: 95 },
        { name: 'Sneha B.', place: 'Puri', device: 'PG201 Personal Tracker', ago: 7 },
        { name: 'Bikash D.', place: 'Angul', device: 'TraxSmart AIS140', ago: 150 },
        { name: 'Ritu N.', place: 'Balasore', device: 'GT800 Tracker', ago: 19 },
        { name: 'Suresh P.', place: 'Jharsuguda', device: 'Fire Suppression (FDSS)', ago: 210 }
    ];
    var EVERY_MS = 3800;         // a new buyer every 3.8 seconds

    var GRADS = [['#a855f7', '#7c3aed'], ['#38bdf8', '#0ea5e9'], ['#fb7185', '#e11d48'], ['#2dd4bf', '#0d9488'], ['#ec4899', '#be185d'], ['#22d3ee', '#0891b2'], ['#60a5fa', '#2563eb']];

    function initials(name) {
        return name.replace(/[^A-Za-z ]/g, ' ').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    }
    function face(c, i) {
        var el = document.createElement('span');
        el.className = 'hb-face';
        if (c.photo) {
            var img = document.createElement('img');
            img.src = c.photo; img.alt = ''; img.loading = 'lazy';
            el.appendChild(img);
        } else {
            var g = GRADS[i % GRADS.length];
            el.style.background = 'linear-gradient(135deg,' + g[0] + ',' + g[1] + ')';
            el.textContent = initials(c.name);
        }
        return el;
    }

    // the time they bought it, e.g. "10:42 AM" (with the date if it was not today: "14 Oct, 6:05 PM")
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function boughtAt(c) {
        var d = c.time ? new Date(c.time.replace(' ', 'T')) : new Date(Date.now() - (c.ago || 0) * 60000);
        if (isNaN(d)) return '';
        var h = d.getHours(), m = ('0' + d.getMinutes()).slice(-2);
        var clock = (h % 12 || 12) + ':' + m + (h < 12 ? ' AM' : ' PM');
        return d.toDateString() === new Date().toDateString() ? clock : d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + clock;
    }
    function line(c) {
        var el = document.createElement('p');
        el.className = 'hb-line';
        var who = document.createElement('strong');
        who.textContent = c.name;
        var from = document.createElement('span');
        from.className = 'hb-from';
        from.textContent = ' from ' + c.place;
        var what = document.createElement('span');
        what.className = 'hb-what';
        what.appendChild(document.createTextNode('bought '));
        var dev = document.createElement('b');
        dev.textContent = c.device;
        what.appendChild(dev);
        what.appendChild(document.createTextNode(' · ' + boughtAt(c)));
        el.appendChild(who); el.appendChild(from); el.appendChild(what);
        return el;
    }

    if (!CLIENTS.length) { box.hidden = true; return; }

    // random order, never a client that is already in the row
    var SHOWN = Math.min(3, CLIENTS.length);   // round pictures on screen at a time
    var inRow = [];
    function pick() {
        var i;
        do { i = Math.floor(Math.random() * CLIENTS.length); } while (inRow.indexOf(i) > -1 && CLIENTS.length > SHOWN);
        return i;
    }

    // [3 overlapping round pictures, sliding sideways]  [newest buyer: name, place, device, time]
    var stack = document.createElement('div');
    stack.className = 'hb-stack';
    stack.setAttribute('aria-hidden', 'true');
    var track = document.createElement('div');
    track.className = 'hb-track';
    stack.appendChild(track);
    var info = document.createElement('div');
    info.className = 'hb-info';
    info.setAttribute('aria-live', 'polite');
    box.appendChild(stack); box.appendChild(info);

    function detail(i, animate) {
        var old = info.querySelector('.hb-line:not(.is-out)');
        var el = line(CLIENTS[i]);
        info.appendChild(el);
        if (!animate) return;
        el.classList.add('is-new');
        void el.offsetWidth;
        el.classList.remove('is-new');
        if (old) { old.classList.add('is-out'); setTimeout(function () { old.remove(); }, 600); }
    }
    for (var k = 0; k < SHOWN; k++) {
        var i0 = pick();
        inRow.push(i0);
        track.appendChild(face(CLIENTS[i0], i0));
    }
    track.lastChild.classList.add('is-latest');
    detail(inRow[inRow.length - 1], false);

    // side movement: the row slides one picture to the left - the first one slides out on the
    // left while a new buyer slides in on the right, and their purchase replaces the line
    var busy = false;
    function step() {
        if (busy) return;
        busy = true;
        var i = pick();
        var f = face(CLIENTS[i], i);
        f.classList.add('is-new');
        var prev = track.querySelector('.is-latest');
        if (prev) prev.classList.remove('is-latest');
        track.appendChild(f);
        var stride = f.getBoundingClientRect().left - prev.getBoundingClientRect().left;
        void f.offsetWidth;
        f.classList.remove('is-new');
        f.classList.add('is-latest');
        track.firstChild.classList.add('is-gone');
        track.classList.add('is-moving');
        track.style.transform = 'translateX(' + (-stride) + 'px)';
        inRow.push(i);
        inRow.shift();
        detail(i, true);
        setTimeout(function () {
            track.classList.remove('is-moving');
            track.removeChild(track.firstChild);
            track.style.transform = '';
            busy = false;
        }, 650);
    }

    var timer = 0;
    function start() { clearInterval(timer); timer = setInterval(step, EVERY_MS); }
    function stop() { clearInterval(timer); }
    // pause while the tab is hidden or the mouse is over it (so it can be read)
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', start);
    // on the home page, start once the preloader has gone
    if (document.documentElement.classList.contains('dm-loading')) document.addEventListener('dm:ready', start, { once: true });
    else start();
}());
