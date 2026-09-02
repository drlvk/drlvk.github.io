# MAT 284 lecture notes

Static HTML lecture notes. No build step — edit a file, commit, push.

## Files

| File | What it is |
|---|---|
| `notes.css` | Shared stylesheet. Colors, type, and every layout pattern. |
| `notes.js` | Shared behavior: MathJax config, collapsible solutions, print handling. |
| `_template.html` | Starting point for a new lecture, with one example of each pattern. |
| `favicon.svg` | Tab icon: an integral sign in pen red. Carries its own dark-mode variant. |
| `favicon.ico` | Same mark at 16/32/48 px, for browsers that don't take SVG icons. |
| `apple-touch-icon.png` | 180×180, full bleed, for iOS home screens. |

Every `href` in these pages is relative, which is what makes the site work at
`user.github.io/repo/` as well as at a domain root. Don't switch the icon links
to `/favicon.svg` — on a project site that resolves to the wrong place.
| `mat284-aug24-section-1-1-part-1.html` | Aug 24 — Linear equations and interval notation |
| `mat284-aug26-section-1-1-part-2.html` | Aug 26 — Linear inequalities and applications |
| `mat284-aug28-section-1-1-part-3.html` | Aug 28 — More applications of linear equations and inequalities |
| `mat284-aug31-section-a-7.html` | Aug 31 — Quadratic equations (Appendix A.7) |
| `mat284-sep02-section-1-2-part-1.html` | Sep 2 — Graphs and lines |

## Adding a lecture

Copy `_template.html`, rename it `mat284-MONTHDAY-topic.html`, and fill in the
masthead, the `<nav>` links, and the sections. The six lines in the `<head>` —
three icon links, the stylesheet, and the two scripts — stay as they are.

Three rules that are easy to break:

1. **Every `<details class="sol">` needs the `open` attribute in the markup.**
   `notes.js` collapses them after MathJax typesets. Solutions that start
   closed get measured while hidden, and the math can render at the wrong size.
2. **Don't use `$` as a math delimiter.** These notes are full of dollar
   amounts. Inline math is `\( ... \)`, display math is `\[ ... \]`.
3. **A `<li>` in a `.ledger` holds exactly two spans, `.step` and `.work`.**
   The ledger is a CSS grid, so a stray word or a third element becomes its own
   grid item and wraps into the narrow step column. Anything extra goes inside
   `.work`. (`.checklist` used to have the same trap and no longer does.)

## Figures

Diagrams are inline SVG inside a `<figure class="fig">`, with a `<figcaption>`:

```html
<figure class="fig">
  <svg viewBox="0 0 380 270" role="img" aria-label="Describe the picture">
    <path class="axis" d="..."/>
    <path class="curve" d="..."/>
    <circle class="dot" cx="270" cy="95" r="4.2"/>
    <text class="label-key" x="280" y="86">(5, 2)</text>
  </svg>
  <figcaption>What the picture shows.</figcaption>
</figure>
```

Two rules here as well:

1. **Never put a `fill` or `stroke` attribute in the markup.** Use the classes
   in section 9 of `notes.css` — `axis`, `grid`, `curve`, `curve-2`, `helper`,
   `dot`, `mark`, `label`, `label-soft`, `label-key`. That is what keeps figures
   on the palette and working in dark mode.
2. **Give the `<svg>` a `viewBox` and no `width` or `height`.** It scales to the
   text column. A portrait figure also wants `class="fig fig-narrow"`, or a tall
   viewBox will stretch to the full column width.

Stroke widths are in user units, so keep every figure's `viewBox` on roughly
the same scale or the line weights won't match between figures.

An `aria-label` on the `<svg>` is not optional. It is the only thing a screen
reader gets, and the `figcaption` should carry the point of the picture rather
than just naming it.

## Changing the design

Edit `notes.css`. The palette and type scale are in the `:root` block at the
top; nothing below it hardcodes a color.

Every text color clears WCAG AAA (7:1) against both the page background and the
white cards. If you swap a color, check the new ratio before committing —
students read this on phones in bad light.

## Cache

GitHub Pages serves CSS with a long cache lifetime, so students who have
already loaded a page may keep the old stylesheet after you edit it. If a
design change needs to reach them immediately, bump a version string in every
page:

```html
<link rel="stylesheet" href="notes.css?v=2">
```

## External dependencies

MathJax loads from cdnjs and the fonts from Google Fonts, both over https. On a
network that blocks either, the page still reads — the math falls back to raw
TeX and the type falls back to Georgia and Arial Narrow.
