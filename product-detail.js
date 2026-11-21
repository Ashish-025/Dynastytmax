/*  Home page, Our Projects: clicking a product in the middle "Our Products" list shows its photo
    and details in the big left box: name, a short
    description, key features, "View product" (its page) and "Project photos" (the gallery from
    project-gallery.js). The first product shows on load. Styles in i3ms-section.css.
    Without JavaScript the names simply open the product pages.

    TO CHANGE A PRODUCT'S TEXT OR PHOTO: edit PRODUCTS below. Each key matches a list link's
    data-product in index.html (and the gallery's key in project-gallery.js). */
(function () {
    'use strict';

    var MOB = 'mobility-vehicle-solutions.html',
        SEC = 'security-surveillance-infrastructure.html',
        DIG = 'digital-branding-business-solutions.html';

    var PRODUCTS = {
        'ais140-vltd': {
            photo: 'images/ais140.png', page: MOB,
            text: 'AIS-140 certified Vehicle Location Tracking Device with panic buttons, for commercial and public transport vehicles.',
            features: ['AIS-140 certified', 'Emergency / panic buttons', 'Live tracking on web & mobile', 'Connects to the government backend']
        },
        'mining-vts': {
            photo: 'images/mining%20gps.jpg', page: MOB,
            text: 'Vehicle tracking for mining trucks, from the mine to the destination, with RFID and weighbridge integration.',
            features: ['Live mine-to-destination tracking', 'RFID & weighbridge integration', 'Geo-fenced routes', 'Trip and transit reports']
        },
        'tracking-gps': {
            photo: 'images/v5-GPS.jpg', page: MOB,
            text: 'Real-time GPS trackers for cars, bikes, trucks and fleets, with live location, alerts and history on web and mobile.',
            features: ['Live location', 'Route history playback', 'Overspeed & geo-fence alerts', 'Fleet reports']
        },
        'fuel-gps': {
            photo: 'images/dd3665_702a944f78e74d37863e2e3ce3bd6f4c~mv2.avif', page: MOB,
            text: 'GPS tracking with a fuel level sensor that shows every refill, the fuel used and any fuel theft.',
            features: ['Fuel level monitoring', 'Refill & drain (theft) alerts', 'Mileage reports', 'Live tracking']
        },
        'speed-governor': {
            photo: 'images/autograde-speed-governor-1000x1000.jpg', page: MOB,
            text: 'Speed limiting devices that keep commercial vehicles within the legal speed limit.',
            features: ['Set maximum speed', 'Tamper-proof sealing', 'For transport rules compliance', 'Fitting & support']
        },
        'reflective-tape': {
            photo: 'images/41B6Zv325xL._SX342_SY445_QL70_FMwebp_.webp', page: MOB,
            text: 'Retro-reflective tape that makes trucks and buses clearly visible at night.',
            features: ['High night visibility', 'Red, white & yellow', 'Fitting for trucks & buses']
        },
        'auto-meter': {
            photo: 'images/mobility.jpg', page: MOB,
            text: 'Digital fare meters for auto-rickshaws and taxis that calculate fares accurately.',
            features: ['Accurate fare calculation', 'Clear digital display', 'Fitting & support']
        },
        'dash-camera': {
            photo: 'images/ee202l-1-s-jpg-500x500.webp', page: MOB,
            text: 'Vehicle dash cameras that record the road and the cabin, for safety and evidence.',
            features: ['HD road recording', 'Front & cabin views', 'Event & crash recording']
        },
        'cctv-camera': {
            photo: 'images/security.jpg', page: SEC,
            text: 'CCTV surveillance for homes, offices, schools and industries, with viewing on your mobile.',
            features: ['HD & IP cameras', 'Mobile remote viewing', 'Night vision', 'Installation & AMC']
        },
        'branding': {
            photo: 'images/digital/work-5.jpg', page: DIG,
            text: 'Logos, brand identity and print design that make your business memorable.',
            features: ['Logo design', 'Brand identity', 'Print & packaging']
        },
        'digital-marketing': {
            photo: 'images/digital/work-3.jpg', page: DIG,
            text: 'Social media, ads and campaigns that bring real customers to your business.',
            features: ['Social media management', 'Google & Meta ads', 'Content creation']
        },
        'seo': {
            photo: 'images/digital/work-6.jpg', page: DIG,
            text: 'Rank higher on Google and get found by more customers in your area.',
            features: ['Local SEO', 'Keyword ranking', 'Site audit']
        },
        'web-design': {
            photo: 'images/digital/work-7.jpg', page: DIG,
            text: 'Fast, responsive websites that look great on every device and turn visitors into customers.',
            features: ['Responsive design', 'Business websites', 'E-commerce stores']
        },
        'software-solution': {
            photo: 'images/digital/work-4.jpg', page: DIG,
            text: 'Custom software and apps that automate your work and grow your business.',
            features: ['Custom software', 'Web & mobile apps', 'Cloud & IT support']
        }
    };

    var stage = document.querySelector('.dm-i3ms-stage');
    var panel = stage && stage.querySelector('.dm-i3ms-detail');
    var links = document.querySelectorAll('[data-product]');
    if (!panel || !links.length) return;

    var img = panel.querySelector('.dm-i3ms-detail-photo img'),
        name = panel.querySelector('.dm-i3ms-detail-name'),
        text = panel.querySelector('.dm-i3ms-detail-text'),
        list = panel.querySelector('.dm-i3ms-detail-list'),
        more = panel.querySelector('.dm-i3ms-detail-more'),
        photos = panel.querySelector('.dm-i3ms-detail-photos');
    var current = null;

    // fromClick: false for the first product shown on load (no scrolling, no focus move)
    function show(link, fromClick) {
        var key = link.getAttribute('data-product'), p = PRODUCTS[key];
        if (!p) return false;
        var title = link.textContent.trim();
        img.src = p.photo;
        img.alt = title;
        name.textContent = title;
        text.textContent = p.text;
        list.innerHTML = '';
        p.features.slice(0, 3).forEach(function (f) {    // at most 3, to keep the details short
            var li = document.createElement('li');
            li.textContent = f;
            list.appendChild(li);
        });
        more.href = p.page;
        photos.setAttribute('data-project', key);          // project-gallery.js opens this product's photos
        photos.setAttribute('data-title', title);

        if (current) current.removeAttribute('aria-current');
        current = link;
        link.setAttribute('aria-current', 'true');
        stage.classList.add('is-detail');
        panel.hidden = false;
        pointArrow();
        if (fromClick) {
            // phones / tablets: the box sits above the list, so bring it into view
            if (window.matchMedia('(max-width: 999px)').matches) stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            name.focus({ preventScroll: true });
        }
        return true;
    }

    // the details box's arrow points at the chosen product: level it with the selected row
    function pointArrow() {
        if (!current) return;
        var row = current.getBoundingClientRect(), box = panel.getBoundingClientRect();
        if (!box.height) return;
        panel.style.setProperty('--arrow-y', Math.round(row.top - box.top + row.height / 2) + 'px');
    }

    Array.prototype.forEach.call(links, function (link) {
        link.addEventListener('click', function (e) {
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;     // new tab: open the page as usual
            if (show(link, true)) e.preventDefault();
        });
    });

    show(links[0], false);                                       // the first product (AIS-140 VLTD) from the start
    window.addEventListener('resize', pointArrow);
    window.addEventListener('load', pointArrow);                 // fonts / images can shift the rows
}());
