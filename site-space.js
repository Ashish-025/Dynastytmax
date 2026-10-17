/*  Site-wide animated background in the hero palette (orange #f48c18 / blue #4089dd).
    Layers (back to front):
      1. soft colour clouds (still)
      2. network structure - nodes drift slowly and link up when close; the cursor attracts them
    (No stars, light packets, scanner or click waves - only the structure moves.)
    Plain 2D canvas fixed behind the page; pauses when the tab is hidden; static frame for reduced motion. */
(function () {
    'use strict';
    var canvas = document.createElement('canvas');
    canvas.className = 'site-space-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ORANGE = '244,140,24', BLUE = '64,137,221', WHITE = '255,255,255', MIX = '154,138,122';
    var TAU = Math.PI * 2;
    var dpr = 1, w = 0, h = 0, small = false;
    var nodes = [], auroras = [];
    var mouse = { x: -9999, y: -9999, on: false };
    var LINK = 140;

    function rand(a, b) { return a + Math.random() * (b - a); }
    // light theme: white marks become deep navy and everything is a touch stronger to read on a pale page
    var LIGHT = document.documentElement.getAttribute('data-theme') === 'light', NAVY = '20,36,72';
    window.addEventListener('dm-themechange', function (e) {
        LIGHT = e.detail.theme === 'light';
        canvas.style.display = LIGHT ? 'none' : '';
        if (!LIGHT) { if (reduce) draw(0, false); else if (!raf) raf = requestAnimationFrame(loop); }
    });
    function rgba(c, a) {
        if (LIGHT) { if (c === WHITE) c = NAVY; a *= 1.3; }
        return 'rgba(' + c + ',' + (a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3) + ')';
    }

    /* ---------------- setup ---------------- */
    function build() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        small = w < 760;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        LINK = small ? 105 : 140;

        nodes = [];
        var nodeCount = Math.round(Math.min(small ? 34 : 80, (w * h) / 16000));
        for (var n = 0; n < nodeCount; n++) {
            nodes.push({
                x: Math.random() * w, y: Math.random() * h,
                vx: rand(-.22, .22), vy: rand(-.22, .22),
                kx: 0, ky: 0,
                c: n % 3 === 0 ? ORANGE : BLUE,
                r: rand(1.1, 2.2), p: Math.random() * TAU
            });
        }
        auroras = [
            { c: BLUE, x: .78, y: .22, r: .55 },
            { c: ORANGE, x: .15, y: .8, r: .5 },
            { c: BLUE, x: .3, y: .35, r: .38 },
            { c: ORANGE, x: .85, y: .75, r: .34 }
        ];
    }

    /* ---------------- layers ---------------- */
    function drawAuroras() {
        ctx.globalCompositeOperation = LIGHT ? 'source-over' : 'lighter';
        for (var i = 0; i < auroras.length; i++) {
            var a = auroras[i];
            var cx = a.x * w, cy = a.y * h, rad = a.r * Math.max(w, h);   // still: no drifting
            var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
            g.addColorStop(0, rgba(a.c, .1));
            g.addColorStop(.5, rgba(a.c, .04));
            g.addColorStop(1, rgba(a.c, 0));
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    function drawNetwork(t, moving) {
        var i, j, a, b, dx, dy, d;
        for (i = 0; i < nodes.length; i++) {
            a = nodes[i];
            if (!moving) continue;
            a.x += a.vx + a.kx; a.y += a.vy + a.ky;
            a.kx *= .92; a.ky *= .92;
            if (a.x < -20) a.x = w + 20; else if (a.x > w + 20) a.x = -20;
            if (a.y < -20) a.y = h + 20; else if (a.y > h + 20) a.y = -20;
            if (mouse.on) {
                dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
                if (d < 220 && d > 1) { a.x += dx / d * .35; a.y += dy / d * .35; }
            }
        }
        var linkBands = [[], [], [], [], [], [], [], [], [], [], [], []];
        ctx.lineWidth = 1;
        for (i = 0; i < nodes.length; i++) {
            a = nodes[i];
            for (j = i + 1; j < nodes.length; j++) {
                b = nodes[j];
                dx = a.x - b.x; dy = a.y - b.y;
                if (Math.abs(dx) > LINK || Math.abs(dy) > LINK) continue;
                d = Math.sqrt(dx * dx + dy * dy);
                if (d > LINK) continue;
                // bucket by colour pair x 4 strength bands, stroked together below
                var lb = Math.min(3, ((1 - d / LINK) * 4) | 0) + (a.c === b.c ? (a.c === ORANGE ? 0 : 4) : 8);
                linkBands[lb].push(a.x, a.y, b.x, b.y);
            }
            if (mouse.on) {
                dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
                if (d < LINK * 1.5) {
                    ctx.strokeStyle = rgba(WHITE, (1 - d / (LINK * 1.5)) * .4);
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                }
            }
        }
        var LINK_COLORS = [ORANGE, BLUE, MIX];
        for (var lbi = 0; lbi < 12; lbi++) {
            var seg = linkBands[lbi];
            if (!seg.length) continue;
            ctx.strokeStyle = rgba(LINK_COLORS[(lbi / 4) | 0], ((lbi % 4) + .5) / 4 * .38);
            ctx.beginPath();
            for (var q = 0; q < seg.length; q += 4) { ctx.moveTo(seg[q], seg[q + 1]); ctx.lineTo(seg[q + 2], seg[q + 3]); }
            ctx.stroke();
        }

        for (i = 0; i < nodes.length; i++) {
            a = nodes[i];
            var pulse = .6 + .4 * Math.sin(t * .002 + a.p);
            ctx.fillStyle = rgba(a.c, .12 * pulse);
            ctx.beginPath(); ctx.arc(a.x, a.y, a.r * 3.4, 0, TAU); ctx.fill();
            ctx.fillStyle = rgba(a.c, .55 + .4 * pulse);
            ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, TAU); ctx.fill();
        }
    }

    /* ---------------- frame ---------------- */
    function draw(t, moving) {
        ctx.clearRect(0, 0, w, h);
        drawAuroras();
        drawNetwork(t, moving);
    }

    var raf = 0;
    function loop(t) {
        if (LIGHT) { raf = 0; return; }   // light theme = original site, no space background
        draw(t, true);
        raf = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', function () { build(); if (reduce) draw(0, false); });
    window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true;
    }, { passive: true });
    document.addEventListener('mouseleave', function () { mouse.on = false; });
    // touch screens: a finger on the screen pulls the network like the mouse does on desktop
    function touchAt(e) {
        var t = e.touches && e.touches[0];
        if (t) { mouse.x = t.clientX; mouse.y = t.clientY; mouse.on = true; }
    }
    window.addEventListener('touchstart', touchAt, { passive: true });
    window.addEventListener('touchmove', touchAt, { passive: true });
    window.addEventListener('touchend', function (e) { if (!e.touches.length) mouse.on = false; }, { passive: true });
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
        else if (!raf && !reduce && !LIGHT) raf = requestAnimationFrame(loop);
    });
    if (reduce) window.addEventListener('scroll', function () { draw(0, false); }, { passive: true });

    build();
    if (LIGHT) canvas.style.display = 'none';
    else if (reduce) draw(0, false); else raf = requestAnimationFrame(loop);
}());
