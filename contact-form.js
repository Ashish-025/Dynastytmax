/*  Contact page form ("Send Us a Message").
    Like the home page query box (query-box.js): on submit it checks the fields and opens
    WhatsApp (wa.me) with the message typed out, addressed to the number in data-whatsapp.
    Required: name, email, subject, message. The phone number is optional, but must be a
    real number (10+ digits) when given. */
(function () {
    'use strict';
    var form = document.querySelector('form.contact-form');
    if (!form) return;
    var status = form.querySelector('.contact-status');

    function isValid(f) {
        var v = f.value.trim();
        if (!v) return !f.required;                               // empty optional field is fine
        if (f.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (f.type === 'tel') return v.replace(/\D/g, '').length >= 10;
        return true;
    }
    function say(text, isError) {
        if (!status) return;
        status.textContent = text;
        status.classList.toggle('is-error', !!isError);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = [];
        Array.prototype.forEach.call(form.querySelectorAll('input, textarea'), function (f) {
            var ok = isValid(f);
            f.classList.toggle('is-invalid', !ok);
            f.setAttribute('aria-invalid', String(!ok));
            if (!ok) bad.push(f);
        });
        if (bad.length) {
            var f = bad[0];
            say(f.type === 'email' && f.value.trim() ? 'Please enter a valid email address.'
                : f.type === 'tel' ? 'Please enter a valid contact number.'
                : 'Please fill in all the required fields.', true);
            f.focus();
            return;
        }
        // the WhatsApp message: one "*Label:* value" line per filled-in field
        var lines = ['*New message from the website*', ''];
        Array.prototype.forEach.call(form.querySelectorAll('input, textarea'), function (f) {
            if (!f.value.trim()) return;
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
        say('Opening WhatsApp - press Send to deliver your message.', false);
        form.reset();
    });

    // clear the red outline as soon as a field is corrected
    form.addEventListener('input', function (e) {
        if (e.target.classList.contains('is-invalid') && isValid(e.target)) {
            e.target.classList.remove('is-invalid');
            e.target.setAttribute('aria-invalid', 'false');
        }
    });
}());
