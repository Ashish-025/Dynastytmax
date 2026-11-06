/*  Home page "Our Products" list (Our Projects section): clicking a product opens a gallery of
    its completed projects - a large photo with previous / next, thumbnails, a caption and a
    link to the product's page. Close with the X, the Esc key or a click outside the photo.
    Styles in project-gallery.css. Without JavaScript the names simply open the product page.

    TO ADD OR CHANGE PHOTOS: edit PROJECTS below. Each key matches a link's data-project in
    index.html; each photo is [file, caption]. Put new photos in images/projects/ and list
    them first. (The photos listed now are the ones the site already has.) */
(function () {
    'use strict';

    var MOB = 'mobility-vehicle-solutions.html',
        SEC = 'security-surveillance-infrastructure.html',
        DIG = 'digital-branding-business-solutions.html';
    // installation / site photos shared by the vehicle products
    var FLEET = [['images/photoclient.png', 'Fleet tracking for our clients'], ['images/mobility.jpg', 'Vehicles on the road, tracked live']];
    var MINING = [['images/mining%20gps.jpg', 'GPS tracking at a mining site'], ['images/slider-04%20-%20MINING.png', 'Mining fleet operations'], ['images/minegpsclient.png', 'Mining client dashboard']];
    function device(photo, name) { return { page: MOB, photos: [[photo, name + ' installed for fleet clients']].concat(FLEET) }; }

    var PROJECTS = {
        'gps-tracking':        { page: MOB, photos: FLEET.concat(MINING) },
        'v5':                  device('images/v5-GPS.jpg', 'V5 GPS device'),
        'vl149':               device('images/vl149-GPS.png', 'VL149 GPS device'),
        'wetrack140':          device('images/ais140.png', 'Wetrack140 GPS device'),
        'lg300':               device('images/lg300.png', 'LG300 GPS device'),
        'pg201':               device('images/pg201.png', 'PG201 GPS device'),
        'gt800':               device('images/gt800.jpg', 'GT800 GPS device'),
        'eg02':                device('images/eg02.png', 'EG02 GPS device'),
        'vl501':               device('images/vl501.png', 'VL501 GPS device'),
        'jc371':               device('images/jc371.png', 'JC371 GPS device'),
        'traxsmart-ais140':    device('images/ecotrack-ais-140-gps-tracker-device-500x500.webp', 'TraxSmart AIS140'),
        'transight-compass':   device('images/Portfolio.webp', 'Transight COMPASS'),
        'mining-gps':          { page: MOB, photos: MINING },
        'ee202l-dashcam':      device('images/ee202l-1-s-jpg-500x500.webp', 'EE202L Dashcam'),
        'fuel-level-sensor':   device('images/dd3665_702a944f78e74d37863e2e3ce3bd6f4c~mv2.avif', 'Fuel Level Sensor (LLS)'),
        'speed-governor':      device('images/autograde-speed-governor-1000x1000.jpg', 'Speed Governor'),
        'speed-limiter':       device('images/metal-electronic-speed-governor-500x500.webp', 'Electronic Speed Limiter'),
        'fire-suppression':    device('images/fire-detection-suppression-system-fdss-1000x1000.webp', 'Fire Suppression (FDSS)'),
        'reflective-tape':     device('images/41B6Zv325xL._SX342_SY445_QL70_FMwebp_.webp', 'Reflective Tape'),
        'cctv':                { page: SEC, photos: [['images/security.jpg', 'CCTV surveillance installation'], ['images/cctv%206.png', 'Camera systems for offices and industries']] },
        'digital-branding':    { page: DIG, photos: [['images/digital/work-5.jpg', 'Brand identity project'], ['images/digital/work-1.jpg', 'Design project'], ['images/digital/work-7.jpg', 'Agency web design']] },
        'software-solutions':  { page: DIG, photos: [['images/digital/work-4.jpg', 'Web app development'], ['images/digital/work-7.jpg', 'Business website'], ['images/business.jpg', 'Custom software for business']] },
        'social-media':        { page: DIG, photos: [['images/digital/work-3.jpg', 'Business marketing campaign'], ['images/digital/work-5.jpg', 'Social media creatives']] },
        'seo':                 { page: DIG, photos: [['images/digital/work-6.jpg', 'Modern web SEO project'], ['images/digital/work-3.jpg', 'Search marketing results']] }
    };

    var links = document.querySelectorAll('[data-project]');
    if (!links.length) return;

    /* ---------- the gallery (built once) ---------- */
    var box = document.createElement('div');
    box.className = 'pg';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'pg-title');
    box.hidden = true;
    box.innerHTML =
        '<div class="pg-panel">' +
            '<div class="pg-head"><div><span class="pg-kicker">Completed projects</span><h3 id="pg-title"></h3></div>' +
            '<button type="button" class="pg-close" aria-label="Close">&times;</button></div>' +
            '<div class="pg-stage">' +
                '<button type="button" class="pg-nav pg-prev" aria-label="Previous photo">&#8249;</button>' +
                '<img class="pg-img" alt="">' +
                '<button type="button" class="pg-nav pg-next" aria-label="Next photo">&#8250;</button>' +
            '</div>' +
            '<p class="pg-cap" aria-live="polite"></p>' +
            '<div class="pg-thumbs"></div>' +
            '<a class="pg-more" href="#">View product <span aria-hidden="true">&rarr;</span></a>' +
        '</div>';
    document.body.appendChild(box);

    var title = box.querySelector('#pg-title'), img = box.querySelector('.pg-img'),
        cap = box.querySelector('.pg-cap'), thumbs = box.querySelector('.pg-thumbs'),
        more = box.querySelector('.pg-more'), closeBtn = box.querySelector('.pg-close');
    var photos = [], at = 0, opener = null;

    function show(i) {
        at = (i + photos.length) % photos.length;
        img.src = photos[at][0];
        img.alt = photos[at][1];
        cap.textContent = photos[at][1] + (photos.length > 1 ? '  (' + (at + 1) + ' / ' + photos.length + ')' : '');
        Array.prototype.forEach.call(thumbs.children, function (t, n) { t.classList.toggle('is-on', n === at); t.setAttribute('aria-current', String(n === at)); });
    }

    function open(link) {
        var p = PROJECTS[link.getAttribute('data-project')];
        if (!p) return false;
        photos = p.photos;
        title.textContent = link.textContent.trim();
        more.href = p.page;
        thumbs.innerHTML = '';
        photos.forEach(function (ph, n) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'pg-thumb';
            b.setAttribute('aria-label', 'Photo ' + (n + 1) + ': ' + ph[1]);
            var t = document.createElement('img');
            t.src = ph[0];
            t.alt = '';
            b.appendChild(t);
            b.addEventListener('click', function () { show(n); });
            thumbs.appendChild(b);
        });
        box.classList.toggle('is-single', photos.length < 2);
        show(0);
        opener = link;
        box.hidden = false;
        document.documentElement.classList.add('pg-open');
        requestAnimationFrame(function () { box.classList.add('is-in'); });
        closeBtn.focus();
        return true;
    }

    function close() {
        box.classList.remove('is-in');
        document.documentElement.classList.remove('pg-open');
        box.hidden = true;
        if (opener) opener.focus();
    }

    Array.prototype.forEach.call(links, function (link) {
        link.addEventListener('click', function (e) {
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;     // new tab: open the page as usual
            if (open(link)) e.preventDefault();
        });
    });

    closeBtn.addEventListener('click', close);
    box.querySelector('.pg-prev').addEventListener('click', function () { show(at - 1); });
    box.querySelector('.pg-next').addEventListener('click', function () { show(at + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
        if (box.hidden) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(at - 1);
        else if (e.key === 'ArrowRight') show(at + 1);
        else if (e.key === 'Tab') {                          // keep the keyboard inside the gallery
            var f = box.querySelectorAll('button:not([hidden]), a[href]');
            var first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
}());
