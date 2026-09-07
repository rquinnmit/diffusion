# Diffusion

The site at [diffusiondj.com](https://diffusiondj.com): one page for Ryan
Quinn's DJ work as Diffusion. Hand-written HTML, CSS and JavaScript, no
build step, served by GitHub Pages straight from `main`.

This file explains how the pieces fit and how to make the routine edits.
`CLAUDE.md` records the design decisions and the rules behind them; read it
before changing how anything looks or behaves.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The page. Content lives here, with a template for each repeating block in an HTML comment beside it. |
| `css/site.css` | The one stylesheet, in page order. Each component's phone rules sit right after its desktop rules. |
| `js/dialog.js` | Opens and closes a `<dialog>` with a fade. Shared by the two below. |
| `js/shows.js` | Show panels: opens one from its Played row, mirrors it to `#show/<slug>`, loads embeds on first open. |
| `js/lightbox.js` | Enlarges a Photos rail shot in the `#lightbox` dialog. |
| `fonts/` | Self-hosted latin subsets of Archivo and JetBrains Mono (SIL Open Font License). |
| `images/` | `sets/` covers, `photos/` rail shots, `shows/<slug>/` photos for a show panel, the share card and the favicon. |
| `tools/check.py` | Checks the invariants below. Standard library only. |
| `CNAME`, `.nojekyll` | Bind the domain; tell Pages to publish the branch as-is. Never delete either. |

## Preview

Serve the directory over HTTP and open it; module scripts do not run from a
`file:` URL.

```
python3 -m http.server 8000
```

## Check

```
python3 tools/check.py
```

Prints `ok`, or one line per problem with a file and line, and exits 1. The
rules it checks are listed in its docstring. Run it after any edit to
`index.html` or `css/site.css`.

## Routine edits

Every repeating block in `index.html` has a template in an HTML comment
directly above or below the real entries. Copy the template, fill it in,
then run the checker.

**Book a show.** In `#upcoming`, give the header its `sechead--cols` form and
add a `gig gig--next` row linking to the ticket page, soonest first. The date
is the day (`AUG 29`).

**A show has passed.** Move its row to the top of `#played`, change the date
to month and year (`AUG 2026`), drop `gig--next` and the ticket line. If no
show remains upcoming, put the header back to its plain form; the section
itself stays.

**Give a played show a panel.** Turn the row's `gig-venue` span into a
`<button aria-controls="show-<slug>">`, add `gig--show` to the row, and add a
`<dialog class="show" id="show-<slug>">` after the rows using the template
there. Photos go under `images/shows/<slug>/`; video and audio are always
embeds with `data-src`, never local files.

**Add a set.** Add a `tile` to `.set-grid`, newest first, with a 500x500
WebP cover in `images/sets/`. Covers below the first row take
`loading="lazy"`.

**Add a photo.** Add a `figure.shot` to the rail with a WebP in
`images/photos/` and the next figcaption number. Portrait and landscape both
work.

Encode WebP with `cwebp -q 85 -m 6 -metadata none in.jpg -o out.webp`.

## Deploy

Push to `main`. GitHub Pages copies the branch; there is no build. Confirm
the deploy with:

```
gh api repos/rquinnmit/diffusion/pages/builds/latest --jq '{status,created_at,error}'
```
