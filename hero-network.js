/* Hero background: a faint, slowly drifting network of dots that link up when
   they come near each other, with an occasional red "ping" ring spreading out
   from a dot (like a GPS signal). Drawn on a canvas behind the home hero.
   Pauses when the hero is off screen or the tab is hidden; one still frame for
   people who prefer reduced motion. */
(function () {
    "use strict";
    var canvas = document.querySelector(".dmh-network");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var W = 0, H = 0, dpr = 1, nodes = [], pings = [];
    var running = false, visible = true, raf = 0, last = 0, nextPing = 1.2;
    var LINK = 150;                       // px: dots closer than this are linked

    function rand(a, b) { return a + Math.random() * (b - a); }

    function build() {
        var count = Math.round(Math.min(90, Math.max(28, (W * H) / 16000)));
        nodes = [];
        for (var i = 0; i < count; i++) {
            nodes.push({
                x: rand(0, W), y: rand(0, H),
                vx: rand(-12, 12), vy: rand(-8, 8),          // px per second: slow
                r: rand(1, 2.2),
                red: Math.random() < 0.28
            });
        }
    }

    function resize() {
        var rect = canvas.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = Math.max(1, rect.width), h = Math.max(1, rect.height);
        var rebuild = !nodes.length || Math.abs(w - W) > 80 || Math.abs(h - H) > 80;
        W = w; H = h;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (rebuild) build();
        if (!running) draw();
    }

    function step(dt) {
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            n.x += n.vx * dt;
            n.y += n.vy * dt;
            if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
            if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
        }
        nextPing -= dt;
        if (nextPing <= 0 && nodes.length) {
            var reds = nodes.filter(function (n) { return n.red; });
            var src = reds.length ? reds[Math.floor(Math.random() * reds.length)] : nodes[0];
            pings.push({ node: src, age: 0 });
            nextPing = rand(1.6, 3.2);
        }
        for (var p = pings.length - 1; p >= 0; p--) {
            pings[p].age += dt;
            if (pings[p].age > 2.4) pings.splice(p, 1);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // links
        ctx.lineWidth = 1;
        for (var i = 0; i < nodes.length; i++) {
            var a = nodes[i];
            for (var j = i + 1; j < nodes.length; j++) {
                var b = nodes[j];
                var dx = a.x - b.x, dy = a.y - b.y;
                var d2 = dx * dx + dy * dy;
                if (d2 > LINK * LINK) continue;
                var f = 1 - Math.sqrt(d2) / LINK;
                ctx.strokeStyle = (a.red && b.red)
                    ? "rgba(167,139,250," + (f * 0.35).toFixed(3) + ")"
                    : "rgba(255,255,255," + (f * 0.14).toFixed(3) + ")";
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }

        // ping rings
        for (var p = 0; p < pings.length; p++) {
            var pg = pings[p], t = pg.age / 2.4;
            ctx.strokeStyle = "rgba(167,139,250," + ((1 - t) * 0.55).toFixed(3) + ")";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(pg.node.x, pg.node.y, 4 + t * 70, 0, Math.PI * 2);
            ctx.stroke();
        }

        // dots
        for (var k = 0; k < nodes.length; k++) {
            var n = nodes[k];
            if (n.red) {
                ctx.fillStyle = "rgba(167,139,250,0.16)";
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = n.red ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.5)";
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function frame(now) {
        if (!running) return;
        var dt = last ? Math.min((now - last) / 1000, 0.064) : 0.016;
        last = now;
        step(dt);
        draw();
        raf = requestAnimationFrame(frame);
    }
    function start() {
        if (running || reduce || !visible || document.hidden) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (e) {
            visible = e[0].isIntersecting;
            if (visible) start(); else stop();
        }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else start();
    });

    resize();
    draw();
    start();
}());
