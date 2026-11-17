// Background: a dot grid shared by both personas.
// Lion: graph paper; dots near the cursor glow.
// Láyon: the same grid with a few fixed constellations, and the cursor
// connects nearby dots with lines that fade behind it.
// Toggling personas draws the constellations in (to Láyon) or out (to Lion).
(function () {
  const isLayon = location.pathname.includes('/layon/');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let morph = null;
  try {
    morph = sessionStorage.getItem('bgMorph');
    sessionStorage.removeItem('bgMorph');
  } catch {}

  const SPACING = 28;
  const RADIUS = 120;
  const DOT_ALPHA = isLayon ? 0.28 : 0.2;
  const GLOW_ALPHA = isLayon ? 0.35 : 0.45;
  const SEED_ALPHA = 0.22;
  const LINE_ALPHA = 0.55;
  // Grid directions: right, down, down-right, down-left (lines form triangles)
  const DIRS = [[1, 0], [0, 1], [1, 1], [-1, 1]];

  const canvas = document.createElement('canvas');
  canvas.className = 'bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#8a9bb8';

  let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, ox = 0, oy = 0;
  let colL = 0, colR = 0;  // the text column; effects fade out over it
  let edges = new Map();   // key -> { a, b, e, target, grow, delay, seed }
  let pointer = null;
  let light = null;
  let running = false;

  // Deterministic randomness, so constellations sit in the same place every visit
  function hash(n) {
    n = (n ^ 61) ^ (n >>> 16);
    n = Math.imul(n, 9);
    n ^= n >>> 4;
    n = Math.imul(n, 0x27d4eb2d);
    n ^= n >>> 15;
    return (n >>> 0) / 4294967296;
  }
  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const px = c => ox + c * SPACING;
  const py = r => oy + r * SPACING;

  // Only some grid edges can ever connect, which keeps the lines sparse and organic
  function eligible(c, r, d) {
    return hash((r * 4099 + c) * 4 + d) < 0.55;
  }

  function key(c, r, d) { return (r * cols + c) * 4 + d; }

  function setEdge(c, r, d, props) {
    const k = key(c, r, d);
    let edge = edges.get(k);
    if (!edge) {
      const [dc, dr] = DIRS[d];
      edge = { a: [c, r], b: [c + dc, r + dr], e: 0, target: 0, grow: 0, delay: 0, seed: false };
      edges.set(k, edge);
    }
    Object.assign(edge, props);
    return edge;
  }

  function seedConstellations(startAlpha, target, animateIn) {
    const rand = rng(cols * 7919 + rows);
    const count = Math.max(4, Math.round((cols * rows) / 70));
    let order = 0;
    for (let i = 0; i < count; i++) {
      let c = Math.floor(rand() * cols), r = Math.floor(rand() * rows);
      const len = 2 + Math.floor(rand() * 4);
      for (let s = 0; s < len; s++) {
        const options = [];
        for (let d = 0; d < 4; d++) {
          const [dc, dr] = DIRS[d];
          if (c + dc >= 0 && c + dc < cols && r + dr < rows && eligible(c, r, d)) options.push([c, r, d, c + dc, r + dr]);
          if (c - dc >= 0 && c - dc < cols && r - dr >= 0 && eligible(c - dc, r - dr, d)) options.push([c - dc, r - dr, d, c - dc, r - dr]);
        }
        if (!options.length) break;
        const [ec, er, ed, nc, nr] = options[Math.floor(rand() * options.length)];
        setEdge(ec, er, ed, {
          seed: true, e: startAlpha, target,
          grow: animateIn ? 0 : 1,
          delay: animateIn ? Math.round(order++ * 0.4) : 0,
        });
        c = nc; r = nr;
      }
    }
  }

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    // Line the grid up with the content's left edge, so text and dots share one grid
    const rect = document.body.getBoundingClientRect();
    const bodyStyle = getComputedStyle(document.body);
    const contentLeft = rect.left + parseFloat(bodyStyle.paddingLeft) || 0;
    colL = contentLeft;
    colR = rect.right - (parseFloat(bodyStyle.paddingRight) || 0);
    ox = ((contentLeft % SPACING) + SPACING) % SPACING;
    oy = SPACING / 2;
    cols = Math.floor((w - ox) / SPACING) + 1;
    rows = Math.floor((h - oy) / SPACING) + 1;
    edges = new Map();

    const animate = !reduceMotion && morph;
    if (isLayon) {
      seedConstellations(animate ? 0 : SEED_ALPHA, SEED_ALPHA, animate);
    } else if (animate && morph === 'toLion') {
      seedConstellations(SEED_ALPHA, 0, false);
    }
    morph = null;
    wake();
  }

  function connectNear(x, y) {
    const c0 = Math.max(0, Math.floor((x - ox - RADIUS) / SPACING));
    const c1 = Math.min(cols - 1, Math.ceil((x - ox + RADIUS) / SPACING));
    const r0 = Math.max(0, Math.floor((y - oy - RADIUS) / SPACING));
    const r1 = Math.min(rows - 1, Math.ceil((y - oy + RADIUS) / SPACING));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        for (let d = 0; d < 4; d++) {
          const [dc, dr] = DIRS[d];
          const nc = c + dc, nr = r + dr;
          if (nc < 0 || nc >= cols || nr >= rows || !eligible(c, r, d)) continue;
          const mx = (px(c) + px(nc)) / 2, my = (py(r) + py(nr)) / 2;
          const dist = Math.hypot(mx - x, my - y);
          if (dist > RADIUS) continue;
          const strength = (1 - dist / RADIUS) * LINE_ALPHA;
          const edge = setEdge(c, r, d, {});
          if (strength > edge.e) {
            edge.e = strength;
            if (!edge.seed) edge.grow = Math.max(edge.grow, 0.01);
          }
        }
      }
    }
  }

  // 1 in the margins, fading to a trace over the text column, so text stays readable
  function clearance(x) {
    const d = x < colL ? colL - x : x > colR ? x - colR : -1;
    if (d < 0) return 0.1;
    return Math.min(1, 0.1 + (d / (SPACING * 2)) * 0.9);
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = accent;
    ctx.strokeStyle = accent;

    // Dots
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = px(c), y = py(r);
        let a = DOT_ALPHA;
        if (light) {
          const dist = Math.hypot(x - light.x, y - light.y);
          if (dist < RADIUS) a += (1 - dist / RADIUS) * GLOW_ALPHA * clearance(x);
        }
        ctx.globalAlpha = a;
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }

    // Lines
    ctx.lineWidth = 1;
    for (const edge of edges.values()) {
      if (edge.e < 0.005 || edge.grow <= 0) continue;
      const ax = px(edge.a[0]), ay = py(edge.a[1]);
      const bx = px(edge.b[0]), by = py(edge.b[1]);
      const g = Math.min(1, edge.grow);
      ctx.globalAlpha = edge.e * clearance((ax + bx) / 2);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + (bx - ax) * g, ay + (by - ay) * g);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    let busy = false;

    if (pointer) {
      if (!light) light = { ...pointer };
      const k = reduceMotion ? 1 : 0.25;
      light.x += (pointer.x - light.x) * k;
      light.y += (pointer.y - light.y) * k;
      if (Math.hypot(pointer.x - light.x, pointer.y - light.y) > 0.5) busy = true;
      if (isLayon) connectNear(light.x, light.y);
    }

    for (const [k, edge] of edges) {
      if (edge.delay > 0) { edge.delay--; busy = true; continue; }
      if (edge.grow < 1) { edge.grow = reduceMotion ? 1 : edge.grow + 0.08; busy = true; }
      if (edge.seed) {
        const diff = edge.target - edge.e;
        if (Math.abs(diff) > 0.003) { edge.e += diff * 0.06; busy = true; }
        else edge.e = edge.target;
        if (edge.target === 0 && edge.e < 0.005) edges.delete(k);
      } else {
        edge.e *= reduceMotion ? 0.8 : 0.96;
        if (edge.e < 0.005) edges.delete(k);
        else busy = true;
      }
    }

    draw();

    if (busy) requestAnimationFrame(step);
    else running = false;
  }

  function wake() {
    if (running) return;
    running = true;
    requestAnimationFrame(step);
  }

  function onPointer(x, y) {
    pointer = { x, y };
    wake();
  }

  window.addEventListener('pointermove', e => onPointer(e.clientX, e.clientY), { passive: true });
  window.addEventListener('pointerdown', e => onPointer(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (t) onPointer(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('mouseleave', () => { pointer = null; light = null; wake(); });

  let resizeTimer;
  window.addEventListener('resize', () => {
    // Phones resize as the address bar hides; don't rebuild for that
    if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 160) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 200);
  });

  setup();
  draw();
})();
