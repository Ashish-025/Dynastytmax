(function () {
    var strip = document.querySelector('.site-contact-strip');
    if (!strip) return;

    function updateStrip() {
        strip.classList.toggle('is-hidden', window.pageYOffset > 30);
    }

    window.addEventListener('scroll', updateStrip, { passive: true });
    updateStrip();
})();
