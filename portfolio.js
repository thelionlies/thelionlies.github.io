(async function () {
  const list = document.getElementById('portfolio-list');
  if (!list) return;

  const bar = document.getElementById('tag-filters');
  const isLayon = window.location.pathname.includes('/layon/');
  const dataPath = isLayon ? '../data/portfolio-layon.json' : 'data/portfolio-lion.json';

  const linkLabels = { repo: 'Repo', paper: 'Paper', slides: 'Slides', site: 'Site' };
  const typeLabels = { research: 'Research', software: 'Software', online: 'Online', print: 'Print' };

  let visible = [];
  try {
    const res = await fetch(dataPath);
    visible = await res.json();
  } catch {
    list.innerHTML = '<p>Could not load portfolio entries. Make sure the site is served over HTTP.</p>';
    return;
  }

  const types = [];
  const byType = new Map();
  visible.forEach(entry => {
    const type = entry.type || '';
    if (!byType.has(type)) {
      byType.set(type, []);
      types.push(type);
    }
    byType.get(type).push(entry);
  });

  types.forEach(type => {
    const group = document.createElement('section');
    group.className = 'portfolio-group';

    if (type) {
      const label = document.createElement('p');
      label.className = 'category-label';
      label.textContent = typeLabels[type] || type;
      group.appendChild(label);
    }

    byType.get(type).forEach(entry => {
      const tags = Array.isArray(entry.tags) ? entry.tags : [];

      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.tags = tags.join(' ');

      const title = document.createElement('h3');
      title.textContent = entry.title;
      card.appendChild(title);

      if (entry.translation) {
        const translation = document.createElement('p');
        translation.className = 'card-translation';
        translation.textContent = entry.translation;
        card.appendChild(translation);
      }

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

      group.appendChild(card);
    });

    list.appendChild(group);
  });

  const tagSet = new Set(visible.flatMap(e => Array.isArray(e.tags) ? e.tags : []));
  if (!bar || tagSet.size === 0) return;

  const groupEls = list.querySelectorAll('.portfolio-group');

  function applyFilter(tag) {
    groupEls.forEach(group => {
      let anyVisible = false;
      group.querySelectorAll('.card').forEach(card => {
        const match = !tag || card.dataset.tags.split(' ').includes(tag);
        card.style.display = match ? '' : 'none';
        if (match) anyVisible = true;
      });
      group.style.display = anyVisible ? '' : 'none';
    });
  }

  function makeBtn(label, tag) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'tag-btn';
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(tag);
    });
    return btn;
  }

  const allBtn = makeBtn('All', null);
  allBtn.classList.add('active');
  bar.appendChild(allBtn);

  tagSet.forEach(tag => {
    bar.appendChild(makeBtn(tag, tag));
  });
})();
