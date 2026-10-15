/*  Site-wide animated background in the hero palette (orange #f48c18 / blue #4089dd).
    Layers (back to front):
      1. aurora light clouds
      2. 3D starfield - stars drift slowly toward the viewer
      3. data network - nodes link up, glowing packets travel along the links, cursor attracts
      4. scanner sweep, click shockwaves
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
    var stars = [], nodes = [], packets = [], waves = [], auroras = [];
    var mouse = { x: -9999, y: -9999, on: false };
    var LINK = 140;
    var scanT = 0;

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

        stars = [];
        var starCount = small ? 160 : 380;
        for (var i = 0; i < starCount; i++) stars.push(newStar(true));

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
        packets = [];

        auroras = [
            { c: BLUE, x: .78, y: .22, r: .55, sx: .00011, sy: .00007, ph: 0 },
            { c: ORANGE, x: .15, y: .8, r: .5, sx: .00009, sy: .00012, ph: 2 },
            { c: BLUE, x: .3, y: .35, r: .38, sx: .00013, sy: .00008, ph: 4 },
            { c: ORANGE, x: .85, y: .75, r: .34, sx: .0001, sy: .00011, ph: 1 }
        ];
    }

    function newStar(anywhere) {
        return {
            x: rand(-1, 1), y: rand(-1, 1),
            z: anywhere ? rand(.05, 1) : 1,
            pz: 0,
            c: Math.random() < .5 ? WHITE : (Math.random() < .5 ? ORANGE : BLUE)
        };
    }

    /* ---------------- layers ---------------- */
    function drawAuroras(t) {
        ctx.globalCompositeOperation = LIGHT ? 'source-over' : 'lighter';
        for (var i = 0; i < auroras.length; i++) {
            var a = auroras[i];
            var cx = (a.x + Math.sin(t * a.sx + a.ph) * .12) * w;
            var cy = (a.y + Math.cos(t * a.sy + a.ph) * .1) * h;
            var rad = a.r * Math.max(w, h) * (1 + .08 * Math.sin(t * .0004 + a.ph));
            var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
            g.addColorStop(0, rgba(a.c, .1));
            g.addColorStop(.5, rgba(a.c, .04));
            g.addColorStop(1, rgba(a.c, 0));
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    // stars are grouped by colour x 4 depth bands so each group is one path
    var STAR_COLORS = [WHITE, ORANGE, BLUE], starBands = [];
    for (var sb = 0; sb < 12; sb++) { starBands.push([]); }

    function drawStars(moving) {
        var cx = w / 2, cy = h / 2, f = Math.max(w, h) * .55;
        var speed = .0009;
        var i, b;
        for (b = 0; b < 12; b++) starBands[b].length = 0;
        for (i = 0; i < stars.length; i++) {
            var s = stars[i];
            if (moving) {
                s.z -= speed;
                if (s.z <= .02) { stars[i] = newStar(false); continue; }
            }
            var sx = cx + s.x / s.z * f, sy = cy + s.y / s.z * f;
            if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) { stars[i] = newStar(false); continue; }
            b = Math.min(3, ((1 - s.z) * 4) | 0) + STAR_COLORS.indexOf(s.c) * 4;
            starBands[b].push(sx, sy);
        }
        for (b = 0; b < 12; b++) {
            var pts = starBands[b];
            if (!pts.length) continue;
            var near = ((b % 4) + .5) / 4, a = .15 + near * .85, col = STAR_COLORS[(b / 4) | 0];
            var r = .3 + near * 1.5;
            ctx.beginPath();
            for (i = 0; i < pts.length; i += 2) { ctx.moveTo(pts[i] + r, pts[i + 1]); ctx.arc(pts[i], pts[i + 1], r, 0, TAU); }
            ctx.fillStyle = rgba(col, a);
            ctx.fill();
        }
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
        var links = [], linkBands = [[], [], [], [], [], [], [], [], [], [], [], []];
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
                links.push([i, j]);
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

        // data packets riding the links
        if (moving && links.length && packets.length < (small ? 8 : 18) && Math.random() < .2) {
            var L = links[(Math.random() * links.length) | 0];
            if (Math.random() < .5) L = [L[1], L[0]];
            packets.push({ a: L[0], b: L[1], u: 0, sp: rand(.012, .03), c: nodes[L[0]].c });
        }
        for (i = packets.length - 1; i >= 0; i--) {
            var pk = packets[i], na = nodes[pk.a], nb = nodes[pk.b];
            dx = nb.x - na.x; dy = nb.y - na.y;
            if (dx * dx + dy * dy > LINK * LINK * 1.2) { packets.splice(i, 1); continue; }
            if (moving) pk.u += pk.sp;
            if (pk.u >= 1) { packets.splice(i, 1); continue; }
            var px = na.x + dx * pk.u, py = na.y + dy * pk.u;
            var tx = na.x + dx * Math.max(0, pk.u - .25), ty = na.y + dy * Math.max(0, pk.u - .25);
            var tg = ctx.createLinearGradient(tx, ty, px, py);
            tg.addColorStop(0, rgba(pk.c, 0));
            tg.addColorStop(1, rgba(pk.c, .95));
            ctx.strokeStyle = tg;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(px, py); ctx.stroke();
            ctx.fillStyle = rgba(WHITE, .95);
            ctx.beginPath(); ctx.arc(px, py, 1.6, 0, TAU); ctx.fill();
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

    function drawScan(dt) {
        scanT += dt;
        var period = 9000, dur = 2600, k = scanT % period;
        if (k > dur) return;
        var y = (k / dur) * (h + 160) - 80;
        var g = ctx.createLinearGradient(0, y - 70, 0, y + 2);
        g.addColorStop(0, rgba(BLUE, 0));
        g.addColorStop(.85, rgba(BLUE, .05));
        g.addColorStop(1, rgba(BLUE, .22));
        ctx.fillStyle = g;
        ctx.fillRect(0, y - 70, w, 72);
        var line = ctx.createLinearGradient(0, 0, w, 0);
        line.addColorStop(0, rgba(ORANGE, 0));
        line.addColorStop(.3, rgba(ORANGE, .45));
        line.addColorStop(.7, rgba(BLUE, .55));
        line.addColorStop(1, rgba(BLUE, 0));
        ctx.fillStyle = line;
        ctx.fillRect(0, y, w, 1);
    }

    function drawWaves() {
        for (var i = waves.length - 1; i >= 0; i--) {
            var wv = waves[i];
            wv.r += 9;
            var life = 1 - wv.r / wv.max;
            if (life <= 0) { waves.splice(i, 1); continue; }
            ctx.lineWidth = 2;
            ctx.strokeStyle = rgba(BLUE, life * .55);
            ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r, 0, TAU); ctx.stroke();
            ctx.lineWidth = 1;
            ctx.strokeStyle = rgba(ORANGE, life * .45);
            ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r * .72, 0, TAU); ctx.stroke();
            // push nodes the ring is passing through
            for (var n = 0; n < nodes.length; n++) {
                var nd = nodes[n], dx = nd.x - wv.x, dy = nd.y - wv.y, d = Math.sqrt(dx * dx + dy * dy);
                if (d > 1 && Math.abs(d - wv.r) < 14) { nd.kx += dx / d * 2.2 * life; nd.ky += dy / d * 2.2 * life; }
            }
        }
    }

    /* ---------------- frame ---------------- */
    var lastT = 0;
    function draw(t, moving) {
        var dt = lastT ? Math.min(64, t - lastT) : 16;
        lastT = t;

        ctx.clearRect(0, 0, w, h);
        drawAuroras(t);
        drawStars(moving);
        drawNetwork(t, moving);
        if (moving) { drawScan(dt); drawWaves(); }
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
    window.addEventListener('pointerdown', function (e) {
        if (reduce) return;
        waves.push({ x: e.clientX, y: e.clientY, r: 0, max: Math.max(w, h) * .45 });
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { cancelAnimationFrame(raf); raf = 0; lastT = 0; }
        else if (!raf && !reduce && !LIGHT) raf = requestAnimationFrame(loop);
    });
    if (reduce) window.addEventListener('scroll', function () { draw(0, false); }, { passive: true });

    build();
    if (LIGHT) canvas.style.display = 'none';
    else if (reduce) draw(0, false); else raf = requestAnimationFrame(loop);
}());
