/*  Query box next to the projects section.
    No server yet: on submit it checks the required fields and opens the visitor's
    email app with the query filled in, addressed to the form's data-mailto. */
(function () {
    'use strict';
    var form = document.querySelector('.dm-query-form');
    if (!form) return;
    var status = form.querySelector('.dm-query-status');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var missing = [];
        Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (f) {
            var bad = !f.value.trim();
            f.classList.toggle('is-invalid', bad);
            f.setAttribute('aria-invalid', String(bad));
            if (bad) missing.push(f);
        });
        if (missing.length) {
            status.textContent = 'Please fill in all fields.';
            status.classList.add('is-error');
            missing[0].focus();
            return;
        }
        var lines = [];
        Array.prototype.forEach.call(form.querySelectorAll('input, textarea, select'), function (f) {
            var label = f.closest('label');
            var name = label ? label.childNodes[0].textContent.trim() : f.name;
            lines.push(name + ': ' + f.value.trim());
        });
        var subject = 'Website query from ' + (form.elements.name ? form.elements.name.value.trim() : 'visitor');
        window.location.href = 'mailto:' + form.getAttribute('data-mailto') +
            '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
        status.classList.remove('is-error');
        status.textContent = 'Opening your email app to send the query...';
    });
}());
