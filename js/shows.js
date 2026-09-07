/**
 * Show dialogs for Played rows.
 *
 * A row whose title is <button aria-controls="show-SLUG"> opens
 * <dialog class="show" id="show-SLUG">. The open show is mirrored in the URL
 * as #show/SLUG, which is what makes the back button close it and lets the
 * link be shared; a page loaded with that hash opens the show at once. Embeds
 * inside a show carry data-src rather than src and are given a real src the
 * first time it opens, so a show that is never opened loads nothing.
 */
import { openDialog, closeDialog, onDismiss } from './dialog.js';

const ID_PREFIX = 'show-';
const HASH_PREFIX = '#show/';

let current = null;
let opener = null;
let pushed = false;

function showForHash(hash) {
    if (!hash.startsWith(HASH_PREFIX)) return null;
    const dialog = document.getElementById(ID_PREFIX + hash.slice(HASH_PREFIX.length));
    return dialog && dialog.classList.contains('show') ? dialog : null;
}

function loadEmbeds(dialog) {
    for (const frame of dialog.querySelectorAll('iframe[data-src]')) {
        frame.src = frame.dataset.src;
        frame.removeAttribute('data-src');
    }
}

function present(dialog, trigger) {
    if (current === dialog && dialog.classList.contains('is-open')) return;
    if (current) closeDialog(current);
    current = dialog;
    opener = trigger || null;
    loadEmbeds(dialog);
    openDialog(dialog);
}

// Leave through history when the hash is an entry this page pushed, so the
// close control and the back button land on the same state; otherwise clear
// the hash in place and close directly.
function dismiss() {
    if (!current) return;
    if (pushed) {
        history.back();
    } else {
        history.replaceState(null, '', location.pathname + location.search);
        closeDialog(current);
    }
}

function settle(dialog) {
    if (current !== dialog) return;
    current = null;
    // Still the hash's target here means the browser closed the dialog on its
    // own, so the URL has to follow.
    if (showForHash(location.hash) === dialog) {
        if (pushed) history.back();
        else history.replaceState(null, '', location.pathname + location.search);
    }
    pushed = false;
    if (opener) opener.focus();
    opener = null;
}

function route() {
    const target = showForHash(location.hash);
    if (target) {
        present(target, opener);
    } else if (current) {
        pushed = false;
        closeDialog(current);
    }
}

document.addEventListener('click', (event) => {
    const trigger = event.target.closest(`[aria-controls^="${ID_PREFIX}"]`);
    if (!trigger) return;
    const dialog = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!dialog || !dialog.classList.contains('show')) return;
    event.preventDefault();
    history.pushState(null, '', HASH_PREFIX + dialog.id.slice(ID_PREFIX.length));
    pushed = true;
    present(dialog, trigger);
});

for (const dialog of document.querySelectorAll('dialog.show')) {
    onDismiss(dialog, dismiss);
    dialog.addEventListener('close', () => settle(dialog));
}

window.addEventListener('hashchange', route);
route();
