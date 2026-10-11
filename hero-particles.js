(function () {
    "use strict";

    var canvas = document.querySelector(".hero-particle-canvas");
    var hero = document.getElementById("home");
    if (!canvas || !hero) return;

    var context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    hero.classList.add("has-particle-animation");

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var points = [];
    var ambient = [];
    var width = 0;
    var height = 0;
    var pixelRatio = 1;
    var pointerX = 0;
    var pointerY = 0;
    var easedX = 0;
    var easedY = 0;
    var pointerCanvasX = 0;
    var pointerCanvasY = 0;
    var pointerActive = false;
    var frameId = 0;
    var visible = true;
    var lastFrame = 0;
    var tau = Math.PI * 2;

    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function createParticles() {
        var count = window.innerWidth < 700 ? 4200 : 9800;
        points = new Array(count);

        for (var i = 0; i < count; i += 1) {
            var point;
            var part = i / count;

            if (part < 0.73) {
                var y = random(-1.12, 1.55);
                var angle = Math.random() * tau;
                var bodyRadius = 0.36 + 0.025 * Math.sin((y + 1.12) * 2.4);
                var radius = y > 0.35
                    ? bodyRadius * Math.max(0.02, (1.55 - y) / 1.2)
                    : bodyRadius;
                var band = y < -0.9 || (y > -0.28 && y < -0.18);

                point = {
                    x: Math.cos(angle) * radius,
                    y: y,
                    z: Math.sin(angle) * radius,
                    color: band ? [255, 157, 55] :
                        (Math.random() < 0.12 ? [109, 178, 255] : [238, 241, 239]),
                    size: random(0.75, 1.8),
                    part: "body"
                };
            } else if (part < 0.88) {
                var side = Math.random() < 0.5 ? -1 : 1;
                var finT = Math.sqrt(Math.random());
                var finU = Math.random() * (1 - finT);
                var rootX = side * 0.29;
                var tipX = side * 0.76;
                var rootY = -0.43;
                var tipY = -1.12;

                point = {
                    x: rootX * (1 - finT - finU) + tipX * finT + side * 0.3 * finU,
                    y: rootY * (1 - finT - finU) + tipY * finT - 0.8 * finU,
                    z: random(-0.11, 0.11),
                    color: Math.random() < 0.2 ? [243, 242, 235] : [255, 151, 48],
                    size: random(0.9, 2),
                    part: "fin"
                };
            } else if (part < 0.94) {
                var windowAngle = Math.random() * tau;
                var windowRadius = random(0.105, 0.18);

                point = {
                    x: Math.cos(windowAngle) * windowRadius,
                    y: 0.12 + Math.sin(windowAngle) * windowRadius,
                    z: 0.36 + random(0.005, 0.035),
                    color: Math.random() < 0.72 ? [91, 181, 255] : [238, 247, 255],
                    size: random(1.1, 2.5),
                    part: "window"
                };
            } else {
                point = {
                    x: random(-0.1, 0.1),
                    y: random(-2, -1.22),
                    z: random(-0.09, 0.09),
                    color: Math.random() < 0.7 ? [255, 154, 48] : [255, 224, 163],
                    size: random(0.8, 2.1),
                    phase: random(0, tau),
                    part: "exhaust"
                };
            }

            point.phase = point.phase || random(0, tau);
            point.alpha = random(0.65, 1);
            point.pushX = 0;
            point.pushY = 0;
            point.pushVelocityX = 0;
            point.pushVelocityY = 0;
            points[i] = point;
        }

        var ambientCount = window.innerWidth < 700 ? 90 : 190;
        ambient = new Array(ambientCount);
        for (var j = 0; j < ambientCount; j += 1) {
            ambient[j] = {
                x: Math.random(),
                y: Math.random(),
                size: random(0.5, 1.5),
                alpha: random(0.12, 0.48),
                color: Math.random() < 0.5 ? "235,240,245" : "255,166,72"
            };
        }
    }

    function resize() {
        var bounds = hero.getBoundingClientRect();
        width = Math.max(1, canvas.clientWidth || bounds.width * 0.68);
        height = Math.max(1, canvas.clientHeight || bounds.height);
        pointerActive = false;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        createParticles();
        render(performance.now());
    }

    function drawAmbient() {
        for (var i = 0; i < ambient.length; i += 1) {
            var star = ambient[i];
            context.fillStyle = "rgba(" + star.color + "," + star.alpha + ")";
            context.beginPath();
            context.arc(star.x * width, star.y * height, star.size, 0, tau);
            context.fill();
        }
    }

    function render(now) {
        if (!visible) {
            frameId = 0;
            return;
        }

        var delta = Math.min(0.05, (now - (lastFrame || now)) / 1000);
        lastFrame = now;
        var time = now / 1000;
        var damping = 1 - Math.exp(-4.5 * delta);
        easedX += (pointerX - easedX) * damping;
        easedY += (pointerY - easedY) * damping;

        context.clearRect(0, 0, width, height);
        drawAmbient();

        var cosineY = Math.cos(time * 0.12 + easedX * 0.3);
        var sineY = Math.sin(time * 0.12 + easedX * 0.3);
        var cosineX = Math.cos(easedY * 0.24 + Math.sin(time * 0.18) * 0.04);
        var sineX = Math.sin(easedY * 0.24 + Math.sin(time * 0.18) * 0.04);
        var scale = Math.min(width, height) * (window.innerWidth < 700 ? 0.98 : 1.14);
        var focalLength = Math.min(width, height) * 1.8;
        var roll = -0.22 + easedX * 0.05;
        var cosineRoll = Math.cos(roll);
        var sineRoll = Math.sin(roll);
        var centerX = width * (window.innerWidth < 700 ? 0.58 : 0.61);
        var centerY = height * 0.51;
        var interactionRadius = Math.max(42, Math.min(92, Math.min(width, height) * 0.12));
        var interactionRadiusSquared = interactionRadius * interactionRadius;
        var maxDisplacement = Math.min(14, Math.min(width, height) * 0.018);
        var springStrength = 90;
        var springDamping = 19;

        for (var i = 0; i < points.length; i += 1) {
            var point = points[i];
            var x = point.x;
            var y = point.y;
            var z = point.z;
            var pulse = Math.sin(time * 5 + point.phase);

            if (point.part === "exhaust") {
                y -= (time * 0.55 + point.phase) % 0.52;
                x += Math.sin(time * 3 + point.phase) * 0.045;
            } else if (point.part === "body") {
                x += Math.sin(time * 1.5 + point.phase) * 0.007;
            }

            var rolledX = x * cosineRoll + y * sineRoll;
            var rolledY = -x * sineRoll + y * cosineRoll;

            var rotatedX = rolledX * cosineY - z * sineY;
            var rotatedZ = rolledX * sineY + z * cosineY;
            var rotatedY = rolledY * cosineX - rotatedZ * sineX;
            rotatedZ = rolledY * sineX + rotatedZ * cosineX;

            var perspective = focalLength / (4.8 - rotatedZ);
            var screenX = centerX + rotatedX * scale * perspective / focalLength;
            var screenY = centerY - rotatedY * scale * perspective / focalLength;
            var targetPushX = 0;
            var targetPushY = 0;

            if (pointerActive) {
                var pointerDeltaX = screenX - pointerCanvasX;
                var pointerDeltaY = screenY - pointerCanvasY;
                var distanceSquared = pointerDeltaX * pointerDeltaX + pointerDeltaY * pointerDeltaY;

                if (distanceSquared < interactionRadiusSquared) {
                    var distance = Math.sqrt(distanceSquared);
                    var falloff = 1 - distance / interactionRadius;
                    var ripple = 0.82 + 0.18 * Math.sin(
                        distance / interactionRadius * tau * 1.4 - time * 5
                    );
                    var displacement = maxDisplacement * falloff * falloff * ripple;
                    var directionX = distance > 0.001 ? pointerDeltaX / distance : Math.cos(point.phase);
                    var directionY = distance > 0.001 ? pointerDeltaY / distance : Math.sin(point.phase);

                    targetPushX = directionX * displacement;
                    targetPushY = directionY * displacement;
                }
            }

            point.pushVelocityX += (targetPushX - point.pushX) * springStrength * delta;
            point.pushVelocityY += (targetPushY - point.pushY) * springStrength * delta;
            point.pushVelocityX *= Math.exp(-springDamping * delta);
            point.pushVelocityY *= Math.exp(-springDamping * delta);
            point.pushX += point.pushVelocityX * delta;
            point.pushY += point.pushVelocityY * delta;
            var pushMagnitudeSquared = point.pushX * point.pushX + point.pushY * point.pushY;
            var maxPush = maxDisplacement * 1.25;
            if (pushMagnitudeSquared > maxPush * maxPush) {
                var pushScale = maxPush / Math.sqrt(pushMagnitudeSquared);
                point.pushX *= pushScale;
                point.pushY *= pushScale;
                point.pushVelocityX *= pushScale;
                point.pushVelocityY *= pushScale;
            }
            screenX += point.pushX;
            screenY += point.pushY;

            var radius = point.size * (0.72 + perspective / focalLength * 0.9);
            if (point.part === "exhaust") {
                radius *= 0.78 + 0.32 * (0.5 + 0.5 * pulse);
            }
            var sparkle = 0.78 + 0.22 * (0.5 + 0.5 * Math.sin(time * 1.8 + point.phase));
            var depthAlpha = Math.max(0.4, Math.min(1, 0.78 + rotatedZ * 0.13));

            context.fillStyle = "rgba(" + point.color.join(",") + "," +
                (point.alpha * depthAlpha * sparkle) + ")";
            context.beginPath();
            context.arc(screenX, screenY, radius, 0, tau);
            context.fill();
        }

        if (!reducedMotion) {
            frameId = window.requestAnimationFrame(render);
        } else {
            frameId = 0;
        }
    }

    hero.addEventListener("pointermove", function (event) {
        var bounds = canvas.getBoundingClientRect();
        pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
        pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
        pointerActive = !reducedMotion &&
            event.clientX >= bounds.left && event.clientX <= bounds.right &&
            event.clientY >= bounds.top && event.clientY <= bounds.bottom;
        pointerCanvasX = event.clientX - bounds.left;
        pointerCanvasY = event.clientY - bounds.top;
    }, { passive: true });

    hero.addEventListener("pointerleave", function () {
        pointerX = 0;
        pointerY = 0;
        pointerActive = false;
    }, { passive: true });

    function start() {
        if (!visible || reducedMotion || frameId) return;
        frameId = window.requestAnimationFrame(render);
    }

    if (window.ResizeObserver) {
        new ResizeObserver(resize).observe(hero);
    } else {
        window.addEventListener("resize", resize);
    }

    if (window.IntersectionObserver) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (visible) {
                if (reducedMotion) {
                    render(performance.now());
                } else {
                    start();
                }
            } else if (frameId) {
                window.cancelAnimationFrame(frameId);
                frameId = 0;
            }
        }).observe(hero);
    }

    resize();
    start();
}());
