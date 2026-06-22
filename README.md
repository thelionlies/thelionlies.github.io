# thelionlies.github.io

The personal website of Ivan Yuri "Lion" De Leon — AI safety researcher by day, Filipino poet by night, under the pen name **Láyon**. Two identities, one person, one site.

**Live:** https://thelionlies.github.io

This README is written for two audiences: people browsing the repo, and AI coding agents (like Claude) helping edit it. The first section explains what the site is; the section below that is reference material for anyone — human or agent — making changes.

## What's here

The site has two parallel sets of pages sharing one layout:

- **Lion** (`/`) — AI safety and Filipino NLP research: CV, portfolio, writings, about.
- **Láyon** (`/layon/`) — poetry written in Filipino, under the same five-page structure.

A toggle in the nav switches between the two, with a brief flash transition. Visually, Lion uses a light theme and Láyon a dark one — same layout and typography throughout, different palette and content.

It's a static site: plain HTML, CSS, and vanilla JavaScript. No build step, no framework, no server-side code. It's hosted directly on GitHub Pages.

---

## Reference for contributors and AI agents

### Structure

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

### Pages

Both identities have the same five tabs. Only content changes.

| Tab       | Lion (`/`)            | Láyon (`/layon/`)        |
|-----------|-----------------------|--------------------------|
| Home      | index.html            | index.html               |
| CV        | cv.html               | cv.html                  |
| Portfolio | portfolio.html        | portfolio.html           |
| Writings  | writings.html         | writings.html            |
| About     | about.html            | about.html               |

### How the toggle works

`nav.js` fetches `components/nav.html` and injects it into `<div id="nav-container">`.
On toggle change: a full-page flash div fades in (light → Lion, dark → Láyon), then navigates to the equivalent page in the other identity's folder.

The flash colors match the identity backgrounds (`#fbfaf7` Lion, `#14131a` Láyon) and must stay in sync with `--bg` in `style.css`.

### Editing guidelines

- **Change Lion header (name, subtitle):** edit `components/lion-header.html` only.
- **Change Láyon header (name, subtitle):** edit `components/layon-header.html` only.
- **Add/change nav links:** edit `components/nav.html` only — it is shared across all pages.
- **Change styles:** edit `style.css`. Theme variables (including `--accent`) are in `:root` (Lion) and `body.layon` (Láyon). Keep the two palettes in the same color family but with enough contrast for their own background.
- **Change toggle/flash behavior:** edit `nav.js`.
- **Update Lion bio/content:** edit the relevant page under `/` (root).
- **Update Láyon bio/content:** edit the relevant page under `/layon/`.
- **About pages** (`about.html` and `layon/about.html`) share the same narrative about being both identities, plus an FAQ section. Keep the FAQ questions mirrored across both pages — Lion answers straight, Láyon can be cheekier — and keep answers wrapped in `<ul class="dot-list"><li>...</li></ul>` to match the site's bullet style.
- **Add/edit a portfolio entry:** edit `data/portfolio.json`. Each entry has `title`, `category` (groups entries under a heading), `persona` (`lion`, `layon`, or `both`), `summary`, and `links` (`repo`/`paper`/`slides`/`site`, set unused ones to `null`). `portfolio.js` renders both `portfolio.html` and `layon/portfolio.html` from this one file — no HTML editing needed.
- **Add/edit a writing entry:** edit `data/writings.json`. Each entry has `title`, `date` (`YYYY-MM-DD`), `persona` (`lion`, `layon`, or `both`), `tags` (array of free-form strings — the tag filter buttons are built from these automatically), `summary`, and `pdf` (a URL to a PDF or a doc like a Google Drive link, or `null` if there's nothing to link to yet). `writings.js` renders both `writings.html` and `layon/writings.html` from this one file.
- **No SEO:** no robots.txt, no sitemap, no canonical tags, no OG/Twitter meta, no JSON-LD. Keep it that way.
- **Update this README** whenever you add, remove, or rename pages, or change how the nav/toggle/flash/data files work.

### PDF files

Stored in `/cv/`. Referenced with a cache-busting query string (`?v=YYYYMMDD`). Update the version string in the HTML when replacing a PDF.
