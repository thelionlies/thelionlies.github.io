// Builds the header, nav and footer synchronously (no fetch), so the page
// paints in its final layout. Pages load this with blocking="render".
(function () {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const isLayon = parts.includes('layon');
  const inWritings = parts.includes('writings');
  const rawFile = parts[parts.length - 1] || '';
  const fileName = rawFile.includes('.') ? rawFile
    : (!rawFile || rawFile === 'layon') ? 'index.html'
    : rawFile + '.html';

  const pageMap = {
    'index.html': 'home',
    'cv.html': 'cv',
    'work.html': 'work',
    'explore.html': 'explore',
    'writings.html': 'writings',
    'about.html': 'about',
  };
  const currentPage = inWritings ? 'writings' : pageMap[fileName];

  // The two personas are exact counterparts: same fields, same places on the page
  const personas = {
    lion: {
      name: 'Lion De Leon', role: 'AI Safety Researcher', accent: '#3d4f66',
      mark: `<path d="M2,2 L12,2 L12,12 L22,12 L22,22 L2,22 Z" fill="currentColor"/>`,
    },
    layon: {
      name: 'Láyon', role: 'Filipino Poet', accent: '#8a9bb8',
      mark: `<rect x="12" y="2" width="10" height="10" fill="currentColor"/>`,
    },
  };
  const persona = isLayon ? personas.layon : personas.lion;
  const other = isLayon ? personas.lion : personas.layon;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tabs = [['home', 'Home'], ['work', 'Work'], ['explore', 'Explore'], ['cv', 'Bio']];
  const navBase = isLayon ? '/layon/' : '/';

  // Favicon
  const favMark = persona.mark.replace(/"/g, "'").replace('currentColor', persona.accent.replace('#', '%23'));
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' fill='none' stroke='${persona.accent.replace('#', '%23')}' stroke-width='1.5'/>${favMark}</svg>`;
  document.head.appendChild(favicon);

  // Header + nav
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    const links = tabs.map(([page, label]) => {
      const href = navBase + (page === 'home' ? 'index.html' : page + '.html');
      const cls = page === currentPage ? ' class="active"' : '';
      return `<a data-page="${page}" href="${href}"${cls}>${label}</a>`;
    }).join('\n    ');

    headerContainer.innerHTML = `
<div class="brand">
  <svg class="logo" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
    ${persona.mark}
  </svg>
  <h1>${persona.name}</h1>
</div>
<p class="profile-type">${persona.role}</p>
<div id="nav-container">
  <nav>
    ${links}
    <label class="switch" title="Switch to ${isLayon ? 'Lion' : 'Láyon'}">
      <input type="checkbox" id="personaToggle"${isLayon ? ' checked' : ''}>
      <span class="slider round"></span>
    </label>
  </nav>
</div>`;
  }

  if (isLayon) document.body.classList.add('layon');

  // Persona toggle: pages cross-fade (cross-document view transition, see style.css)
  // while the text transforms; browsers without view transitions get a flash.
  const morphs = 'onpagereveal' in window && !reduceMotion;
  const flash = document.createElement('div');
  flash.id = 'flash';
  document.body.appendChild(flash);

  const toggle = document.getElementById('personaToggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      const goingToLayon = toggle.checked;
      try {
        sessionStorage.setItem('personaToggled', '1');
        sessionStorage.setItem('bgMorph', goingToLayon ? 'toLayon' : 'toLion');
      } catch {}

      let targetUrl;
      if (inWritings) {
        targetUrl = goingToLayon ? '/layon/writings.html' : '/writings.html';
      } else {
        targetUrl = isLayon ? `../${fileName}` : `layon/${fileName}`;
      }

      if (morphs) {
        window.location.href = targetUrl;
      } else {
        flash.style.background = goingToLayon ? '#1f1e25' : '#f3efe7';
        flash.classList.add('active');
        setTimeout(() => { window.location.href = targetUrl; }, 260);
      }
    });
  }

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `<p class="layon-hint">© 2026 ${isLayon ? 'Láyon' : 'Ivan Yuri De Leon'}. All rights reserved.</p>`;
  document.body.appendChild(footer);

  // Easter egg: hovering the portrait shakes the page, flashes the other
  // persona's portrait and nudges the toggle halfway, a hint at the alter ego
  const portraitSwitch = document.querySelector('.portrait-switch');
  const switchLabel = document.querySelector('.switch');
  if (portraitSwitch && switchLabel) {
    const cover = portraitSwitch.querySelector('.portrait-cover');
    const reveal = portraitSwitch.querySelector('.portrait-reveal');
    let active = false;

    const triggerHint = () => {
      if (active) return;
      active = true;
      switchLabel.classList.add('half');
      document.body.classList.add('shaking');
      setTimeout(() => document.body.classList.remove('shaking'), 500);
      reveal.style.opacity = 1;
      cover.style.opacity = 0;
      setTimeout(() => { cover.style.opacity = 1; }, 140);
      setTimeout(() => { reveal.style.opacity = 0; switchLabel.classList.remove('half'); active = false; }, 280);
    };

    portraitSwitch.addEventListener('mouseenter', triggerHint);

    portraitSwitch.addEventListener('mouseleave', () => {
      active = false;
      cover.style.opacity = 1;
      reveal.style.opacity = 0;
      switchLabel.classList.remove('half');
    });
  }

  let toggled = false;
  try {
    toggled = !!sessionStorage.getItem('personaToggled');
    sessionStorage.removeItem('personaToggled');
  } catch {}

  // Transformation: text rewrites itself letter by letter from one version to another
  const GLYPHS = 'abcdefghijklmnopqrstuvwxyzáéíóú';
  function transform(el, from, to, duration = 900) {
    if (reduceMotion) { el.textContent = to; return; }
    if (el._transform) cancelAnimationFrame(el._transform);
    const start = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      const len = Math.round(from.length + (to.length - from.length) * p);
      let out = '';
      for (let i = 0; i < len; i++) {
        const settle = (i / Math.max(len, 1)) * 0.7 + 0.3;  // letters settle left to right
        if (p >= settle) out += to[i] || '';
        else if (p < settle - 0.3) out += from[i] || '';
        else out += to[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = p < 1 ? out : to;
      if (p < 1) el._transform = requestAnimationFrame(tick);
      else el._transform = null;
    };
    el._transform = requestAnimationFrame(tick);
  }

  if (toggled) {
    const h1 = document.querySelector('#header-container h1');
    const role = document.querySelector('#header-container .profile-type');
    if (h1) transform(h1, other.name, persona.name);
    if (role) transform(role, other.role, persona.role);
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
