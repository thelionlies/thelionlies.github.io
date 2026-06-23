(async function () {
  const list = document.getElementById('portfolio-list');
  if (!list) return;

  const bar = document.getElementById('tag-filters');
  const isLayon = window.location.pathname.includes('/layon/');
  const dataPath = isLayon ? '../data/portfolio-layon.json' : 'data/portfolio-lion.json';

  const linkLabels = { repo: 'Repo', paper: 'Paper', slides: 'Slides', site: 'Site', video: 'Video' };
  const typeLabels = { research: 'Research', software: 'Software', online: 'Online', print: 'Print' };

  let visible = [];
  try {
    const res = await fetch(dataPath);
    visible = await res.json();
  } catch {
    list.innerHTML = '<p>Could not load portfolio entries. Make sure the site is served over HTTP.</p>';
    return;
  }

  function buildCard(entry) {
    const tags = Array.isArray(entry.tags) ? entry.tags : [];

    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.tags = tags.join(' ');

    const title = document.createElement('h3');
    title.textContent = entry.title;
    card.appendChild(title);

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
      summary.textContent = entry.summary;
      card.appendChild(summary);
    }

    if (entry.thoughts) {
      const thoughtsLabel = document.createElement('p');
      thoughtsLabel.className = 'thoughts-label';
      thoughtsLabel.textContent = 'Reflection';
      card.appendChild(thoughtsLabel);

      const thoughtsText = document.createElement('p');
      thoughtsText.className = 'thoughts-text';
      thoughtsText.textContent = entry.thoughts;
      card.appendChild(thoughtsText);
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

    return card;
  }

  const featured = visible.filter(e => Array.isArray(e.tags) && e.tags.includes('featured'));
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

  const typeOrder = ['software', 'research', 'online', 'print'];

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

    byType.get(type).forEach(entry => group.appendChild(buildCard(entry)));

    list.appendChild(group);
  });

  const tagSet = new Set(visible.flatMap(e => Array.isArray(e.tags) ? e.tags : []));
  if (!bar || tagSet.size === 0) return;

  const groupEls = list.querySelectorAll('.portfolio-group');

  function applyFilter(tag) {
    if (featuredGroup) {
      featuredGroup.style.display = tag ? 'none' : '';
    }

    groupEls.forEach(group => {
      if (group === featuredGroup) return;
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

  if (tagSet.has('featured')) {
    bar.appendChild(makeBtn('Featured', 'featured'));
  }

  tagSet.forEach(tag => {
    if (tag === 'featured') return;
    bar.appendChild(makeBtn(tag, tag));
  });
})();
