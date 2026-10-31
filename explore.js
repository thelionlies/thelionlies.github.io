(async function () {
const list = document.getElementById('explore-list');
if (!list) return;

const isLayon = window.location.pathname.includes('/layon/');
const dataPath = isLayon ? '../data/explore-layon.json' : 'data/explore-lion.json';

let entries = [];
try {
  const res = await fetch(dataPath);
  entries = await res.json();
} catch {
  list.innerHTML = '<p>Could not load entries. Make sure the site is served over HTTP.</p>';
  return;
}

entries.forEach(entry => {
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

  if (entry.url) {
    const row = document.createElement('div');
    row.className = 'card-links';
    const a = document.createElement('a');
    a.href = entry.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'link-btn';
    a.textContent = 'Open';
    row.appendChild(a);
    card.appendChild(row);
  }

  list.appendChild(card);
});
})();
