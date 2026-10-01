# Diffusion

The site at [diffusiondj.com](https://diffusiondj.com): one page for Ryan
Quinn's DJ work as Diffusion. Hand-written HTML, CSS and JavaScript, no
build step, served by GitHub Pages straight from `main`.

This file explains how the pieces fit and how to make the routine edits.
`.claude/CLAUDE.md` records the design decisions and the rules behind them;
read it before changing how anything looks or behaves.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The page. Content lives here, with a template for each repeating block in an HTML comment beside it. |
| `css/site.css` | The one stylesheet, in page order. Each component's phone rules sit right after its desktop rules. |
| `js/dialog.js` | Opens and closes a `<dialog>` with a fade. Used by the lightbox. |
| `js/photos.js` | Lays out the Photos palette from each image's own width and height. |
| `js/lightbox.js` | Enlarges a photo in the `#lightbox` dialog. |
| `fonts/` | Self-hosted latin subsets of Archivo and JetBrains Mono (SIL Open Font License). |
| `images/` | `sets/` covers, `photos/` for the Photos palette, the share card and the favicon. |
| `tools/check.py` | Checks the invariants below. Standard library only. |
| `CNAME` | Binds the domain. Never delete it. |

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
`index.html` or `css/site.css`. A GitHub Action runs it on every push as well
and marks the commit, though it cannot stop Pages publishing a commit that
fails.

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

**Link a played show.** Make the row's `gig-venue` an
`<a href="LISTING URL" target="_blank" rel="noopener">` pointing at the
event's listing page, as in the template above the rows.

**Add a set.** Add a `tile` to `.set-grid`, newest first, with the cover in
`images/sets/` as `<name>.webp` at 500px and, when the SoundCloud original is
1000px or more, `<name>-1000.webp` named in the tile's `srcset` (see the
comment in the grid). Covers below the first row take `loading="lazy"`.

**Add a photo.** Add a `figure.shot` to `.photo-grid` with a WebP in
`images/photos/`, giving the img the file's real `width` and `height` (the
checker compares them). Portrait and landscape both work; the layout sizes
every photo from those numbers. Wrap two photos in a `div.shot-stack` to stack
them in one column.

Encode WebP with `cwebp -q 85 -m 6 -metadata none in.jpg -o out.webp`.

## Deploy

Push to `main`. GitHub Pages runs its Jekyll pass, which is what keeps
`.claude/` off the site, and takes under a minute. Confirm the deploy with:

```
gh api repos/rquinnmit/diffusion/pages/builds/latest --jq '{status,created_at,error}'
```
