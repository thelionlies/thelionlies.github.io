# thelionlies.github.io

The personal website of Ivan Yuri "Lion" De Leon — AI safety researcher by day, Filipino poet by night, under the pen name **Láyon**. Two identities, one person, one site.

**Live:** https://thelionlies.github.io

This README is written for two audiences: people browsing the repo, and AI coding agents (like Claude) helping edit it. The first section explains what the site is; the section below that is reference material for anyone — human or agent — making changes.

## What's here

The site has two parallel sets of pages sharing one layout:

- **Lion** (`/`) — AI safety and Filipino NLP research: work, explore, CV.
- **Láyon** (`/layon/`) — poetry written in Filipino, under the same four-tab structure, with an artist statement in place of a CV.

A toggle in the nav switches between the two, with a brief flash transition. Visually, Lion uses a light theme and Láyon a dark one — same layout and typography throughout, different palette and content.

It's a static site: plain HTML, CSS, and vanilla JavaScript. No build step, no framework, no server-side code. It's hosted directly on GitHub Pages.

---

## Reference for contributors and AI agents

### Structure

```
/                              Lion (AI Safety Researcher) — light theme
/layon/                        Láyon (Filipino Poet) — dark theme
/components/nav.html           Shared nav fragment (4 tabs + toggle)
/components/lion-header.html   Lion header: h1 + subtitle + nav slot
/components/layon-header.html  Láyon header: h1 + subtitle + nav slot
/nav.js                        Fetches header + nav, handles toggle + flash, adds footer
/style.css                     All styles; body.layon switches theme via CSS vars
/portfolio.js                  Fetches data/portfolio-{lion,layon}.json, renders work.html for each identity
/explore.js                    Fetches data/explore-{lion,layon}.json, renders explore.html for each identity
/data/portfolio-lion.json      Lion's work entries — edit this to change Lion's Work page
/data/portfolio-layon.json     Láyon's work entries — edit this to change Láyon's Work page
/data/explore-lion.json        Lion's explore entries — edit this to change Lion's Explore page
/data/explore-layon.json       Láyon's explore entries — edit this to change Láyon's Explore page
/cv/                           DE_LEON_Ivan_Yuri.pdf (Lion's CV), layon_cv.pdf (Láyon's artist statement)
/images/                       lion.jpg, layon.png
/404.html                      Shown by GitHub Pages for any missing URL; themes itself per identity
/sitemap.xml, /robots.txt      Search engine files (see SEO below)
/legacy/                       Retired pages, kept but unlinked (see Legacy below)
```

### Pages

Both identities have the same four tabs. Only content changes.

| Tab     | Lion (`/`)   | Láyon (`/layon/`) |
|---------|--------------|-------------------|
| Home    | index.html   | index.html        |
| Work    | work.html    | work.html         |
| Explore | explore.html | explore.html      |
| Bio     | cv.html      | cv.html           |

The Bio tab is deliberately named "Bio" rather than "CV" because the two pages differ: Lion's `cv.html` embeds a CV PDF, while Láyon's `cv.html` is the artist statement written out as HTML (with the PDF linked below it).

### How the toggle works

`nav.js` fetches `components/nav.html` and injects it into `<div id="nav-container">`.
On toggle change: a full-page flash div fades in (light → Lion, dark → Láyon), then navigates to the equivalent page in the other identity's folder.

The flash colors match the identity backgrounds (`#fbfaf7` Lion, `#14131a` Láyon) and must stay in sync with `--bg` in `style.css`.

The active tab is chosen from the file name. Only `/` and `/layon/` count as Home; an unknown page (like the 404) highlights no tab.

### Editing guidelines

- **Change Lion header (name, subtitle):** edit `components/lion-header.html` only.
- **Change Láyon header (name, subtitle):** edit `components/layon-header.html` only.
- **Add/change nav links:** edit `components/nav.html` — it is shared across all pages. Also update the `<noscript>` nav fallback inside `<header id="header-container">` on each live page, and `sitemap.xml`.
- **Change styles:** edit `style.css`. Theme variables (including `--accent`) are in `:root` (Lion) and `body.layon` (Láyon). Keep the two palettes in the same color family but with enough contrast for their own background.
- **Change toggle/flash behavior:** edit `nav.js`.
- **Update Lion bio/content:** edit the relevant page under `/` (root).
- **Update Láyon bio/content:** edit the relevant page under `/layon/`.
- **Láyon's artist statement** (`layon/cv.html`) is laid out as a dialogue: `p.lion-voice` sits in the left half, `p.layon-voice` in the right half, `p.both` runs full width, and a `div.pair` puts a Lion and a Láyon paragraph side by side. The halves hold on phones too. When the text changes, regenerate `cv/layon_cv.pdf` to match, bump its `?v=` string, and update the "Last updated" line.
- **Add/edit a work entry:** edit `data/portfolio-lion.json` or `data/portfolio-layon.json` — each file is just that persona's entries, no `persona` field needed. Each entry has `title`, `type`, `tags`, `summary`, and `links` (keys like `repo`/`paper`/`slides`/`site`/`video`, set unused ones to `null` or omit them). Entries are grouped on the page by `type`. `portfolio.js` reads the matching file for whichever persona's `work.html` is loaded — no HTML editing needed.
  - Lion's `type` is `"research"`, `"professional"`, or `"software"`. Tags currently in use: `filipino-nlp`, `ai-safety`, `ai-engineering`, `featured`.
  - Láyon's `type` is `"online"` or `"print"`. Tags are drawn from: `poetry` (every entry gets this), `series` (add it if the entry is a named series), and `featured`.
  - `translation` is optional on any entry (either persona) — an English rendering of the title, shown in italics under it. Mainly used for Láyon's Filipino titles; omit the field entirely if there's nothing to translate. An entry with a `translation` gets its title marked as Filipino (`lang="fil"`) automatically.
  - `lang` is optional — set it (e.g. `"fil"`) on an entry whose title is in Filipino but has no `translation`, so screen readers pronounce it correctly.
  - `thoughts` is optional on any entry — a personal reflection shown below the summary, labeled "Thoughts" and rendered in italic muted text. Omit the field if there's nothing to add.
  - The `featured` tag is special: entries tagged `featured` appear in a "Highlights" group, which is what the page opens on. The filter bar has two buttons, "Highlights" and "All"; "All" shows every entry grouped by `type`. The order of highlights is set by the `featuredOrder` list in `portfolio.js`; titles not in that list follow in file order. If no entry is `featured`, the page opens on "All".
- **Add/edit an explore entry:** edit `data/explore-lion.json` or `data/explore-layon.json`. Each entry has `title` and `summary`; `lang` is optional, as above.
- **Mark Filipino text:** pages are `lang="en"`, so wrap Filipino passages in an element with `lang="fil"` (the Láyon tagline and artist statement already do).
- **Update this README** whenever you add, remove, or rename pages, or change how the nav/toggle/flash/data files work.

### SEO

Each live page has a meta description, Open Graph and Twitter tags (for link previews when shared), and a canonical link. The preview image is the persona's portrait (`images/lion.jpg` or `images/layon.png`). When adding a page, copy these tags from a sibling page and change the title, description and URLs, then add the page to `sitemap.xml`. `robots.txt` keeps search engines out of `/legacy/`.

### Legacy

`/legacy/` holds retired pages: the old Portfolio, Projects, Writings and About pages for both identities (Láyon's under `/legacy/layon/`). They are not linked from anywhere, carry `noindex`, and are blocked in `robots.txt`. GitHub Pages is public, so they can still be opened by exact URL. Each has a `<base href>` so its styles and data still load from its new location. Their scripts and data (`projects.js`, `writings.js`, `data/projects-*.json`, `data/writings-*.json`) are kept at the root for them. Don't link to these pages; to bring one back, move it out of `/legacy/` and remove the `<base>` and `noindex` tags.

### PDF files

Stored in `/cv/`. Referenced with a cache-busting query string (`?v=YYYYMMDD`). Update the version string in the HTML when replacing a PDF.
