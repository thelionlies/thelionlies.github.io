(async function () {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const isLayon = parts.includes('layon');
  const inWritings = parts.includes('writings');
  const rawFile = parts[parts.length - 1] || '';
  const fileName = rawFile.includes('.') ? rawFile : 'index.html';

  const pageMap = {
    'index.html': 'home',
    'cv.html': 'cv',
    'portfolio.html': 'portfolio',
    'writings.html': 'writings',
    'about.html': 'about',
  };
  const currentPage = inWritings ? 'writings' : (pageMap[fileName] || 'home');

  const accent = isLayon ? '%238a9bb8' : '%233d4f66';
  const outerSquare = `<rect x='2' y='2' width='20' height='20' fill='none' stroke='${accent}' stroke-width='1.5'/>`;
  const mark = isLayon
    ? `<rect x='12' y='2' width='10' height='10' fill='${accent}'/>`
    : `<path d='M2,2 L12,2 L12,12 L22,12 L22,22 L2,22 Z' fill='${accent}'/>`;
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>${outerSquare}${mark}</svg>`;
  document.head.appendChild(favicon);

  const flash = document.createElement('div');
  flash.id = 'flash';
  document.body.appendChild(flash);

  const headerFile = isLayon ? 'layon-header.html' : 'lion-header.html';

  let headerHtml = '', navHtml = '';
  try {
    [headerHtml, navHtml] = await Promise.all([
      fetch('/components/' + headerFile).then(r => r.text()),
      fetch('/components/nav.html').then(r => r.text()),
    ]);
  } catch {
    // fail silently
  }

  const headerContainer = document.getElementById('header-container');
  if (headerContainer && headerHtml) {
    headerContainer.innerHTML = headerHtml;

    const navContainer = document.getElementById('nav-container');
    if (navContainer && navHtml) {
      navContainer.innerHTML = navHtml;

      // Set absolute hrefs so links work at any folder depth
      const navBase = isLayon ? '/layon/' : '/';
      navContainer.querySelectorAll('a[data-page]').forEach(link => {
        const page = link.dataset.page;
        link.href = navBase + (page === 'home' ? 'index.html' : page + '.html');
      });

      const active = navContainer.querySelector(`[data-page="${currentPage}"]`);
      if (active) active.classList.add('active');

      const toggle = document.getElementById('personaToggle');
      if (toggle) {
        toggle.checked = isLayon;

        toggle.addEventListener('change', () => {
          const goingToLayon = toggle.checked;
          flash.style.background = goingToLayon ? '#14131a' : '#fbfaf7';
          flash.classList.add('active');
          sessionStorage.setItem('personaToggled', '1');

          let targetUrl;
          if (inWritings) {
            targetUrl = goingToLayon ? '/layon/writings.html' : '/writings.html';
          } else {
            targetUrl = isLayon ? `../${fileName}` : `layon/${fileName}`;
          }

          setTimeout(() => { window.location.href = targetUrl; }, 260);
        });
      }
    }
  }

  if (isLayon) document.body.classList.add('layon');

  if (sessionStorage.getItem('personaToggled')) {
    sessionStorage.removeItem('personaToggled');

    const message = isLayon
      ? "You're now viewing the artist profile. Switch back to light mode anytime to explore Lion's research and professional background."
      : "You're now viewing the professional profile. Switch back to dark mode anytime to explore Láyon's artist profile.";

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    };

    toast.addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  }
})();
