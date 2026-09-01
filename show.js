/* Show detail overlays for the DJ page.

   A Played row whose title is <button aria-controls="show-SLUG"> opens the
   <section class="show" id="show-SLUG"> that follows the rows. The open show
   is mirrored in the URL as #show/SLUG so the back button closes it and the
   link can be shared. Embeds inside a show carry data-src and are given a real
   src the first time it opens. */
(function () {
    'use strict';

    var ID_PREFIX = 'show-';
    var HASH_PREFIX = '#show/';
    var EXIT_MS = 260;
    var FOCUSABLE = 'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

    var open = null;
    var opener = null;
    var pushed = false;

    function sectionForHash(hash) {
        if (hash.indexOf(HASH_PREFIX) !== 0) return null;
        var section = document.getElementById(ID_PREFIX + hash.slice(HASH_PREFIX.length));
        return section && section.classList.contains('show') ? section : null;
    }

    function loadEmbeds(section) {
        var frames = section.querySelectorAll('iframe[data-src]');
        for (var i = 0; i < frames.length; i++) {
            frames[i].src = frames[i].getAttribute('data-src');
            frames[i].removeAttribute('data-src');
        }
    }

    function show(section, trigger) {
        if (open === section) return;
        if (open) hide(open, false);
        open = section;
        opener = trigger || null;
        loadEmbeds(section);
        section.hidden = false;
        // Force a layout with the section visible so the transition starts from
        // its resting state; otherwise both changes land in one frame.
        void section.offsetWidth;
        section.classList.add('is-open');
        document.body.classList.add('show-open');
        var close = section.querySelector('.show-close');
        if (close) close.focus();
    }

    function hide(section, restoreFocus) {
        section.classList.remove('is-open');
        document.body.classList.remove('show-open');
        if (open === section) open = null;
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.setTimeout(function () {
            if (!section.classList.contains('is-open')) section.hidden = true;
        }, reduced ? 0 : EXIT_MS);
        if (restoreFocus && opener) opener.focus();
        opener = null;
    }

    function close() {
        if (!open) return;
        if (pushed) {
            history.back();
        } else {
            history.replaceState(null, '', location.pathname + location.search);
            hide(open, true);
        }
    }

    function route() {
        var target = sectionForHash(location.hash);
        if (target) {
            show(target, opener);
        } else if (open) {
            pushed = false;
            hide(open, true);
        }
    }

    function trapTab(event) {
        var items = open.querySelectorAll(FOCUSABLE);
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    document.addEventListener('click', function (event) {
        var trigger = event.target.closest('[aria-controls^="' + ID_PREFIX + '"]');
        if (trigger) {
            var section = document.getElementById(trigger.getAttribute('aria-controls'));
            if (!section || !section.classList.contains('show')) return;
            event.preventDefault();
            history.pushState(null, '', HASH_PREFIX + section.id.slice(ID_PREFIX.length));
            pushed = true;
            show(section, trigger);
            return;
        }
        if (open && event.target.closest('.show-close')) close();
    });

    document.addEventListener('keydown', function (event) {
        if (!open) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
        } else if (event.key === 'Tab') {
            trapTab(event);
        }
    });

    window.addEventListener('hashchange', route);
    route();
}());
