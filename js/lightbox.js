/**
 * Lightbox for the Photos rail.
 *
 * Clicking a .shot-btn copies that photo into the single shared #lightbox
 * dialog and opens it, enlarged and centered over the dimmed page. There is
 * no gallery navigation between photos and no URL hash: unlike a show, an
 * enlarged photo is not a destination worth linking to on its own.
 */
import { openDialog, closeDialog, onDismiss } from './dialog.js';

const lightbox = document.getElementById('lightbox');
const img = lightbox && lightbox.querySelector('.lightbox-img');
let opener = null;

function open(trigger) {
    const source = trigger.querySelector('img');
    if (!source) return;
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    opener = trigger;
    openDialog(lightbox);
}

if (lightbox) {
    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('.shot-btn');
        if (trigger) open(trigger);
    });

    onDismiss(lightbox, () => closeDialog(lightbox));

    lightbox.addEventListener('close', () => {
        img.removeAttribute('src');
        if (opener) opener.focus();
        opener = null;
    });
}
