(async function () {
const list = document.getElementById('portfolio-list');
if (!list) return;

const bar = document.getElementById('tag-filters');
const isLayon = window.location.pathname.includes('/layon/');
const dataPath = isLayon ? '../data/portfolio-layon.json' : 'data/portfolio-lion.json';

const linkLabels = { repo: 'Repo', paper: 'Paper', arxiv: 'arXiv', demo: 'Demo', slides: 'Slides', video: 'Video' };
const typeLabels = { research: 'Research', project: 'Project', online: 'Online', print: 'Print' };

let visible = [];
try {
const res = await fetch(dataPath);
visible = await res.json();
} catch {
list.innerHTML = '<p>Could not load portfolio entries. Make sure the site is served over HTTP.</p>';
return;
}

function slugify(text) {
return String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function buildCard(entry, canonical) {
const tags = Array.isArray(entry.tags) ? entry.tags : [];

const card = document.createElement('article');
card.className = 'card';
card.dataset.tags = tags.join(' ');

if (canonical) {
  const slug = entry.links && entry.links.link ? entry.links.link : entry.title;
  card.id = 'entry-' + slugify(slug);
}

const header = document.createElement('div');
header.className = 'card-header';

const title = document.createElement('h3');
title.textContent = entry.title;
header.appendChild(title);

if (tags.includes('featured')) {
  const badge = document.createElement('span');
  badge.className = 'featured-badge';
  badge.textContent = '★ Featured';
  header.appendChild(badge);
}

card.appendChild(header);

const visibleTags = tags.filter(t => t !== 'featured');
if (visibleTags.length) {
  const tagRow = document.createElement('p');
  tagRow.className = 'card-tags';
  visibleTags.forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = t;
    tagRow.appendChild(span);
  });
  card.appendChild(tagRow);
}

if (entry.translation) {
  const translation = document.createElement('p');
  translation.className = 'card-translation';
  translation.textContent = entry.translation;
  card.appendChild(translation);
}

if (entry.summary) {
  const summary = document.createElement('p');
  summary.className = 'card-summary';
  summary.appendChild(document.createTextNode(entry.summary + ' '));
  card.appendChild(summary);

  if (entry.description) {
    const moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.className = 'more-btn';
    moreBtn.textContent = 'More';
    summary.appendChild(moreBtn);

    const description = document.createElement('p');
    description.className = 'card-summary';
    description.hidden = true;
    description.appendChild(document.createTextNode(entry.description + ' '));
    card.appendChild(description);

    const lessBtn = document.createElement('button');
    lessBtn.type = 'button';
    lessBtn.className = 'more-btn';
    lessBtn.textContent = 'Less';
    description.appendChild(lessBtn);

    moreBtn.addEventListener('click', () => {
      description.hidden = false;
      moreBtn.hidden = true;
    });

    lessBtn.addEventListener('click', () => {
      description.hidden = true;
      moreBtn.hidden = false;
    });
  }
}

if (entry.reflection) {
  const reflectionLabel = document.createElement('p');
  reflectionLabel.className = 'card-label';
  reflectionLabel.textContent = 'Brief Reflection';
  card.appendChild(reflectionLabel);

  const reflectionText = document.createElement('p');
  reflectionText.className = 'thoughts-text';
  reflectionText.textContent = entry.reflection;
  card.appendChild(reflectionText);
}

const links = entry.links || {};
const linkEntries = Object.entries(links).filter(([key, url]) => key !== 'link' && url);
if (linkEntries.length) {
  const row = document.createElement('div');
  row.className = 'card-links';
  linkEntries.forEach(([key, url]) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'link-btn';
    a.textContent = linkLabels[key] || key;
    row.appendChild(a);
  });
  card.appendChild(row);
}

return card;

}

const featured = visible.filter(
e => Array.isArray(e.tags) && e.tags.includes('featured')
);

const featuredOrder = [
'Graph-Based Analysis of Customer-Merchant Payment Networks',
'PACUTE: Phonology-, Affix-, and Character-level Understanding of Tokens for Filipino',
'BEA: Blue Eagle Assistant',
'Volatility Modeling on the USD-PHP Exchange Rate using ARMA-GARCH Models',
'We Are Convinced That Persuasion is Linear and Bilingual in LLMs',
];

featured.sort((a, b) => {
const ai = featuredOrder.indexOf(a.title);
const bi = featuredOrder.indexOf(b.title);
return (ai === -1 ? featuredOrder.length : ai) - (bi === -1 ? featuredOrder.length : bi);
});

let featuredGroup = null;
if (featured.length) {
featuredGroup = document.createElement('section');
featuredGroup.className = 'portfolio-group featured-group';

const label = document.createElement('p');
label.className = 'category-label';
label.textContent = 'Featured';
featuredGroup.appendChild(label);

featured.forEach(entry => featuredGroup.appendChild(buildCard(entry)));
list.appendChild(featuredGroup);

}

const typeOrder = ['project', 'research', 'online', 'print'];

const types = [];
const byType = new Map();

visible
.forEach(entry => {
const type = entry.type || '';

  if (!byType.has(type)) {
    byType.set(type, []);
    types.push(type);
  }

  byType.get(type).push(entry);
});

const orderOf = type => {
const i = typeOrder.indexOf(type);
return i === -1 ? typeOrder.length : i;
};

types.sort((a, b) => orderOf(a) - orderOf(b));

types.forEach(type => {
const group = document.createElement('section');
group.className = 'portfolio-group';

if (type) {
  const label = document.createElement('p');
  label.className = 'category-label';
  label.textContent = typeLabels[type] || type;
  group.appendChild(label);
}

byType.get(type).forEach(entry => group.appendChild(buildCard(entry, true)));
list.appendChild(group);

});

const tagSet = new Set(
visible.flatMap(e => Array.isArray(e.tags) ? e.tags : [])
);
tagSet.delete('featured');

if (!bar) return;

const groupEls = list.querySelectorAll('.portfolio-group');
const defaultTag = featuredGroup ? 'featured' : 'all';

function applyFilter(tag) {
const showFeatured = tag === 'featured';

if (featuredGroup) {
featuredGroup.style.display = showFeatured ? '' : 'none';
}

groupEls.forEach(group => {
  if (group === featuredGroup) return;

  if (showFeatured) {
    group.style.display = 'none';
    return;
  }

  let anyVisible = false;

  group.querySelectorAll('.card').forEach(card => {
    const cardTags = card.dataset.tags.split(' ');
    const match = tag === 'all' ? true : cardTags.includes(tag);
    card.style.display = match ? '' : 'none';
    if (match) anyVisible = true;
  });

  group.style.display = anyVisible ? '' : 'none';
});

}

function selectTag(tag) {
bar.querySelectorAll('.tag-btn').forEach(b => b.classList.toggle('active', b.dataset.tag === tag));
applyFilter(tag);
}

function makeBtn(label, tag) {
const btn = document.createElement('button');
btn.textContent = label;
btn.className = 'tag-btn';
btn.dataset.tag = tag;

btn.addEventListener('click', () => {
  if (window.location.hash === '#' + tag) {
    selectTag(tag);
  } else {
    window.location.hash = tag;
  }
});

return btn;

}

if (featuredGroup) {
const featuredBtn = makeBtn('Featured', 'featured');
bar.appendChild(featuredBtn);
}

const allBtn = makeBtn('All', 'all');
bar.appendChild(allBtn);

const tagPriority = ['ai-safety', 'filipino-nlp', 'ai-engineering', 'finance-economics'];

const orderedTags = [...tagSet].sort((a, b) => {
const ai = tagPriority.indexOf(a);
const bi = tagPriority.indexOf(b);
const aRank = ai === -1 ? tagPriority.length : ai;
const bRank = bi === -1 ? tagPriority.length : bi;
if (aRank !== bRank) return aRank - bRank;
return a.localeCompare(b);
});

orderedTags.forEach(tag => {
bar.appendChild(makeBtn(tag, tag));
});

const validTags = new Set(['all', ...orderedTags]);
if (featuredGroup) validTags.add('featured');

function handleHash() {
const raw = window.location.hash.replace(/^#/, '');

if (!raw) {
  selectTag(defaultTag);
  return;
}

if (validTags.has(raw)) {
  selectTag(raw);
  return;
}

const target = document.getElementById('entry-' + slugify(raw));
if (!target) {
  selectTag(defaultTag);
  return;
}

selectTag('all');

const group = target.closest('.portfolio-group');
if (group) group.style.display = '';
target.style.display = '';

target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.addEventListener('hashchange', handleHash);

handleHash();
})();