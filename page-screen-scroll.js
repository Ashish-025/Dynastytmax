(function () {
    var body = document.body;
    var root = document.documentElement;
    if (!body || !root) return;

    var resizeTimer;

    function buildSnapPoints() {
        var oldMarkers = body.querySelectorAll('.page-snap-marker');
        for (var markerIndex = oldMarkers.length - 1; markerIndex >= 0; markerIndex -= 1) {
            oldMarkers[markerIndex].parentNode.removeChild(oldMarkers[markerIndex]);
        }

        var viewportHeight = window.innerHeight || root.clientHeight;
        if (!viewportHeight) return;
        var documentHeight = Math.max(root.scrollHeight, body.scrollHeight);
        var maxScroll = Math.max(0, documentHeight - viewportHeight);
        var steps = Math.ceil(maxScroll / viewportHeight);
        var projects = document.getElementById('dm-projects');
        var projectStart = projects ? projects.offsetTop : -1;
        var projectEnd = projects ? projectStart + projects.offsetHeight : -1;
        var snapPadding = parseFloat(window.getComputedStyle(root).scrollPaddingTop) || 0;
        var header = document.getElementById('siteHeader');
        var contactStrip = document.querySelector('.site-contact-strip');
        var fixedHeaderBottom = Math.max(
            header ? header.getBoundingClientRect().bottom : 0,
            contactStrip ? contactStrip.getBoundingClientRect().bottom : 0
        );

        var topMarker = document.createElement('span');
        topMarker.className = 'page-snap-marker';
        topMarker.setAttribute('aria-hidden', 'true');
        topMarker.style.top = '0px';
        body.appendChild(topMarker);

        for (var step = 1; step <= steps; step += 1) {
            var markerTop = Math.min(step * viewportHeight, maxScroll);
            if (projects && markerTop >= projectStart && markerTop < projectEnd) continue;
            var marker = document.createElement('span');
            marker.className = 'page-snap-marker';
            marker.setAttribute('aria-hidden', 'true');
            marker.style.top = markerTop + 'px';
            body.appendChild(marker);
        }

        if (projects) {
            var projectMarker = document.createElement('span');
            projectMarker.className = 'page-snap-marker';
            projectMarker.setAttribute('aria-hidden', 'true');
            projectMarker.style.top = Math.max(
                0,
                projectStart - fixedHeaderBottom + snapPadding
            ) + 'px';
            body.appendChild(projectMarker);
        }
    }

    function scheduleBuild() {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(buildSnapPoints, 120);
    }

    buildSnapPoints();
    window.addEventListener('load', buildSnapPoints);
    window.addEventListener('resize', scheduleBuild);
    // sections grow after load (images, fonts, animations): keep the snap points in step with the real page height
    if (window.ResizeObserver) new ResizeObserver(scheduleBuild).observe(body);
})();
