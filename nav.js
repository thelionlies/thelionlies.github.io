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
      name: 'Ivan Yuri De Leon', role: 'AI Safety Researcher', accent: '#2e4a6b',
      mark: `<path d="M2,2 L12,2 L12,12 L22,12 L22,22 L2,22 Z" fill="currentColor"/>`,
    },
    layon: {
      name: 'Láyon', role: 'Filipino Poet', accent: '#a9b8d4',
      mark: `<rect x="12" y="2" width="10" height="10" fill="currentColor"/>`,
    },
  };
  const persona = isLayon ? personas.layon : personas.lion;
  const other = isLayon ? personas.lion : personas.layon;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Arriving from the other persona? (cleared further down)
  let arrivedBySwitch = false;
  try { arrivedBySwitch = !!sessionStorage.getItem('personaToggled'); } catch {}

  const tabs = [['home', 'Home'], ['work', 'Work'], ['explore', 'Explore'], ['cv', 'Bio']];
  const navBase = isLayon ? '/layon/' : '/';

  // Favicon: static <link rel="icon"> in each page (crawlable, so search results show it)

  // Header + nav
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    const links = tabs.map(([page, label]) => {
      const href = navBase + (page === 'home' ? 'index.html' : page + '.html');
      const cls = page === currentPage ? ' class="active"' : '';
      return `<a data-page="${page}" href="${href}"${cls}>${label}</a>`;
    }).join('\n    ');

    // The logo also holds the other persona's part (Lion's L and Láyon's
    // quarter make one whole square), shown only while switching or hinting
    headerContainer.innerHTML = `
<div class="brand">
  <svg class="logo${arrivedBySwitch && !reduceMotion ? ' whole' : ''}" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
    ${persona.mark}
    <g class="logo-other">${other.mark}</g>
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

  // Logo: complete the square, or let the other part go again
  const logo = document.querySelector('#header-container .logo');
  const setWhole = on => { if (logo) logo.classList.toggle('whole', on); };
  if (arrivedBySwitch && !reduceMotion) setTimeout(() => setWhole(false), 450);

  // Visible text outside the header (the header's name and role transform separately)
  function contentTextNodes(root) {
    const skip = '#header-container, script, style, noscript, #flash';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (!n.nodeValue.trim() || n.parentElement.closest(skip))
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  // Persona toggle: pages cross-fade (cross-document view transition, see style.css)
  // while the text transforms; browsers without view transitions get a flash.
  const morphs = 'onpagereveal' in window && !reduceMotion;
  const flash = document.createElement('div');
  flash.id = 'flash';
  document.body.appendChild(flash);

  // Bio pages: Lion's CV and Láyon's statement have different layouts, so on a
  // switch their blocks are paired in order (view-transition names) and each
  // block glides from its old place and size to its new one
  function bioBlocks() {
    return currentPage === 'cv' ? [...document.querySelectorAll(
      'h2.page-tab, .cv-entry, .cv-pubs > li, .cv-section > ul:not(.cv-pubs) > li, .statement p'
    )] : [];
  }
  const nameBioBlocks = on => bioBlocks().forEach((el, i) => {
    el.style.viewTransitionName = on ? `bio-${i}` : '';
  });

  const toggle = document.getElementById('personaToggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      const goingToLayon = toggle.checked;
      try {
        sessionStorage.setItem('personaToggled', '1');
        sessionStorage.setItem('bgMorph', goingToLayon ? 'toLayon' : 'toLion');
        // Remember this page's text, so the other side can decode only what differs
        const texts = [...new Set(contentTextNodes(document.body).map(n => n.nodeValue.trim()))];
        sessionStorage.setItem('prevTexts', JSON.stringify(texts));
      } catch {}

      let targetUrl;
      if (inWritings) {
        targetUrl = goingToLayon ? '/layon/writings.html' : '/writings.html';
      } else {
        targetUrl = isLayon ? `../${fileName}` : `layon/${fileName}`;
      }

      if (morphs) {
        // The logo completes into the whole square, then the page changes
        setWhole(true);
        nameBioBlocks(true);
        setTimeout(() => { window.location.href = targetUrl; }, 260);
      } else {
        setWhole(true);
        flash.style.background = goingToLayon ? '#0e0f15' : '#f6f4ee';
        flash.classList.add('active');
        setTimeout(() => { window.location.href = targetUrl; }, 500);
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
      setWhole(true);
      setTimeout(() => setWhole(false), 280);
      window.dispatchEvent(new Event('persona-hint'));  // bg.js: brief grid/stars swell
      // The words flicker toward something else, then settle back
      const header = document.getElementById('header-container');
      const headerText = header ? [...header.querySelectorAll('h1, .profile-type')].flatMap(el => [...el.childNodes].filter(n => n.nodeType === 3)) : [];
      decode([...headerText, ...contentTextNodes(document.body)], { stagger: 0, base: 320, perChar: 0 });
      setTimeout(() => document.body.classList.remove('shaking'), 500);
      reveal.style.opacity = 1;
      cover.style.opacity = 0;
      setTimeout(() => { cover.style.opacity = 1; }, 140);
      setTimeout(() => { reveal.style.opacity = 0; switchLabel.classList.remove('half'); active = false; }, 280);
    };

    portraitSwitch.addEventListener('mouseenter', triggerHint);
    // Phones have no hover: a tap plays it too (and clicking replays it on desktop)
    portraitSwitch.addEventListener('click', triggerHint);

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

  // Decode: text that differs from the other side starts as random letters and
  // resolves left to right. One animation loop drives every text node.
  const decoding = [];
  const inFlight = new WeakSet();  // never capture half-scrambled text as "final"
  let decodeFrame = null;
  function decode(nodes, { stagger = 12, base = 500, perChar = 4 } = {}) {
    if (reduceMotion) return;
    const now = performance.now();
    nodes.forEach((node, i) => {
      if (inFlight.has(node)) return;
      inFlight.add(node);
      const final = node.nodeValue;
      decoding.push({ node, final, start: now + Math.min(i * stagger, 400), dur: base + Math.min(final.length * perChar, 500) });
      node.nodeValue = scramble(final, 0);
    });
    if (!decodeFrame) decodeFrame = requestAnimationFrame(decodeTick);
  }
  function scramble(text, p) {
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      out += (/\s/.test(ch) || i / text.length < p) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    return out;
  }
  function decodeTick(now) {
    for (let i = decoding.length - 1; i >= 0; i--) {
      const d = decoding[i];
      const p = Math.max(0, (now - d.start) / d.dur);
      if (p >= 1) { d.node.nodeValue = d.final; decoding.splice(i, 1); inFlight.delete(d.node); }
      else d.node.nodeValue = scramble(d.final, p);
    }
    decodeFrame = decoding.length ? requestAnimationFrame(decodeTick) : null;
  }

  if (toggled) {
    // Pair the Bio blocks with the page we came from, then let go once moved
    if (morphs && currentPage === 'cv') {
      nameBioBlocks(true);
      window.addEventListener('pagereveal', e => {
        if (e.viewTransition) e.viewTransition.finished.finally(() => nameBioBlocks(false));
        else nameBioBlocks(false);
      }, { once: true });
    }

    const h1 = document.querySelector('#header-container h1');
    const role = document.querySelector('#header-container .profile-type');
    if (h1) transform(h1, other.name, persona.name);
    if (role) transform(role, other.role, persona.role);

    if (!reduceMotion) {
      let prev = new Set();
      try {
        prev = new Set(JSON.parse(sessionStorage.getItem('prevTexts') || '[]'));
        sessionStorage.removeItem('prevTexts');
      } catch {}
      const changed = nodes => nodes.filter(n => !prev.has(n.nodeValue.trim()));
      decode(changed(contentTextNodes(document.body)));

      // Work and Explore entries arrive a moment later; decode those too
      const observer = new MutationObserver(records => {
        const added = [];
        records.forEach(r => r.addedNodes.forEach(n => {
          if (n.nodeType === 1) added.push(...contentTextNodes(n));
        }));
        decode(changed(added));
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 2000);
    }
  }
})();
