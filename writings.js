(async function () {
  const list = document.getElementById('writings-list');
  if (!list) return;

  const bar = document.getElementById('tag-filters');
  const isLayon = window.location.pathname.includes('/layon/');
  const dataPath = isLayon ? '../data/writings-layon.json' : 'data/writings-lion.json';

  let visible = [];
  try {
    const res = await fetch(dataPath);
    visible = await res.json();
  } catch {
    list.innerHTML = '<p>Could not load writings entries. Make sure the site is served over HTTP.</p>';
    return;
  }

  visible.sort((a, b) => b.date.localeCompare(a.date));

  if (!visible.length) {
    list.innerHTML = '<p>Nothing here yet.</p>';
    return;
  }

  visible.forEach(entry => {
    const tags = Array.isArray(entry.tags) ? entry.tags : [];
    const d = new Date(entry.date + 'T00:00:00');
    const dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.tags = tags.join(' ');

    const header = document.createElement('div');
    header.className = 'card-header';

    const title = document.createElement('h3');
    title.textContent = entry.title;

    const date = document.createElement('span');
    date.className = 'card-date';
    date.textContent = dateStr;

    header.appendChild(title);
    header.appendChild(date);
    card.appendChild(header);

    if (tags.length) {
      const tagRow = document.createElement('p');
      tagRow.className = 'card-tags';
      tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = t;
        tagRow.appendChild(span);
      });
      card.appendChild(tagRow);
    }

    if (entry.summary) {
      const summary = document.createElement('p');
      summary.textContent = entry.summary;
      card.appendChild(summary);
    }

    if (entry.pdf) {
      const a = document.createElement('a');
      a.href = entry.pdf;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Read →';
      card.appendChild(a);
    }

    list.appendChild(card);
  });

  const tagSet = new Set(visible.flatMap(e => Array.isArray(e.tags) ? e.tags : []));
  if (!bar || tagSet.size === 0) return;

  const cards = list.querySelectorAll('.card');

  function makeBtn(label, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'tag-btn';
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onClick();
    });
    return btn;
  }

  const allBtn = makeBtn('All', () => cards.forEach(c => c.style.display = ''));
  allBtn.classList.add('active');
  bar.appendChild(allBtn);

  tagSet.forEach(tag => {
    bar.appendChild(makeBtn(tag, () => {
      cards.forEach(c => {
        c.style.display = c.dataset.tags.split(' ').includes(tag) ? '' : 'none';
      });
    }));
  });
})();
