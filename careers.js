/*  Careers sections on the contact page (styles in careers.css):
      - department pills filter the open-role cards
      - arrows scroll the team cards row */
(function () {
    'use strict';

    /* ---------- role filter ---------- */
    var pills = [].slice.call(document.querySelectorAll('.cr-filters button'));
    var roles = [].slice.call(document.querySelectorAll('.cr-role'));
    pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            var dept = pill.getAttribute('data-dept');
            pills.forEach(function (p) { p.setAttribute('aria-pressed', p === pill ? 'true' : 'false'); });
            roles.forEach(function (r) { r.hidden = dept !== 'all' && r.getAttribute('data-dept') !== dept; });
        });
    });

    /* ---------- team cards row ---------- */
    var row = document.querySelector('.cr-team');
    var prev = document.querySelector('.cr-team-nav.is-prev');
    var next = document.querySelector('.cr-team-nav.is-next');
    if (!row || !prev || !next) return;

    function step() {
        var card = row.querySelector('li');
        return card ? card.getBoundingClientRect().width + 20 : 320;
    }
    function update() {
        prev.disabled = row.scrollLeft <= 8;
        next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 8;
    }
    prev.addEventListener('click', function () { row.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { row.scrollBy({ left: step(), behavior: 'smooth' }); });
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}());
