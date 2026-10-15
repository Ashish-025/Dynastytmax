/*  Hero "recent clients" slider (home page, under "Smart Solutions for a Safer Tomorrow"):
    a small round client picture + who bought which device and at what time. One client on
    screen at a time: every few seconds it slides out to the left as the next slides in from
    the right. Pauses while hovered.
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
    var EVERY_MS = 3500;         // a new message every 3.5 seconds

    var GRADS = [['#f48c18', '#e91d2b'], ['#4089dd', '#2c5fb3'], ['#e91d2b', '#9b1220'], ['#2fa8a0', '#4089dd'], ['#f4b018', '#f48c18']];

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

    // one entry = round picture + message
    function item(i) {
        var it = document.createElement('div');
        it.className = 'hb-item';
        var f = face(CLIENTS[i], i);
        f.setAttribute('aria-hidden', 'true');
        it.appendChild(f);
        it.appendChild(line(CLIENTS[i]));
        return it;
    }

    // random order, never a client that is already on screen
    var recent = [];
    function pick() {
        var keep = Math.min(2, CLIENTS.length - 1), i;
        do { i = Math.floor(Math.random() * CLIENTS.length); } while (recent.indexOf(i) > -1);
        recent.unshift(i);
        recent.length = Math.min(recent.length, keep);
        return i;
    }

    // one client on screen at a time, the next one waiting just off to the right.
    // Each step the row slides one place left: the current client slides out to the left as
    // the next slides in from the right - then another client is queued behind it.
    var track = document.createElement('div');
    track.className = 'hb-track';
    box.appendChild(track);
    track.appendChild(item(pick()));
    track.appendChild(item(pick()));
    var busy = false;
    function step() {
        if (busy) return;
        busy = true;
        track.appendChild(item(pick()));
        track.classList.add('is-moving');
        // slide by exactly one client's width (set in hero-buyers.css, wider on phones)
        track.style.transform = 'translateX(' + (-track.firstChild.getBoundingClientRect().width) + 'px)';
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
