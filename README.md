# thelionlies.github.io

Personal site for Ivan Yuri "Lion" De Leon. Two identities, one person.

**Live:** https://thelionlies.github.io

---

## Structure

```
/                              Lion (AI Safety Researcher) — light theme
/layon/                        Láyon (Filipino Poet) — dark theme
/components/nav.html           Shared nav fragment (5 tabs + toggle)
/components/lion-header.html   Lion header: h1 + subtitle + nav slot
/components/layon-header.html  Láyon header: h1 + subtitle + nav slot
/nav.js                        Fetches header + nav, handles toggle + flash
/style.css                     All styles; body.layon switches theme via CSS vars
/_config.yml                   Jekyll config: collections, permalinks, defaults
/_layouts/writing.html         Layout for individual writing entry pages
/writings/lion/<name>/          Individual Lion writing pages (index.html per entry)
/writings/layon/<name>/        Individual Láyon writing pages (index.html per entry)
/data/lion-writings.json       Index of Lion writings — update when adding entries
/data/layon-writings.json      Index of Láyon writings — update when adding entries
/resources/lion/               PDFs referenced by Lion writing entries
/resources/layon/              PDFs referenced by Láyon writing entries
/cv/                           lion_cv.pdf, layon_cv.pdf
/images/                       lion.jpg, layon.png
```

## Pages

Both identities have the same five tabs. Only content changes.

| Tab       | Lion (`/`)            | Láyon (`/layon/`)        |
|-----------|-----------------------|--------------------------|
| Home      | index.html            | index.html               |
| CV        | cv.html               | cv.html                  |
| Portfolio | portfolio.html        | portfolio.html           |
| Writings  | writings.html         | writings.html            |
| About     | about.html            | about.html               |

## How the toggle works

`nav.js` fetches `components/nav.html` and injects it into `<div id="nav-container">`.
On toggle change: a full-page flash div fades in (white → Lion, black → Láyon), then navigates to the equivalent page in the other identity's folder.

The flash colors match the identity backgrounds (`#fbfbf9` Lion, `#0f1115` Láyon).

## Editing guidelines

- **Change Lion header (name, subtitle):** edit `components/lion-header.html` only.
- **Change Láyon header (name, subtitle):** edit `components/layon-header.html` only.
- **Add/change nav links:** edit `components/nav.html` only — it is shared across all pages.
- **Change styles:** edit `style.css`. Theme variables are in `:root` (Lion) and `body.layon` (Láyon).
- **Change toggle/flash behavior:** edit `nav.js`.
- **Update Lion bio/content:** edit the relevant page under `/` (root).
- **Update Láyon bio/content:** edit the relevant page under `/layon/`.
- **About pages** (`about.html` and `layon/about.html`) share the same narrative about being both identities. Keep them in sync.
- **Add a writing:** two steps:
  1. Create `writings/lion/your-slug/index.html` (or `writings/layon/`) using an existing page as template. Use `/style.css` and `/nav.js` (absolute paths).
  2. Add an entry to `data/lion-writings.json` (or `data/layon-writings.json`) with `title`, `date`, `tags`, and `url` matching the folder path.
- **PDF-backed writing:** put the PDF in `resources/lion/` and embed with `<iframe src="/resources/lion/yourfile.pdf" class="pdf-viewer" title="..."></iframe>` in the page HTML.
- **Add a Láyon writing:** same, but in `_layon_writings/`.
- **Tags:** free-form strings in front matter `tags: [tag1, tag2]`. The writings list page builds filter buttons from them automatically.
- **Writings pages** (`writings.html`, `layon/writings.html`) are currently placeholders.
- **No SEO:** no robots.txt, no sitemap, no canonical tags, no OG/Twitter meta, no JSON-LD. Keep it that way.
- **Update this README** whenever you add, remove, or rename pages or change how the nav/toggle/flash works.

## PDF files

Stored in `/cv/`. Referenced with a cache-busting query string (`?v=YYYYMMDD`). Update the version string in the HTML when replacing a PDF.
