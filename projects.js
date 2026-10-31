(async function () {
const list = document.getElementById('projects-list');
if (!list) return;

const isLayon = window.location.pathname.includes('/layon/');
const dataPath = isLayon ? '../data/projects-layon.json' : 'data/projects-lion.json';

const linkLabels = { repo: 'Repo', paper: 'Notes', arxiv: 'arXiv', demo: 'Demo', slides: 'Slides', video: 'Video', site: 'Site' };
const typeLabels = { project: 'Software', notes: 'Notes' };

let entries = [];
try {
  const res = await fetch(dataPath);
  entries = await res.json();
} catch {
  list.innerHTML = '<p>Could not load entries. Make sure the site is served over HTTP.</p>';
  return;
}

const byType = new Map();
entries.forEach(entry => {
  const type = entry.type || '';
  if (!byType.has(type)) byType.set(type, []);
  byType.get(type).push(entry);
});

byType.forEach((items, type) => {
  const group = document.createElement('section');
  group.className = 'portfolio-group';

  if (type) {
    const label = document.createElement('p');
    label.className = 'category-label';
    label.textContent = typeLabels[type] || type;
    group.appendChild(label);
  }

  items.forEach(entry => {
    const card = document.createElement('article');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = entry.title;
    card.appendChild(title);

    if (entry.summary) {
      const summary = document.createElement('p');
      summary.className = 'card-summary';
      summary.appendChild(document.createTextNode(entry.summary + ' '));

      if (entry.description) {
        const moreBtn = document.createElement('button');
        moreBtn.type = 'button';
        moreBtn.className = 'more-btn';
        moreBtn.textContent = 'More';
        summary.appendChild(moreBtn);

        const description = document.createElement('p');
        description.className = 'card-summary';
        description.hidden = true;
        description.textContent = entry.description;
        card.appendChild(description);

        moreBtn.addEventListener('click', () => {
          description.hidden = false;
          moreBtn.hidden = true;
        });
      }

      card.appendChild(summary);
    }

    const links = entry.links || {};
    const linkEntries = Object.entries(links).filter(([key, url]) => url);
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

    group.appendChild(card);
  });

  list.appendChild(group);
});
})();
