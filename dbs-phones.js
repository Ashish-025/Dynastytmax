/*  Digital Branding hero - a row of phone screens sliding along, in step with the headline
    (like the naksysglobal.com hero):
      - three phones in view: a big one in the middle, smaller ones either side
      - every step (1.38s, 0.43s move - measured from the reference) the row moves one place left:
        the left phone shrinks away, the middle one shrinks to the left, the right one grows into
        the middle and a new phone grows in from nothing on the far right
      - at the same moment the highlighted headline word slides up to the next one, and the phone
        landing in the middle shows the screen for that word (Design solutions -> Logo Studio, ...)
    The app screens are our own, drawn in HTML/CSS (no images). Styles in dbs-phones.css.
    Fills <div class="dbs-phones">; drives <span class="dbs-words" data-driven="phones">. */
(function () {
    'use strict';
    var box = document.querySelector('.dbs-phones');
    if (!box) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- the app screens (own designs), one per headline word, same order as the words ---------- */
    function bars(vals, cls) {
        return '<div class="ph-bars ' + (cls || '') + '">' + vals.map(function (v) { return '<i style="height:' + v + '%"></i>'; }).join('') + '</div>';
    }
    function nav(on, dark) {
        var icons = ['home', 'grid', 'chart', 'user'];
        return '<div class="ph-nav' + (dark ? ' dark' : '') + '">' + icons.map(function (n, i) { return '<i class="ph-ic ph-ic-' + n + (i === on ? ' on' : '') + '"></i>'; }).join('') + '</div>';
    }
    var SCREENS = [
        // Design solutions. -> logo studio
        '<div class="ph-scr ph-violet">' +
            '<div class="ph-top light"><b>Logo Studio</b><span class="ph-dot w"></span></div>' +
            '<div class="ph-tiles">' +
                '<i style="background:#c4b5fd"><em>Mark</em></i><i style="background:#f9a8d4"><em>Icon</em></i>' +
                '<i style="background:#fde68a"><em>Type</em></i><i style="background:#a5f3fc"><em>Badge</em></i>' +
                '<i style="background:#bbf7d0"><em>Mono</em></i><i style="background:#ddd6fe"><em>Motion</em></i>' +
            '</div>' +
            nav(1) +
        '</div>',
        // Creative Ideas. -> campaign calendar
        '<div class="ph-scr ph-white">' +
            '<div class="ph-hello"><small>Hello</small><b>Campaign</b></div>' +
            '<div class="ph-days"><span>8</span><span>9</span><span>10</span><span>11</span><span class="on">12</span><span>13</span><span>14</span></div>' +
            '<div class="ph-idea"><span class="ph-bulb"></span><div><small>Idea of the day</small><b>Festive reel</b></div></div>' +
            '<div class="ph-reach"><small>Today\'s reach</small><b>48.2K</b><span class="ph-pill">Details</span></div>' +
            '<div class="ph-violet-card"><div><b>3,680</b><small>Clicks</small></div><div><b>98</b><small>Leads</small></div><div><b>460</b><small>Shares</small></div>' +
                '<svg viewBox="0 0 60 40"><path d="M2 36 C20 34 26 20 34 18 S50 6 58 4"/><circle cx="46" cy="10" r="3"/></svg></div>' +
            nav(0) +
        '</div>',
        // Professional Content. -> content planner
        '<div class="ph-scr ph-dark2">' +
            '<div class="ph-head-card"><b>Content Plan</b><small>This week · 5 posts</small></div>' +
            '<div class="ph-tasks">' +
                '<div><i class="av"></i><span>Reel - product</span><em class="ok"></em></div>' +
                '<div><i class="av b"></i><span>Blog post</span><em class="ok"></em></div>' +
                '<div><i class="av c"></i><span>Logo refresh</span><em></em></div>' +
                '<div><i class="av"></i><span>Ad creatives</span><em class="ok"></em></div>' +
                '<div><i class="av b"></i><span>Newsletter</span><em></em></div>' +
            '</div>' +
            '<div class="ph-btn blue">New task</div>' +
            nav(2, true) +
        '</div>',
        // Brand Identity. -> brand kit
        '<div class="ph-scr ph-light">' +
            '<div class="ph-top"><b>Brand Kit</b><span class="ph-dot"></span></div>' +
            '<div class="ph-logo">DM</div>' +
            '<div class="ph-cap">Primary palette</div>' +
            '<div class="ph-swatches"><i style="background:#5b36f5"></i><i style="background:#ff4cbf"></i><i style="background:#0bcefc"></i><i style="background:#0a0e26"></i></div>' +
            '<div class="ph-type"><span>Aa</span><div><b>Geist</b><small>Headings &amp; body</small></div></div>' +
            '<div class="ph-btn">Export guide</div>' +
            nav(1) +
        '</div>',
        // Web Development. -> website builder
        '<div class="ph-scr ph-sky">' +
            '<div class="ph-hero-block"><b>Your Website</b><small>Live preview</small><span class="ph-chip">Publish</span></div>' +
            '<div class="ph-row3"><i></i><i></i><i></i></div>' +
            '<div class="ph-card"><div class="ph-card-img"></div><div class="ph-lines"><i></i><i class="s"></i></div></div>' +
            '<div class="ph-card"><div class="ph-card-img alt"></div><div class="ph-lines"><i></i><i class="s"></i></div></div>' +
            '<div class="ph-card"><div class="ph-card-img"></div><div class="ph-lines"><i></i><i class="s"></i></div></div>' +
            nav(0) +
        '</div>',
        // Online Stores. -> online store
        '<div class="ph-scr ph-light">' +
            '<div class="ph-top"><b>Store</b><span class="ph-cart">3</span></div>' +
            '<div class="ph-search"></div>' +
            '<div class="ph-grid2">' +
                '<div><i style="background:linear-gradient(135deg,#a78bfa,#5b36f5)"></i><small>Tote bag</small><b>₹499</b></div>' +
                '<div><i style="background:linear-gradient(135deg,#ff9ad5,#ff4cbf)"></i><small>Cap</small><b>₹349</b></div>' +
                '<div><i style="background:linear-gradient(135deg,#8ee9ff,#0bcefc)"></i><small>Mug</small><b>₹299</b></div>' +
                '<div><i style="background:linear-gradient(135deg,#bbf7d0,#22c55e)"></i><small>Tee</small><b>₹599</b></div>' +
            '</div>' +
            '<div class="ph-btn">Checkout · ₹1,746</div>' +
            nav(1) +
        '</div>',
        // Social Media Growth. -> social growth
        '<div class="ph-scr ph-dark">' +
            '<div class="ph-ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle class="ph-ring-val" cx="18" cy="18" r="15" pathLength="100" stroke-dasharray="72 100"/></svg><b>72%</b></div>' +
            '<div class="ph-stats"><div><b>12.4K</b><small>Followers</small></div><div><b>8.1%</b><small>Engage</small></div><div><b>326</b><small>Posts</small></div></div>' +
            '<svg class="ph-line" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 24 C12 20 18 26 30 18 S48 8 60 14 S80 4 100 6"/></svg>' +
            bars([40, 65, 50, 85, 60, 95, 70]) +
            nav(2) +
        '</div>',
        // Digital Marketing. -> analytics
        '<div class="ph-scr ph-navy">' +
            '<div class="ph-top"><b>Analytics</b><span class="ph-dot"></span></div>' +
            '<div class="ph-kpi"><div><small>Visitors</small><b>24,890</b></div><span class="up">+18%</span></div>' +
            bars([30, 45, 35, 60, 55, 80, 65, 90], 'tall') +
            '<div class="ph-list"><div><i></i><span>Instagram</span><b>42%</b></div><div><i class="b"></i><span>Google</span><b>31%</b></div><div><i class="c"></i><span>Facebook</span><b>18%</b></div></div>' +
            nav(2, true) +
        '</div>'
    ];

    /* ---------- headline words (from the HTML), flipped in step with the phones ---------- */
    var wordsBox = document.querySelector('.dbs-words[data-driven="phones"]');
    var words = wordsBox ? [].slice.call(wordsBox.querySelectorAll('b')) : [];
    var N = SCREENS.length, cur = 0;
    function showWord(i) {
        if (!words.length) return;
        words.forEach(function (w, k) {
            var on = k === i % words.length;
            if (on) { w.classList.remove('is-out'); w.classList.add('is-visible'); }
            else if (w.classList.contains('is-visible')) { w.classList.remove('is-visible'); w.classList.add('is-out'); }
            else w.classList.remove('is-out');
        });
    }

    /* ---------- the row: 5 phones in slots 0..4 (0 = leaving on the left, 2 = middle, 4 = arriving on the right) ---------- */
    var PHONES = 5, phones = [];
    function fill(ph, pairIndex) { ph.innerHTML = SCREENS[((pairIndex % N) + N) % N]; }
    for (var s = 0; s < PHONES; s++) {
        var ph = document.createElement('div');
        ph.className = 'dbs-phone';
        ph.setAttribute('data-slot', s);
        fill(ph, cur + s - 2);                       // the middle phone (slot 2) shows the current word's screen
        box.appendChild(ph);
        phones.push(ph);
    }
    showWord(cur);

    function step() {
        cur = (cur + 1) % N;
        phones.forEach(function (ph) {
            var s = +ph.getAttribute('data-slot') - 1;
            if (s < 0) {                                   // the one that left: jump (unseen) to the far right with a new screen
                ph.classList.add('no-anim');
                ph.setAttribute('data-slot', PHONES - 1);
                fill(ph, cur + 2);
                void ph.offsetWidth;
                ph.classList.remove('no-anim');
            } else {
                ph.setAttribute('data-slot', s);
            }
        });
        showWord(cur);
    }

    if (reduce) return;
    var EVERY = 1380, timer = 0, visible = true;
    function run() { clearInterval(timer); if (visible && !document.hidden) timer = setInterval(step, EVERY); }
    document.addEventListener('visibilitychange', run);
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { visible = en[0].isIntersecting; run(); }).observe(box);
    }
    run();
}());
