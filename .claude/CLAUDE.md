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

Sections are `#upcoming`, `#sets`, `#photos`, `#played`, and `#booking` — there
is deliberately no About section and no bio on the page. A one-sentence bio was
tried in three placements and none looked natural, so it is off the page until
a press kit and better photos exist. Keep text out of the hero in any case: its
bare wordmark, tagline and icons are the appeal of the opening. Indie tech is
the genre Ryan is building toward. The bio sentence still opens the meta, Open
Graph and Twitter descriptions and the JSON-LD description, and the JSON-LD
genres are Indie Tech, Tech House and Indie Dance; change all of them together.
Before reviving an About section or a bio, read the memory note
`diffusion-page-section-decisions`, which records the placements already tried
and the parked `content/about` branch.

`#upcoming` and `#played` share one grid, so a show moves between them as a row
edit; `README.md` gives the steps and the date formats.

A flyer rail for Played is built and parked on the `played-rail` branch
(commit f0e5065): one card per show with the event's flyer at the Photos
height. It is off the page because too few gigs have flyers to fill a rail, and
Ryan wants it back once he has more gigs behind him. Before reviving it, read
the memory note `diffusion-page-section-decisions`: start from that commit
rather than rebuilding, and plan for the show panels its cards opened, which no
longer exist.

`#upcoming` stays on the page when nothing is booked: with no rows it is a
plain `sechead` over blank space, with no empty-state line, and the
`sechead--cols` header with its Location label comes back with the first row.
The HTML comment in the section shows both forms. Keep the section and its nav
link, and leave the space blank; never delete them or add a "nothing here"
message, because blank space is Ryan's chosen signal that nothing is booked.

A Played row's venue name links straight to the event's listing page in a
new tab. The link is proof the gig happened, not an attempt to sell a passed
date, so a faint underline is its only mark: no arrow, no "Tickets" hint. A row
with no listing keeps a plain span. Rows used to open show dialogs
(`js/shows.js`, `#show/<slug>` hashes), which were removed because no panel
ever held more than a title and a link; before bringing show panels back, read
the memory note `diffusion-page-section-decisions`.

Photos is a palette, modelled on moskomusic.com's photo section: every photo
visible at once, each shown whole at its own aspect ratio. The layout follows
the images' native sizes rather than fixed crops or hand-tuned columns, at
Ryan's request; the docstring of `js/photos.js` says how each row is solved.
The target row height is `--photo-row` in the stylesheet, per breakpoint. There
are no number captions on the photos. Shots open in a centered lightbox on
click (`js/lightbox.js`).

Set covers are `<name>.webp` at 500px, and where SoundCloud holds the artwork
at 1000px or more a `<name>-1000.webp` twin joined by `srcset`, so 2x desktop
screens get the sharp one and phones the small one. The twins are
centre-square crops of the SoundCloud originals: fetch the track page, take
its `-t500x500` artwork URL, swap in `-original`. That original is the camera's
own frame with the EXIF orientation stripped, so a phone photo arrives lying on
its side, and a twin left that way looks wrong only on a 2x screen. Rotate to
match the `-t500x500` render before cropping, and look at the finished twin.
Late Night Mix and R&B Mix exist only at 500px there; ship such a cover at
500px alone, and never upscale it to fake the twin.

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
