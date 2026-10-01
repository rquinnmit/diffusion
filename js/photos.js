/**
 * Photo palette layout.
 *
 * Every photo in .photo-grid is shown whole, at its own aspect ratio, which is
 * read from the img's width and height attributes (tools/check.py holds those
 * to the file's real pixel size). A .shot-stack groups photos that sit one
 * above another in a single column. Photos and stacks fill rows in document
 * order, and each row is solved so its pieces share one height and span the
 * grid edge to edge, gaps included. A row closes when the next piece would
 * take its height further from the grid's --photo-row target, and a last row
 * left more than half again as tall as the target joins the row before it.
 *
 * Without this script the stylesheet's fallback shows the photos as a
 * wrapping strip at a fixed height, still uncropped.
 */
const grid = document.querySelector('.photo-grid');

function aspect(shot) {
    const img = shot.querySelector('img');
    return Number(img.getAttribute('width')) / Number(img.getAttribute('height'));
}

// A piece is one column of the row: a lone photo, or a stack. `depth` is the
// column's height per unit of width, gaps aside: the sum of 1/aspect.
function pieces() {
    return [...grid.children]
        .filter((el) => el.matches('.shot, .shot-stack'))
        .map((el) => {
            const shots = el.matches('.shot') ? [el] : [...el.querySelectorAll('.shot')];
            return { shots, depth: shots.reduce((sum, s) => sum + 1 / aspect(s), 0) };
        });
}

// The shared height that makes `row` exactly `width` wide. A stack of k photos
// is k - 1 gaps taller than its photos alone, so its column is narrower than
// height / depth by that much.
function rowHeight(row, width, gap) {
    const span = width - (row.length - 1) * gap;
    const stacked = row.reduce((sum, p) => sum + (p.shots.length - 1) / p.depth, 0);
    const reach = row.reduce((sum, p) => sum + 1 / p.depth, 0);
    return (span + gap * stacked) / reach;
}

function layout() {
    const width = grid.clientWidth;
    const style = getComputedStyle(grid);
    const gap = parseFloat(style.columnGap) || 0;
    const target = parseFloat(style.getPropertyValue('--photo-row'));

    const rows = [];
    let row = [];
    for (const piece of pieces()) {
        if (row.length) {
            const without = Math.abs(rowHeight(row, width, gap) - target);
            const withIt = Math.abs(rowHeight([...row, piece], width, gap) - target);
            if (withIt > without) {
                rows.push(row);
                row = [];
            }
        }
        row.push(piece);
    }
    if (row.length) rows.push(row);
    if (rows.length > 1 && rowHeight(rows.at(-1), width, gap) > target * 1.5) {
        rows.at(-2).push(...rows.pop());
    }

    let top = 0;
    for (const r of rows) {
        const height = rowHeight(r, width, gap);
        let left = 0;
        for (const piece of r) {
            const columnWidth = (height - (piece.shots.length - 1) * gap) / piece.depth;
            let y = top;
            for (const shot of piece.shots) {
                const h = columnWidth / aspect(shot);
                Object.assign(shot.style, {
                    left: `${left}px`, top: `${y}px`, width: `${columnWidth}px`, height: `${h}px`,
                });
                y += h + gap;
            }
            left += columnWidth + gap;
        }
        top += height + gap;
    }
    grid.style.height = `${Math.max(0, top - gap)}px`;
    grid.classList.add('is-laid');
}

if (grid) {
    let laidWidth = -1;
    new ResizeObserver(() => {
        // Setting the grid's height fires the observer again; only a change
        // of width needs a new layout.
        if (grid.clientWidth === laidWidth) return;
        laidWidth = grid.clientWidth;
        layout();
    }).observe(grid);
}
