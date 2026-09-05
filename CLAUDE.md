# Diffusion — diffusiondj.com

Ryan's DJ site. He performs as Diffusion. Origin `rquinnmit/diffusion`, public,
default branch `main`, served by GitHub Pages on push at `https://diffusiondj.com`
(the `CNAME` file at the root is what binds the domain; never delete it). DNS is
at Cloudflare. The site lived at `rquinnmit.github.io/music/` until 2026-09-05,
and that path now redirects here, preserving the `#show/<slug>` hash. The
professional site links here; this site deliberately does not link back.

## Stack

Hand-written HTML, CSS, and vanilla JS. **No package.json, no bundler, no build
step, no test suite.** There is nothing to run before shipping, and claiming
"tests pass" here would be meaningless — say so plainly instead.

Because every file is hand-authored, never reformat HTML or CSS wholesale. Match
the surrounding indentation and leave untouched lines untouched.

Layout: `index.html`, `music.css`, `show.js`, and `lightbox.js` at the root;
images under `images/` (`sets/`, `photos/`, `shows/<slug>/`, the OG card
`og-diffusion.png`, and the favicon).

To look at the page in Playwright, serve the repo over HTTP first (`python3 -m
http.server`); the Playwright MCP refuses `file:` URLs. Navigating from a URL to
the same URL plus a hash is a fragment navigation and does not reload the
document, so add a throwaway query string when a reload is the point.

## Sections

Sections are `#upcoming`, `#sets`, `#photos`, `#played`, and `#booking` — there
is deliberately no About section.

`#upcoming` and `#played` share one grid, so a show moves between them by
editing its date and dropping `gig--next`. Upcoming rows are links to the ticket
page and carry a day-level date (`Aug 29`); played rows carry month and year
(`May 2026`). The row template lives in an HTML comment above the rows.

`#upcoming` stays on the page when nothing is booked. Ryan decided this on
2026-09-01: with no rows it is a plain `sechead` over blank space, with no
empty-state line, and the `sechead--cols` header with its Location label comes
back with the first row. The HTML comment in the section shows both forms.
Never delete the section or its nav link, and never add a "nothing here"
message; blank space is his chosen signal for that, here and in a show panel
with no media yet.

A Played row can open a show dialog over the page: a SoundCloud recording, a
video embed, and photos from that night in a centred panel with the page
dimmed and blurred behind it. The row's `gig-venue` becomes a `<button
aria-controls="show-<slug>">`, the row takes `gig--show`, and a hidden
`<section class="show" id="show-<slug>">` after the rows holds the content.
There is deliberately no hint text on the row; a faint underline is the only
mark. `show.js` opens it, mirrors the open show as `#show/<slug>` so back and
shared links work, closes on Escape, the Close control, or a click on the
backdrop, and copies `data-src` to `src` on embeds the first time a show opens.
The panel has two halves and no labels, modelled on a label's release page
Ryan supplied: `show-lead` on the left holds the video, the title, a `show-link`
to the event's ticket-page listing, and the SoundCloud player, with no date or
city line; `show-grid` on the right is one `show-tile` per photo, reusing the
Sets grid's `tile-art` and `tile-meta` classes. A show with no grid narrows to
one column. The close control is a bare ✕ with an aria-label, no word. The
template comment above the first section shows the full form. Photos for a show
live under `images/shows/<slug>/`; video and audio are always embeds, never
local files. The cruise holds its title and its posh.vip listing until its
media exists. That link is proof the gig happened, not an attempt to sell a
passed date, so it sits in the same faint mono register as a `gig-note` and
reads "Event listing" rather than "Tickets".

Photos rail shots open in a centered lightbox on click (`lightbox.js`).

## Wordmark animation

The centered title runs a noise-to-clarity diffusion animation built by clipping
noise to the letterforms and revealing three states through their own masks.
`music.css` ends with a `@media (prefers-reduced-motion: reduce)` block, and
that OS setting has twice been mistaken for the animation being broken. Check
it before debugging any animation here.

The entrance plays on phones too. Until 2026-08-28 the `@media (max-width: 600px)`
block in `music.css` hid it outright; it now swaps the middle layer to
`#mark-noise-mid-sm` in `index.html`, a twin of `#mark-noise-mid` with every
absolute length halved so the tearing stays proportionate to 50px glyphs. If the
two filters ever diverge, change both. Verified at 375px and 320px in Playwright
only, never on phone hardware. To see a phone width, use Playwright's
`browser_resize`: the Chrome MCP's `resize_window` reports success but leaves
`innerWidth` unchanged on a maximized window.

## Ignored on purpose

`docs/` and `.superpowers/` are gitignored. Pages serves whatever is in the
branch, so tracking them would publish planning artifacts at diffusiondj.com/docs/.
