/* Lightbox for the Photos rail. Clicking a .shot-btn copies that photo into
   the single shared #lightbox and opens it, enlarged and centered over the
   dimmed, blurred page. Escape, the close control, and a click on the
   backdrop all close it. There's no gallery navigation between photos and no
   URL hash — unlike the show dialogs, an enlarged photo isn't a destination
   worth linking to on its own. */
(function () {
    'use strict';

    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var img = lightbox.querySelector('.lightbox-img');
    var close = lightbox.querySelector('.lightbox-close');
    var opener = null;

    function open(trigger) {
        var source = trigger.querySelector('img');
        if (!source) return;
        img.src = source.src;
        img.alt = source.alt;
        opener = trigger;
        lightbox.hidden = false;
        // Force a layout with the lightbox visible so the transition starts
        // from its resting state; otherwise both changes land in one frame.
        void lightbox.offsetWidth;
        lightbox.classList.add('is-open');
        document.body.classList.add('lightbox-open');
        close.focus();
    }

    function hide() {
        lightbox.classList.remove('is-open');
        document.body.classList.remove('lightbox-open');
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.setTimeout(function () {
            if (!lightbox.classList.contains('is-open')) {
                lightbox.hidden = true;
                img.src = '';
            }
        }, reduced ? 0 : 260);
        if (opener) opener.focus();
        opener = null;
    }

    document.addEventListener('click', function (event) {
        var trigger = event.target.closest('.shot-btn');
        if (trigger) {
            open(trigger);
            return;
        }
        if (lightbox.hidden) return;
        if (event.target === lightbox || event.target.closest('.lightbox-close')) hide();
    });

    document.addEventListener('keydown', function (event) {
        if (lightbox.hidden) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            hide();
        } else if (event.key === 'Tab') {
            // The close control is the only focusable element in the dialog.
            event.preventDefault();
            close.focus();
        }
    });
}());
