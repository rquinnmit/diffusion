/**
 * Fade a native <dialog> in and out.
 *
 * Both overlays on the page, a show panel and the photo lightbox, are <dialog>
 * elements opened with showModal(), so the browser owns the focus trap,
 * Escape, the inert page behind and focus restore. This module adds the one
 * thing the platform lacks: a transition on the way in and out. The stylesheet
 * fades `dialog` from opacity 0 to 1 on `.is-open`; opening flips the class one
 * frame after showModal() so the transition has a start state, and closing
 * removes it and waits for the running transitions before close(). Under
 * prefers-reduced-motion nothing transitions, so the wait resolves at once.
 */

export function openDialog(dialog) {
    if (!dialog.open) {
        dialog.showModal();
        // Force a layout with the dialog displayed so the transition starts
        // from its resting state; otherwise both changes land in one frame.
        void dialog.offsetWidth;
    }
    dialog.classList.add('is-open');
}

export function closeDialog(dialog) {
    if (!dialog.open) return;
    dialog.classList.remove('is-open');
    const running = dialog.getAnimations({ subtree: true }).map((a) => a.finished);
    // A reopen mid-fade cancels the transition, which rejects `finished`, and
    // the dialog then stays open, which is what a reopen wants.
    Promise.all(running).then(
        () => { if (!dialog.classList.contains('is-open')) dialog.close(); },
        () => {}
    );
}

/**
 * Send the three dismissal gestures, Escape, the close control and a click
 * on the backdrop outside the panel, to one handler. Escape arrives as the
 * dialog's `cancel` event; it is prevented so the fade can run, and the
 * handler is expected to end in closeDialog(). A browser that refuses to let
 * the page delay Escape skips `cancel` and closes at once, so callers that
 * keep state should also listen for `close`.
 */
export function onDismiss(dialog, handler) {
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog || event.target.closest('.dialog-close')) handler();
    });
    dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        handler();
    });
}
