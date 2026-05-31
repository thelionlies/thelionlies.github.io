(async function () {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const isLayon = parts.includes('layon');
  const rawFile = parts[parts.length - 1] || '';
  const fileName = rawFile.includes('.') ? rawFile : 'index.html';

  const pageMap = {
    'index.html': 'home',
    'cv.html': 'cv',
    'portfolio.html': 'portfolio',
    'writings.html': 'writings',
    'about.html': 'about',
  };
  const currentPage = pageMap[fileName]
    || (parts.includes('writings') ? 'writings' : 'home');

  // Flash overlay
  const flash = document.createElement('div');
  flash.id = 'flash';
  document.body.appendChild(flash);

  const base = isLayon ? '../' : '';
  const headerFile = isLayon ? 'layon-header.html' : 'lion-header.html';

  // Fetch header and nav in parallel
  let headerHtml = '', navHtml = '';
  try {
    [headerHtml, navHtml] = await Promise.all([
      fetch(base + 'components/' + headerFile).then(r => r.text()),
      fetch(base + 'components/nav.html').then(r => r.text()),
    ]);
  } catch {
    // fail silently; page is still readable without injected components
  }

  const headerContainer = document.getElementById('header-container');
  if (headerContainer && headerHtml) {
    headerContainer.innerHTML = headerHtml;

    const navContainer = document.getElementById('nav-container');
    if (navContainer && navHtml) {
      navContainer.innerHTML = navHtml;

      const active = navContainer.querySelector(`[data-page="${currentPage}"]`);
      if (active) active.classList.add('active');

      const toggle = document.getElementById('personaToggle');
      if (toggle) {
        toggle.checked = isLayon;

        toggle.addEventListener('change', () => {
          const goingToLayon = toggle.checked;
          flash.style.background = goingToLayon ? '#0f1115' : '#fbfbf9';
          flash.classList.add('active');

          const targetUrl = isLayon ? `../${fileName}` : `layon/${fileName}`;
          setTimeout(() => { window.location.href = targetUrl; }, 260);
        });
      }
    }
  }

  if (isLayon) document.body.classList.add('layon');
})();
