/*  Query box next to the projects section.
    Fields: name, contact number, email, product, then a service list that changes to
    match the chosen product.
    On submit it checks the fields and opens WhatsApp (wa.me) with the query typed out,
    addressed to the number in the form's data-whatsapp. */
(function () {
    'use strict';
    var form = document.querySelector('.dm-query-form');
    if (!form) return;
    var status = form.querySelector('.dm-query-status');
    var product = form.elements.product;
    var service = form.elements.service;

    // services offered for each product (edit these lists to change the dropdown)
    var SERVICES = {
        'GPS Tracking': ['Vehicle GPS tracker installation', 'AIS 140 certified tracker', 'Fleet management software',
            'Mining vehicle tracking (VTS)', 'Fuel monitoring sensor', 'Dashcam installation', 'Repair / AMC support'],
        'CCTV & Security': ['New CCTV installation', 'Upgrade / add more cameras', 'Remote mobile viewing setup',
            'Access control system', 'Fire alarm system', 'Repair / AMC support'],
        'Digital Branding': ['Logo & brand identity', 'Brochure / print design', 'Website design',
            'Photo & video production', 'Complete branding package'],
        'Software Solutions': ['Website development', 'Mobile app development', 'Custom business software',
            'ERP / CRM solution', 'Software maintenance & support'],
        'Social Media Marketing': ['Page setup & optimisation', 'Content creation & posting', 'Paid ads campaigns',
            'Influencer marketing', 'Monthly SMM package'],
        'SEO': ['SEO audit', 'On-page SEO', 'Local SEO / Google Business Profile', 'Link building', 'Monthly SEO package']
    };

    function fillServices() {
        var list = SERVICES[product.value] || [];
        service.innerHTML = '';
        var first = document.createElement('option');
        first.value = '';
        first.textContent = list.length ? 'Select a service' : 'Select a product first';
        service.appendChild(first);
        list.forEach(function (name) {
            var o = document.createElement('option');
            o.textContent = name;
            service.appendChild(o);
        });
        service.disabled = !list.length;
        service.classList.remove('is-invalid');
    }
    product.addEventListener('change', fillServices);
    fillServices();

    function isValid(f) {
        var v = f.value.trim();
        if (!v) return false;
        if (f.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (f.type === 'tel') return v.replace(/\D/g, '').length >= 10;
        return true;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = [];
        Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (f) {
            var ok = isValid(f);
            f.classList.toggle('is-invalid', !ok);
            f.setAttribute('aria-invalid', String(!ok));
            if (!ok) bad.push(f);
        });
        if (bad.length) {
            var f = bad[0];
            status.textContent = f.type === 'email' && f.value.trim() ? 'Please enter a valid email address.'
                : f.type === 'tel' && f.value.trim() ? 'Please enter a valid contact number.'
                : f === service && service.disabled ? 'Please select a product.'
                : 'Please fill in all fields.';
            status.classList.add('is-error');
            (service.disabled && f === service ? product : f).focus();
            return;
        }
        // build the WhatsApp message: one "*Label:* value" line per field
        var lines = ['*New website query*', ''];
        Array.prototype.forEach.call(form.querySelectorAll('input, textarea, select'), function (f) {
            var label = f.closest('label');
            var name = label ? label.childNodes[0].textContent.trim() : f.name;
            lines.push('*' + name + ':* ' + f.value.trim());
        });
        var url = 'https://wa.me/' + form.getAttribute('data-whatsapp') +
            '?text=' + encodeURIComponent(lines.join('\n'));
        // new tab on desktop (WhatsApp Web); phones hand the link to the WhatsApp app
        var win = window.open(url, '_blank');
        if (win) win.opener = null;              // the WhatsApp tab can't reach back into this page
        else window.location.href = url;         // pop-up blocked: open it in this tab
        status.classList.remove('is-error');
        status.textContent = 'Opening WhatsApp - press Send to deliver your query.';
        form.reset();
        fillServices();
    });

    // clear the red outline as soon as a field is corrected
    form.addEventListener('input', function (e) {
        if (e.target.classList.contains('is-invalid') && isValid(e.target)) {
            e.target.classList.remove('is-invalid');
            e.target.setAttribute('aria-invalid', 'false');
        }
    });
    form.addEventListener('change', function (e) {
        if (e.target.tagName === 'SELECT' && e.target.value) e.target.classList.remove('is-invalid');
    });
}());
