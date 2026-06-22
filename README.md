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
/portfolio.js                  Fetches data/portfolio.json, renders portfolio.html (both identities)
/writings.js                   Fetches data/writings.json, renders writings.html (both identities)
/data/portfolio.json           All portfolio entries (Lion + Láyon) — edit this to change the Portfolio page
/data/writings.json            All writing entries (Lion + Láyon) — edit this to change the Writings page
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

The flash colors match the identity backgrounds (`#fbfaf7` Lion, `#14131a` Láyon) and must stay in sync with `--bg` in `style.css`.

## Editing guidelines

- **Change Lion header (name, subtitle):** edit `components/lion-header.html` only.
- **Change Láyon header (name, subtitle):** edit `components/layon-header.html` only.
- **Add/change nav links:** edit `components/nav.html` only — it is shared across all pages.
- **Change styles:** edit `style.css`. Theme variables are in `:root` (Lion) and `body.layon` (Láyon).
- **Change toggle/flash behavior:** edit `nav.js`.
- **Update Lion bio/content:** edit the relevant page under `/` (root).
- **Update Láyon bio/content:** edit the relevant page under `/layon/`.
- **About pages** (`about.html` and `layon/about.html`) share the same narrative about being both identities. Keep them in sync.
- **Add/edit a portfolio entry:** edit `data/portfolio.json`. Each entry has `title`, `category` (groups entries under a heading), `persona` (`lion`, `layon`, or `both`), `summary`, and `links` (`repo`/`paper`/`slides`/`site`, set unused ones to `null`). `portfolio.js` renders both `portfolio.html` and `layon/portfolio.html` from this one file — no HTML editing needed.
- **Add/edit a writing entry:** edit `data/writings.json`. Each entry has `title`, `date` (`YYYY-MM-DD`), `persona` (`lion`, `layon`, or `both`), `tags` (array of free-form strings — the tag filter buttons are built from these automatically), `summary`, and `pdf` (a URL to a PDF, or `null` if there's nothing to link to yet). `writings.js` renders both `writings.html` and `layon/writings.html` from this one file.
- **No SEO:** no robots.txt, no sitemap, no canonical tags, no OG/Twitter meta, no JSON-LD. Keep it that way.
- **Update this README** whenever you add, remove, or rename pages or change how the nav/toggle/flash works.

## PDF files

Stored in `/cv/`. Referenced with a cache-busting query string (`?v=YYYYMMDD`). Update the version string in the HTML when replacing a PDF.
