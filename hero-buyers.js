/*  "Recent clients" as a WhatsApp-style chat (home page), in the bottom-right corner just above
    the WhatsApp button. Each buyer arrives as a chat message (round picture, who bought which
    device, time + blue ticks): it pops in at the bottom and pushes the one before it up, and a
    moment later that older message vanishes - so it reads like messages coming in one by one.
    Only shows while the WhatsApp button is visible (it appears once the visitor scrolls);
    waits while the WhatsApp greeting or chat is open, pauses while hovered or while the tab
    is hidden, and the x hides it for the rest of the visit.
    Styles in hero-buyers.css. */
(function () {
    'use strict';

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
    var FIRST_MS = 6000;     // first message this long after the page is ready
    var EVERY_MS = 4500;     // a new message every 4.5 seconds
    var OLD_MS = 1400;       // the older message vanishes this long after the new one arrives
    var BURST = 4;           // messages in a row, then a pause
    var REST_MS = 12000;     // the pause: the last message vanishes and the chat stays quiet
    var HIDE_KEY = 'dm-buyers-off';

    if (!CLIENTS.length) return;
    try { if (sessionStorage.getItem(HIDE_KEY) === '1') return; } catch (err) { /* storage blocked */ }

    var GRADS = [['#a855f7', '#7c3aed'], ['#38bdf8', '#0ea5e9'], ['#fb7185', '#e11d48'], ['#2dd4bf', '#0d9488'], ['#ec4899', '#be185d'], ['#22d3ee', '#0891b2'], ['#60a5fa', '#2563eb']];
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var TICKS = '<svg viewBox="0 0 18 11" aria-hidden="true"><path d="M1 6l3 3 6-7M7 8.5l1 1 6.5-8"/></svg>';

    function initials(name) {
        return name.replace(/[^A-Za-z ]/g, ' ').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    }
    // the time they bought it, e.g. "10:42 AM" (with the date if it was not today: "14 Oct, 6:05 PM")
    function boughtAt(c) {
        var d = c.time ? new Date(c.time.replace(' ', 'T')) : new Date(Date.now() - (c.ago || 0) * 60000);
        if (isNaN(d)) return '';
        var h = d.getHours(), m = ('0' + d.getMinutes()).slice(-2);
        var clock = (h % 12 || 12) + ':' + m + (h < 12 ? ' AM' : ' PM');
        return d.toDateString() === new Date().toDateString() ? clock : d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + clock;
    }

    // the chat column; messages are added at the bottom
    var chat = document.createElement('div');
    chat.className = 'hb-chat';
    chat.setAttribute('role', 'log');
    chat.setAttribute('aria-live', 'polite');
    chat.setAttribute('aria-label', 'Recent purchases');
    document.body.appendChild(chat);

    function message(i) {
        var c = CLIENTS[i];
        var msg = document.createElement('div');
        msg.className = 'hb-msg is-new';
        var face = document.createElement('span');
        face.className = 'hb-face';
        face.setAttribute('aria-hidden', 'true');
        if (c.photo) {
            var img = document.createElement('img');
            img.src = c.photo; img.alt = ''; img.loading = 'lazy';
            face.appendChild(img);
        } else {
            var g = GRADS[i % GRADS.length];
            face.style.background = 'linear-gradient(135deg,' + g[0] + ',' + g[1] + ')';
            face.textContent = initials(c.name);
        }
        var text = document.createElement('p');
        text.className = 'hb-line';
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
        var meta = document.createElement('span');
        meta.className = 'hb-meta';
        meta.innerHTML = '<span></span>' + TICKS;
        meta.firstChild.textContent = boughtAt(c);
        text.appendChild(who); text.appendChild(from); text.appendChild(what); text.appendChild(meta);
        var x = document.createElement('button');
        x.type = 'button';
        x.className = 'hb-x';
        x.setAttribute('aria-label', 'Hide recent purchases');
        x.innerHTML = '&times;';
        msg.appendChild(face); msg.appendChild(text); msg.appendChild(x);
        return msg;
    }

    // sit just above the WhatsApp button, lined up with its right edge
    var wa = document.querySelector('.ssi-float-whatsapp');
    var dock = wa && (wa.closest('.ssi-floating-actions') || wa);
    function place() {
        var r = wa && wa.getBoundingClientRect();
        if (!r || !r.width) return;
        chat.style.right = Math.max(12, window.innerWidth - r.right) + 'px';
        chat.style.bottom = (window.innerHeight - r.top + 14) + 'px';
    }
    window.addEventListener('resize', place);
    if (dock) dock.addEventListener('transitionend', place);   // the button pops in with a little scale

    // only while the WhatsApp button is showing (it appears once the visitor scrolls), and
    // never on top of its greeting / chat
    function waAway() { return !!(dock && dock.classList.contains('dm-wa-away')); }
    function waBusy() { return waAway() || !!document.querySelector('.dm-wa-strip.is-on, .dm-wa.is-open'); }

    // messages are stacked from the bottom; --y is how far up each one has been pushed
    function vanish(msg) {
        if (!msg || msg.classList.contains('is-out')) return;
        msg.classList.add('is-out');
        setTimeout(function () { if (msg.parentNode) msg.parentNode.removeChild(msg); }, 450);
    }
    function clearAll() { [].forEach.call(chat.querySelectorAll('.hb-msg'), vanish); }

    var last = -1, timer = 0, hovered = false, off = false, sent = 0;
    function pick() {
        var i;
        do { i = Math.floor(Math.random() * CLIENTS.length); } while (i === last && CLIENTS.length > 1);
        return (last = i);
    }
    function next() {
        if (off) return;
        if (document.hidden || waBusy() || hovered) { timer = setTimeout(next, 1500); return; }
        if (sent >= BURST) {                                   // end of a burst: let the last one go, rest
            clearAll();
            sent = 0;
            timer = setTimeout(next, REST_MS);
            return;
        }
        place();
        var older = [].slice.call(chat.querySelectorAll('.hb-msg:not(.is-out)'));
        var msg = message(pick());
        chat.appendChild(msg);
        // the new message arrives at the bottom: push the ones already there up by its height
        var push = msg.offsetHeight + 10;
        older.forEach(function (m) {
            var y = (parseFloat(m.style.getPropertyValue('--y')) || 0) + push;
            m.style.setProperty('--y', y + 'px');
        });
        void msg.offsetWidth;                                  // start the pop-in from its first frame
        msg.classList.remove('is-new');
        sent++;
        // the older message(s) vanish a moment after the new one arrives
        setTimeout(function () { older.forEach(vanish); }, OLD_MS);
        timer = setTimeout(next, EVERY_MS);
    }

    chat.addEventListener('mouseenter', function () { hovered = true; });
    chat.addEventListener('mouseleave', function () { hovered = false; });
    chat.addEventListener('click', function (e) {
        if (!e.target.closest('.hb-x')) return;
        off = true;
        clearTimeout(timer);
        clearAll();
        try { sessionStorage.setItem(HIDE_KEY, '1'); } catch (err) { /* storage blocked */ }
    });
    // scrolled back to the top (WhatsApp button hides): the chat goes with it
    window.addEventListener('scroll', function () {
        if (waAway() && chat.querySelector('.hb-msg')) { clearAll(); sent = 0; }
    }, { passive: true });

    // on the home page, start once the preloader has gone
    function start() { timer = setTimeout(next, FIRST_MS); }
    if (document.documentElement.classList.contains('dm-loading')) document.addEventListener('dm:ready', start, { once: true });
    else start();
}());
