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
/portfolio.js                  Fetches data/portfolio-{lion,layon}.json, renders portfolio.html for each identity
/writings.js                   Fetches data/writings-{lion,layon}.json, renders writings.html for each identity
/data/portfolio-lion.json      Lion's portfolio entries — edit this to change Lion's Portfolio page
/data/portfolio-layon.json     Láyon's portfolio entries — edit this to change Láyon's Portfolio page
/data/writings-lion.json       Lion's writing entries — edit this to change Lion's Writings page
/data/writings-layon.json      Láyon's writing entries — edit this to change Láyon's Writings page
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
- **Add/edit a portfolio entry:** edit `data/portfolio-lion.json` or `data/portfolio-layon.json` — each file is just that persona's entries, no `persona` field needed. Each entry has `title`, `type`, `tags`, `summary`, and `links` (keys like `repo`/`paper`/`slides`/`site`/`video`, set unused ones to `null` or omit them). Entries are grouped on the page by `type` and filterable across groups by `tags`. `portfolio.js` reads the matching file for whichever persona's `portfolio.html` is loaded — no HTML editing needed.
  - Lion's `type` is `"research"` or `"software"`. Tags are drawn from: `nlp`, `filipino`, `ai-safety`, `web`, `simulation`, `ai-engineering`, `graph-ml`, `big-data`, `featured`.
  - Láyon's `type` is `"online"` or `"print"`. Tags are drawn from: `poetry` (every entry gets this) and `series` (add it if the entry is a named series).
  - `translation` is optional on any entry (either persona) — an English rendering of the title, shown in italics under it. Mainly used for Láyon's Filipino titles; omit the field entirely if there's nothing to translate.
  - `thoughts` is optional on any entry — a personal reflection shown below the summary, labeled "Thoughts" and rendered in italic muted text. Omit the field if there's nothing to add.
  - The `featured` tag is special: entries tagged `featured` render twice — once in a "Featured" group at the very top of the page, and again in their normal `type` group. `featured` is also filterable like any other tag, and its filter button is pinned right after "All" in the filter bar instead of wherever it'd fall alphabetically/by insertion order.
- **Add/edit a writing entry:** edit `data/writings-lion.json` or `data/writings-layon.json` — each file is just that persona's entries. Each entry has `title`, `date` (`YYYY-MM-DD`), `tags` (array of free-form strings — the tag filter buttons are built from these automatically), `summary`, and `pdf` (a URL to a PDF or a doc like a Google Drive link, or `null` if there's nothing to link to yet). `writings.js` reads the matching file for whichever persona's `writings.html` is loaded.
- **No SEO:** no robots.txt, no sitemap, no canonical tags, no OG/Twitter meta, no JSON-LD. Keep it that way.
- **Update this README** whenever you add, remove, or rename pages, or change how the nav/toggle/flash/data files work.

### PDF files

Stored in `/cv/`. Referenced with a cache-busting query string (`?v=YYYYMMDD`). Update the version string in the HTML when replacing a PDF.
