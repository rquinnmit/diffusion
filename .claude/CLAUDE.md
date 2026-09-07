# Diffusion — diffusiondj.com

Ryan's DJ site. He performs as Diffusion. Origin `rquinnmit/diffusion`, public,
default branch `main`, served by GitHub Pages on push at `https://diffusiondj.com`
(the `CNAME` file at the root is what binds the domain; never delete it). DNS
is at Cloudflare. The site lived at
`rquinnmit.github.io/music/` until 2026-09-05, and that path now redirects here,
preserving the `#show/<slug>` hash. The professional site links here; this site
deliberately does not link back.

`README.md` explains the layout and the routine edits. This file holds the
decisions and the rules behind them.

## Stack

Hand-written HTML, CSS, and vanilla JS. **No package.json, no bundler, no build
step, no test suite.** The one thing to run is `python3 tools/check.py`, a
standard-library script that verifies the invariants listed in its docstring.
Run it after editing `index.html` or `css/site.css`, and say plainly that it is
a lint, not a test suite, when reporting.

Because every file is hand-authored, never reformat HTML or CSS wholesale. Match
the surrounding indentation and leave untouched lines untouched.

Layout: `index.html` at the root; `css/site.css`; `js/dialog.js`, `js/shows.js`
and `js/lightbox.js` as ES modules; `fonts/` with the self-hosted latin woff2
files; images under `images/` (`sets/`, `photos/`, `shows/<slug>/`, the OG card
`og-diffusion.png`, and the favicon). Image paths never move: the OG card URL is
cached by scrapers and the old-domain redirect points at this tree.

Fonts are self-hosted so the wordmark face arrives over the page's own
connection; the entrance is a one-shot animation that starts at document load,
so a second origin in front of the font was the site's real performance risk.
Both files are the latin subsets of Google Fonts' woff2 builds under the SIL
Open Font License. Do not reintroduce a fonts.googleapis.com or gstatic link.

To look at the page in Playwright, serve the repo over HTTP first (`python3 -m
http.server`); the Playwright MCP refuses `file:` URLs, and module scripts do
not run from them either. Navigating from a URL to the same URL plus a hash is
a fragment navigation and does not reload the document, so add a throwaway
query string when a reload is the point.

## Stylesheet and dialogs

The header comment of `css/site.css` and the docstring of `js/dialog.js` say
how each works. The rules: a new CSS rule's media query goes beside its
component, not in a block at the end; a tint is `color-mix()` of a palette
token, never a new hex; shows and the lightbox stay native `<dialog>`s, so do
not add a hand-rolled focus trap, `hidden`, `role="dialog"` or a body class
back. The checker enforces the CSS half of this.

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
aria-controls="show-<slug>">`, the row takes `gig--show`, and a
`<dialog class="show" id="show-<slug>">` after the rows holds the content.
There is deliberately no hint text on the row; a faint underline is the only
mark. `js/shows.js` opens it, mirrors the open show as `#show/<slug>` so back and
shared links work, closes on Escape, the Close control, a click on the
backdrop, or the back button, and copies `data-src` to `src` on embeds the
first time a show opens. The panel has two halves and no labels, modelled on a
label's release page Ryan supplied: `show-lead` on the left holds the video,
the title, a `show-link` to the event's ticket-page listing, and the SoundCloud
player, with no date or city line; `show-grid` on the right is one `show-tile`
per photo, reusing the Sets grid's `tile-art` and `tile-meta` classes. A show
with no grid narrows to one column. The close control is a bare ✕ with an
aria-label, no word. The template comment above the first dialog shows the
full form. Photos for a show will live under `images/shows/<slug>/`; video and audio
are always embeds, never local files. The cruise and Mirage hold their titles
and listing links until their media exists. That link is proof the gig
happened, not an attempt to sell a passed date, so it sits in the same faint
mono register as a `gig-note` and reads "Event listing" rather than "Tickets".

Photos rail shots open in a centered lightbox on click (`js/lightbox.js`).
Set covers are `<name>.webp` at 500px, and where SoundCloud holds the artwork
at 1000px or more a `<name>-1000.webp` twin joined by `srcset`, so 2x desktop
screens get the sharp one and phones the small one. The twins are
centre-square crops of the SoundCloud originals: fetch the track page, take
its `-t500x500` artwork URL, swap in `-original`. Late Night Mix and R&B Mix
exist only at 500px there, and the Tech House page did not expose its artwork
on 2026-09-07. Never upscale a cover to fake the twin. Rail and show photos
are WebP too.

## Hosting

Cloudflare holds the DNS and stays DNS-only. Proxying through Cloudflare would
add HTTP/3, Brotli and long browser caching, but GitHub's certificate
provisioning and renewal for the custom domain expects the records to point
at Pages directly, and a lapsed renewal behind a proxy breaks HTTPS for the
whole site. Decided 2026-09-07: the ten-minute cache is the price of not
babysitting that. Do not turn the proxy on to fix a caching complaint.

## Wordmark animation

The centered title runs a noise-to-clarity diffusion animation built by clipping
noise to the letterforms and revealing three states through their own masks.
`css/site.css` ends with a `@media (prefers-reduced-motion: reduce)` block, and
that OS setting has twice been mistaken for the animation being broken. Check
it before debugging any animation here.

The entrance plays on phones too. Until 2026-08-28 the phone media query hid it
outright; it now swaps the middle layer to `#mark-noise-mid-sm` in `index.html`,
a twin of `#mark-noise-mid` with every absolute length halved (rounded to a
whole number where needed) and the coarse warp frequency doubled, so the
tearing stays proportionate to 50px glyphs. The checker fails if the two
diverge. Verified at 375px and 320px in Playwright only, never on phone
hardware. To see a phone width, use Playwright's `browser_resize`: the Chrome
MCP's `resize_window` reports success but leaves `innerWidth` unchanged on a
maximized window.

Playwright's WebKit does not reproduce Safari's mask-plus-filter rendering.
Anything touching the wordmark's masks or filters must be checked in real
Safari; the memory note on the Safari testbed says how.

## Kept off the site

`docs/`, `.superpowers/` and `.playwright-mcp/` are gitignored. Pages serves
whatever is in the branch, so tracking them would publish planning artifacts at
diffusiondj.com/docs/. This file lives at `.claude/CLAUDE.md` and there is no
`.nojekyll` for the same reason: Jekyll's pass is what keeps dot-directories
off the site (verified 2026-09-07 that with `.nojekyll` present Pages served
them; only `.github/` stays withheld). Never add `.nojekyll`; the checker
fails if it appears.
