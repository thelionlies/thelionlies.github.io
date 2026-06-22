(async function () {
  const list = document.getElementById('portfolio-list');
  if (!list) return;

  const isLayon = window.location.pathname.includes('/layon/');
  const persona = isLayon ? 'layon' : 'lion';
  const dataPath = isLayon ? '../data/portfolio.json' : 'data/portfolio.json';

  const linkLabels = { repo: 'Repo', paper: 'Paper', slides: 'Slides', site: 'Site' };

  let entries = [];
  try {
    const res = await fetch(dataPath);
    entries = await res.json();
  } catch {
    list.innerHTML = '<p>Could not load portfolio entries. Make sure the site is served over HTTP.</p>';
    return;
  }

  const visible = entries.filter(e => e.persona === persona || e.persona === 'both');

  const categories = [];
  const byCategory = new Map();
  visible.forEach(entry => {
    const cat = entry.category || '';
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
      categories.push(cat);
    }
    byCategory.get(cat).push(entry);
  });

  categories.forEach(cat => {
    if (cat) {
      const label = document.createElement('p');
      label.className = 'category-label';
      label.textContent = cat;
      list.appendChild(label);
    }

    byCategory.get(cat).forEach(entry => {
      const card = document.createElement('article');
      card.className = 'card';

      const title = document.createElement('h3');
      title.textContent = entry.title;
      card.appendChild(title);

      if (entry.summary) {
        const summary = document.createElement('p');
        summary.className = 'card-summary';
        summary.textContent = entry.summary;
        card.appendChild(summary);
      }

      const links = entry.links || {};
      const linkEntries = Object.entries(links).filter(([, url]) => url);
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

      list.appendChild(card);
    });
  });
})();
