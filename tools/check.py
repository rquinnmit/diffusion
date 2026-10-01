#!/usr/bin/env python3
"""Check the invariants that keep diffusiondj.com consistent.

The site has no build and no test suite; what it has is a handful of rules
that hold the hand-written files together, most of them written down in
CLAUDE.md and enforced until now by memory. This script reads index.html and
css/site.css with the standard library only and reports every rule it finds
broken, with a line number where one exists. It exits 1 on any finding so a
shell can gate on it.

Run from anywhere::

    python3 tools/check.py

Rules checked
-------------
- Every id is unique; every aria-controls and aria-labelledby resolves.
- A linked Played venue opens its listing in a new tab with rel=noopener.
- Every local file the page references exists, and every file under css/,
  js/, fonts/ and images/ is referenced somewhere (no orphans).
- Every img has alt and carries width and height; in the Photos grid those
  are the file's real pixel size, because js/photos.js lays out from them.
- Played rows are dated MON YYYY and run newest first.
- Upcoming has the Location header exactly when it has rows.
- The phone twin of the noise filter is the desktop filter with every length
  halved (to the nearest whole number) and its coarse warp frequency doubled.
- In the stylesheet, a selector's max-width blocks appear in descending
  order, and the only hex colours are the six tokens.
- CNAME names the domain and there is no .nojekyll (without Jekyll, Pages
  would serve .claude/CLAUDE.md).
"""
from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOMAIN = "diffusiondj.com"
MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
ASSET_DIRS = ("css", "js", "fonts", "images")

problems: list[str] = []


def flag(where: str, message: str) -> None:
    problems.append(f"{where}: {message}")


class Element:
    """One start tag: its name, attributes, line, and position in the tree."""

    def __init__(self, tag, attrs, line, parent):
        self.tag = tag
        self.attrs = dict(attrs)
        self.line = line
        self.parent = parent
        self.children: list[Element] = []
        self.text = ""

    def classes(self):
        return self.attrs.get("class", "").split()

    def has_class(self, name):
        return name in self.classes()

    def walk(self):
        yield self
        for child in self.children:
            yield from child.walk()

    def find_all(self, tag=None, cls=None):
        for el in self.walk():
            if tag and el.tag != tag:
                continue
            if cls and not el.has_class(cls):
                continue
            yield el

    def ancestor(self, cls):
        node = self.parent
        while node is not None:
            if node.has_class(cls):
                return node
            node = node.parent
        return None


class Tree(HTMLParser):
    """Build an Element tree from the page, ignoring comments."""

    VOID = {"meta", "link", "img", "br", "hr", "input", "source"}

    def __init__(self):
        super().__init__()
        self.root = Element("#root", [], 0, None)
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        el = Element(tag, attrs, self.getpos()[0], self.stack[-1])
        self.stack[-1].children.append(el)
        if tag not in self.VOID:
            self.stack.append(el)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        self.stack[-1].text += data


def load_tree(path: Path) -> Element:
    parser = Tree()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser.root


# ── html checks ──


def check_ids_and_refs(root: Element) -> None:
    seen: dict[str, int] = {}
    for el in root.walk():
        el_id = el.attrs.get("id")
        if el_id:
            if el_id in seen:
                flag(f"index.html:{el.line}", f"duplicate id {el_id!r} (first at line {seen[el_id]})")
            seen[el_id] = el.line
    for el in root.walk():
        for attr in ("aria-controls", "aria-labelledby"):
            target = el.attrs.get(attr)
            if target and target not in seen:
                flag(f"index.html:{el.line}", f"{attr}={target!r} matches no id")


def check_venue_links(root: Element) -> None:
    for link in root.find_all("a", cls="gig-venue"):
        where = f"index.html:{link.line}"
        if not link.attrs.get("href", "").startswith("https://"):
            flag(where, "venue link needs an https:// listing URL")
        if link.attrs.get("target") != "_blank" or link.attrs.get("rel") != "noopener":
            flag(where, 'venue link needs target="_blank" rel="noopener"')


def webp_size(path: Path):
    """Return (width, height) from a WebP file's header, or None."""
    data = path.read_bytes()[:30]
    if len(data) < 30 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    chunk = data[12:16]
    if chunk == b"VP8X":
        return 1 + int.from_bytes(data[24:27], "little"), 1 + int.from_bytes(data[27:30], "little")
    if chunk == b"VP8 ":
        return int.from_bytes(data[26:28], "little") & 0x3FFF, int.from_bytes(data[28:30], "little") & 0x3FFF
    if chunk == b"VP8L":
        bits = int.from_bytes(data[21:25], "little")
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    return None


def check_images(root: Element) -> None:
    for img in root.find_all("img"):
        where = f"index.html:{img.line}"
        if "alt" not in img.attrs:
            flag(where, "img without alt")
        if img.has_class("lightbox-img"):
            continue
        if not ("width" in img.attrs and "height" in img.attrs):
            flag(where, "img needs width and height")
            continue
        if img.ancestor("photo-grid") is None:
            continue
        path = ROOT / img.attrs.get("src", "")
        size = webp_size(path) if path.is_file() else None
        if size is None:
            flag(where, f"cannot read the size of {img.attrs.get('src')!r}; photos must be WebP")
        elif size != (int(img.attrs["width"]), int(img.attrs["height"])):
            flag(where, f"width/height must be the file's real size, {size[0]}x{size[1]}")


def parse_month_year(text: str):
    parts = text.strip().upper().split()
    if len(parts) != 2 or parts[0] not in MONTHS or not parts[1].isdigit():
        return None
    return int(parts[1]) * 12 + MONTHS.index(parts[0])


def check_gigs(root: Element) -> None:
    sections = {s.attrs.get("id"): s for s in root.find_all("section")}
    played = sections.get("played")
    if played is None:
        flag("index.html", "no #played section")
    else:
        previous = None
        for row in played.find_all(cls="gig"):
            date_el = next(row.find_all(cls="gig-date"), None)
            text = date_el.text if date_el else ""
            value = parse_month_year(text)
            if value is None:
                flag(f"index.html:{row.line}", f"played date {text.strip()!r} must be MON YYYY")
                continue
            if previous is not None and value > previous:
                flag(f"index.html:{row.line}", f"played rows must run newest first; {text.strip()!r} is out of order")
            previous = value
    upcoming = sections.get("upcoming")
    if upcoming is None:
        flag("index.html", "no #upcoming section (it stays even when empty)")
    else:
        rows = list(upcoming.find_all(cls="gig"))
        heads = list(upcoming.find_all(cls="sechead--cols"))
        if rows and not heads:
            flag(f"index.html:{upcoming.line}", "upcoming has rows, so its sechead needs sechead--cols")
        if heads and not rows:
            flag(f"index.html:{heads[0].line}", "upcoming has no rows, so drop sechead--cols and the Location label")
        for row in rows:
            if not row.has_class("gig--next"):
                flag(f"index.html:{row.line}", "upcoming row needs gig--next")


def local_refs(root: Element, css_text: str):
    """Yield (path, where) for every same-site file the page or stylesheet names."""
    for el in root.walk():
        for attr in ("src", "href", "data-src", "content", "srcset"):
            value = el.attrs.get(attr)
            if not value:
                continue
            for candidate in value.split(","):
                path = candidate.strip().split(" ")[0].replace(f"https://{DOMAIN}/", "")
                if path.startswith(ASSET_DIRS) and "://" not in path:
                    yield path, f"index.html:{el.line}"
    for match in re.finditer(r"url\((?:'|\")?\.\./([^'\")]+)", css_text):
        line = css_text.count("\n", 0, match.start()) + 1
        yield match.group(1), f"css/site.css:{line}"


def check_files(root: Element, css_text: str) -> None:
    referenced = set()
    for rel, where in local_refs(root, css_text):
        referenced.add(rel)
        if not (ROOT / rel).is_file():
            flag(where, f"references missing file {rel}")
    on_disk = {
        str(p.relative_to(ROOT))
        for d in ASSET_DIRS
        for p in (ROOT / d).rglob("*")
        if p.is_file() and not p.name.startswith(".")
    }
    for rel in sorted(on_disk - referenced):
        flag(rel, "not referenced from index.html or css/site.css")


def check_filter_twin(root: Element) -> None:
    filters = {f.attrs.get("id"): f for f in root.find_all("filter")}
    full, small = filters.get("mark-noise-mid"), filters.get("mark-noise-mid-sm")
    if full is None or small is None:
        flag("index.html", "both #mark-noise-mid and #mark-noise-mid-sm must exist")
        return
    a, b = full.children, small.children
    if [x.tag for x in a] != [x.tag for x in b]:
        flag(f"index.html:{small.line}", "twin filter has different primitives from #mark-noise-mid")
        return
    for x, y in zip(a, b):
        where = f"index.html:{y.line}"
        for attr in ("stddeviation", "scale"):
            if attr in x.attrs and not abs(float(y.attrs.get(attr, "nan")) - float(x.attrs[attr]) / 2) <= 0.5:
                flag(where, f"{attr} should be half of #mark-noise-mid's {x.attrs[attr]}")
        if x.tag == "feturbulence":
            ratio = 2 if x.attrs.get("result") == "coarse" else 1
            expected = float(x.attrs["basefrequency"]) * ratio
            if abs(float(y.attrs.get("basefrequency", "nan")) - expected) > 1e-9:
                flag(where, f"baseFrequency should be {expected:g}")


# ── css checks ──


def check_css(css_text: str) -> None:
    hexes = set(re.findall(r"#[0-9A-Fa-f]{3,8}\b", css_text))
    tokens = set(re.findall(r"--\w+:\s*(#[0-9A-Fa-f]{6})", css_text))
    for h in sorted(hexes - tokens):
        line = css_text.count("\n", 0, css_text.find(h)) + 1
        flag(f"css/site.css:{line}", f"hex colour {h} is not a palette token; use color-mix() of one")

    seen: dict[str, list[int]] = {}
    for match in re.finditer(r"@media \(max-width: (\d+)px\) \{(.*?)\n\}", css_text, re.S):
        width = int(match.group(1))
        line = css_text.count("\n", 0, match.start()) + 1
        for rule in re.finditer(r"^\s*([^\s{/][^{]*?)\s*\{", match.group(2), re.M):
            for selector in rule.group(1).split(","):
                widths = seen.setdefault(selector.strip(), [])
                if widths and widths[-1] < width:
                    flag(f"css/site.css:{line}", f"{selector.strip()!r} at {width}px comes after its {widths[-1]}px block; keep max-width blocks descending")
                widths.append(width)


def check_repo_files() -> None:
    cname = ROOT / "CNAME"
    if not cname.is_file() or cname.read_text().strip() != DOMAIN:
        flag("CNAME", f"must contain exactly {DOMAIN}")
    if (ROOT / ".nojekyll").is_file():
        flag(".nojekyll", "must not exist: without Jekyll, Pages serves .claude/CLAUDE.md")


def main() -> int:
    root = load_tree(ROOT / "index.html")
    css_text = (ROOT / "css" / "site.css").read_text(encoding="utf-8")
    check_ids_and_refs(root)
    check_venue_links(root)
    check_images(root)
    check_gigs(root)
    check_files(root, css_text)
    check_filter_twin(root)
    check_css(css_text)
    check_repo_files()
    if problems:
        print("\n".join(problems))
        print(f"{len(problems)} problem(s)")
        return 1
    print("ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
