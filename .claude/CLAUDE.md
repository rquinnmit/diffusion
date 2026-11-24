# Diffusion — diffusiondj.com

Ryan's DJ site. He performs as Diffusion. Origin `rquinnmit/diffusion`, public,
default branch `main`, served by GitHub Pages on push at `https://diffusiondj.com`.
Keep the `CNAME` file at the root in place; never delete it, because it is what
binds the domain. The old address `rquinnmit.github.io/music/` redirects here,
preserving the hash (an old `#show/<slug>` link now just opens the page). The
professional site links here; this site deliberately does not link back.

`README.md` explains the layout and the routine edits. This file holds the
decisions and the rules behind them.

## Stack

Hand-written HTML, CSS, and vanilla JS. There is no package.json, no bundler,
no build step, and no test suite. The one thing to run is
`python3 tools/check.py`, a standard-library script that verifies the
invariants listed in its docstring. Run it after editing `index.html` or
`css/site.css`, and say plainly that it is a lint, not a test suite, when
reporting.

Because every file is hand-authored, match the surrounding indentation and
leave untouched lines untouched; never reformat HTML or CSS wholesale.

Keep every image at its current path under `images/`; never move or rename one,
because the URL of the OG card (`images/og-diffusion.png`) is cached by
scrapers and the old-domain redirect points at this tree.

Fonts are self-hosted so the wordmark face arrives over the page's own
connection; the entrance is a one-shot animation that starts at document load,
so a second origin in front of the font was the site's real performance risk.
Keep the fonts loading from `fonts/`; never reintroduce a fonts.googleapis.com
or gstatic link.

To look at the page in Playwright, serve the repo over HTTP first (`python3 -m
http.server`); the Playwright MCP refuses `file:` URLs, and module scripts do
not run from them either. Navigating from a URL to the same URL plus a hash is
a fragment navigation and does not reload the document, so add a throwaway
query string when a reload is the point.

## Stylesheet and dialogs

The header comment of `css/site.css` and the docstring of `js/dialog.js` say
how each works. The rules: a new CSS rule's media query goes beside its
component, not in a block at the end; a tint is `color-mix()` of a palette
token, never a new hex; the lightbox stays a native `<dialog>`, so do
not add a hand-rolled focus trap, `hidden`, `role="dialog"` or a body class
back. The checker enforces the CSS half of this.

## Sections

The page deliberately has no About section and no bio: a one-sentence bio
looked wrong in every placement tried, so it waits for a press kit and better
photos. Keep text out of the hero in any case: its
bare wordmark, tagline and icons are the appeal of the opening. Indie tech is
the genre Ryan is building toward. The bio sentence still opens the meta, Open
Graph and Twitter descriptions and the JSON-LD description, and the JSON-LD
genres are Indie Tech, Tech House and Indie Dance; change all of them together.
Before reviving an About section or a bio, read the memory note
`diffusion-page-section-decisions`, which records the placements already tried
and the parked `content/about` branch.

`#upcoming` and `#played` share one grid, so a show moves between them as a row
edit; `README.md` gives the steps and the date formats.

A flyer rail for Played is parked on the `played-rail` branch until enough gigs
have flyers to fill it, and Ryan wants it back then. Before reviving it, read
the memory note `diffusion-page-section-decisions`, which says how.

`#upcoming` stays on the page when nothing is booked: with no rows it is a
plain `sechead` over blank space, with no empty-state line, and the
`sechead--cols` header with its Location label comes back with the first row.
The HTML comment in the section shows both forms. Keep the section and its nav
link, and leave the space blank; never delete them or add a "nothing here"
message, because blank space is Ryan's chosen signal that nothing is booked.

A Played row's venue name links straight to the event's listing page in a
new tab. The link is proof the gig happened, not an attempt to sell a passed
date, so a faint underline is its only mark: no arrow, no "Tickets" hint. A row
with no listing keeps a plain span. The show dialogs that rows used to open
were removed on purpose; before bringing them back, read the memory note
`diffusion-page-section-decisions`.

Photos is a palette, modelled on moskomusic.com's photo section: every photo
visible at once, each shown whole at its own aspect ratio. The layout follows
the images' native sizes rather than fixed crops or hand-tuned columns, at
Ryan's request; the docstring of `js/photos.js` says how each row is solved.
The target row height is `--photo-row` in the stylesheet, per breakpoint. There
are no number captions on the photos.

A set cover's 1000px twin comes from the SoundCloud original, which can arrive
rotated on its side and then looks wrong only on a 2x screen. Follow "Add a
set" in `README.md`, and look at each finished twin.

## Hosting

Cloudflare holds the DNS and stays DNS-only. Proxying through Cloudflare would
add HTTP/3, Brotli and long browser caching, but GitHub's certificate
provisioning and renewal for the custom domain expects the records to point
at Pages directly, and a lapsed renewal behind a proxy breaks HTTPS for the
whole site. The ten-minute cache is the accepted price of not babysitting
that. When a caching complaint comes up, leave the records DNS-only; never turn
the proxy on to fix it.

Google Search Console has a Domain property for `diffusiondj.com` under Ryan's
Google account, verified by a `google-site-verification` TXT record on the zone
root at Cloudflare. Keep that record when tidying DNS; never delete it, because
it is what keeps the property verified.

## Wordmark animation

The centered title runs a noise-to-clarity diffusion animation built by clipping
noise to the letterforms and revealing three states through their own masks.
`css/site.css` ends with a `@media (prefers-reduced-motion: reduce)` block, and
that OS setting has twice been mistaken for the animation being broken. Check
it before debugging any animation here.

The entrance plays on phones too. The phone media query swaps the middle layer
to `#mark-noise-mid-sm` in `index.html`, a twin of `#mark-noise-mid` with every
absolute length halved (rounded to a whole number where needed) and the coarse
warp frequency doubled, so the tearing stays proportionate to 50px glyphs. The
checker fails if the two diverge. Verified at 375px and 320px in Playwright
only, never on phone hardware. To see a phone width, use Playwright's
`browser_resize`: the Chrome MCP's `resize_window` reports success but leaves
`innerWidth` unchanged on a maximized window.

Playwright's WebKit does not reproduce Safari's mask-plus-filter rendering.
Anything touching the wordmark's masks or filters must be checked in real
Safari; the memory note on the Safari testbed says how.

## Kept off the site

`docs/` and `.playwright-mcp/` are gitignored. Pages serves
whatever is in the branch, so tracking them would publish planning artifacts at
diffusiondj.com/docs/. This file lives at `.claude/CLAUDE.md` and there is no
`.nojekyll` for the same reason: Jekyll's pass is what keeps dot-directories
off the site (verified 2026-09-07 that with `.nojekyll` present Pages served
them; only `.github/` stays withheld). Keep the repository without a
`.nojekyll` file; never add one. The checker fails if it appears.
