# Diffusion — diffusiondj.com

Ryan's DJ site. He performs as Diffusion. Origin `rquinnmit/diffusion`, public,
default branch `main`, served by GitHub Pages on push at `https://diffusiondj.com`
(the `CNAME` file at the root is what binds the domain; never delete it). DNS
is at Cloudflare. The site lived at
`rquinnmit.github.io/music/` until 2026-09-05, and that path now redirects here,
preserving the hash (an old `#show/<slug>` link now just opens the page). The professional site links here; this site
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

Layout: `index.html` at the root; `css/site.css`; `js/dialog.js`, `js/photos.js`
and `js/lightbox.js` as ES modules; `fonts/` with the self-hosted latin woff2
files; images under `images/` (`sets/`, `photos/`, the OG card
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
token, never a new hex; the lightbox stays a native `<dialog>`, so do
not add a hand-rolled focus trap, `hidden`, `role="dialog"` or a body class
back. The checker enforces the CSS half of this.

## Sections

Sections are `#upcoming`, `#sets`, `#photos`, `#played`, and `#booking` — there
is deliberately no About section and no bio on the page. On 2026-10-01 Ryan
wrote one sentence, "Diffusion is a Boston-based DJ and MIT student playing
indie tech, a fusion of tech house and indie dance.", and tried it under the
wordmark, above the booking address, and as a Mosko-style `#about` section
after the hero (parked on the `content/about` branch, commit ac8f1ae, with
indie tech in the wordmark's heavy wide cut). None looked natural, so it came
off the page for now; he means to revisit once a press kit and better photos
exist. Keep text out of the hero in any case: its bare wordmark, tagline and
icons are the appeal of the opening. Indie tech is the genre he is building
toward. MIT came off the tagline on 2026-09-29. The sentence still opens the
meta, Open Graph and Twitter descriptions and the JSON-LD description, and
the JSON-LD genres are Indie Tech, Tech House and Indie Dance; change all of
them together.

`#upcoming` and `#played` share one grid, so a show moves between them by
editing its date and dropping `gig--next`. Upcoming rows are links to the ticket
page and carry a day-level date (`Aug 29`); played rows carry month and year
(`May 2026`). The row template lives in an HTML comment above the rows.

A flyer rail for Played is built and parked on the `played-rail` branch
(commit f0e5065): one card per show with the event's flyer at the Photos
height, opening the show panel, which leads with the flyer. Ryan shipped and
then withdrew it on 2026-09-24 because four gigs, two without flyers, do not
fill a rail; he wants it back once he has more gigs behind him. Revive it by
rebasing or cherry-picking that commit rather than rebuilding, and fetch
flyers for any shows played since. The show panels it opens were removed on
2026-10-01 (below), so a revival has to bring `js/shows.js` and the dialogs
back from that branch's history or link each card to its listing instead.

`#upcoming` stays on the page when nothing is booked. Ryan decided this on
2026-09-01: with no rows it is a plain `sechead` over blank space, with no
empty-state line, and the `sechead--cols` header with its Location label comes
back with the first row. The HTML comment in the section shows both forms.
Never delete the section or its nav link, and never add a "nothing here"
message; blank space is his chosen signal for that.

A Played row's venue name links straight to the event's listing page in a
new tab. Until 2026-10-01 it opened a show dialog (`js/shows.js`, `#show/<slug>`
hashes) meant to hold a recording, a video and photos from the night; none of
those ever arrived, so every panel was a title and a link, and Ryan had the
row link to the listing directly. The link is proof the gig happened, not an
attempt to sell a passed date, so a faint underline is its only mark: no
arrow, no "Tickets" hint. A row with no listing keeps a plain span.

Photos is a palette, modelled on moskomusic.com's photo section: every photo
visible at once, each shown whole at its own aspect ratio. Ryan asked on
2026-10-01 for the layout to follow the images' native sizes rather than
fixed crops or hand-tuned columns. `js/photos.js` reads each img's `width` and
`height` (the checker holds them to the file's real pixel size) and solves
each row so its pieces share a height and fill the measure; a `shot-stack`
puts photos one above another in a column, which is how two landscapes sit
beside a portrait. The target row height is `--photo-row` in the stylesheet,
per breakpoint. There are no number captions on the photos. Shots open in a
centered lightbox on click (`js/lightbox.js`).

Set covers are `<name>.webp` at 500px, and where SoundCloud holds the artwork
at 1000px or more a `<name>-1000.webp` twin joined by `srcset`, so 2x desktop
screens get the sharp one and phones the small one. The twins are
centre-square crops of the SoundCloud originals: fetch the track page, take
its `-t500x500` artwork URL, swap in `-original`. That original is the camera's
own frame with the EXIF orientation stripped, so a phone photo arrives lying on
its side; the Trap Mix and Party Set twins shipped rotated a quarter turn on
2026-09-07 and were only visible that way on a 2x screen. Rotate to match the
`-t500x500` render before cropping, and look at the finished twin. Late Night
Mix and R&B Mix exist only at 500px there. Never upscale a cover to fake the
twin. Photos are WebP too.

## Hosting

Cloudflare holds the DNS and stays DNS-only. Proxying through Cloudflare would
add HTTP/3, Brotli and long browser caching, but GitHub's certificate
provisioning and renewal for the custom domain expects the records to point
at Pages directly, and a lapsed renewal behind a proxy breaks HTTPS for the
whole site. Decided 2026-09-07: the ten-minute cache is the price of not
babysitting that. Do not turn the proxy on to fix a caching complaint.

Google Search Console has a Domain property for `diffusiondj.com` (added
2026-09-16 under Ryan's Google account), verified by a `google-site-verification`
TXT record on the zone root at Cloudflare. That record is what keeps the
property verified; never delete it when tidying DNS.

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
