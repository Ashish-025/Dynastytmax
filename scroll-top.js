(function () {
    var buttons = document.querySelectorAll('.ssi-back-to-top');
    if (!buttons.length) return;

    function updateButtons() {
        var isScrolled = window.pageYOffset > 160;
        buttons.forEach(function (button) {
            button.classList.toggle('is-visible', isScrolled);
            var actions = button.parentNode;
            if (actions && actions.classList && actions.classList.contains('ssi-floating-actions')) {
                actions.classList.toggle('has-back-to-top', isScrolled);
            }
        });
    }

    window.addEventListener('scroll', updateButtons, { passive: true });
    updateButtons();
})();
