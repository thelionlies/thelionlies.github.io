// Background: one set of dots with two homes.
// Lion: the dots are locked on a grid (graph paper); hovering connects them at
// right angles.
// Láyon: the same dots float free like stars, drifting slowly; hovering joins
// nearby stars into constellations.
// Switching persona is the transformation: the grid loosens into stars (to
// Láyon), or the stars settle back into the grid (to Lion). The portrait hint
// (a 'persona-hint' event from nav.js) plays a brief half-transformation and back.
// Lines and the cursor glow fade to a trace over the text column, so text stays readable.
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
  const GLOW_ALPHA = isLayon ? 0.25 : 0.3;
  const LINE_ALPHA = 0.4;
  const MORPH_MS = 1400;
  const STAR_LINK = 80;      // max length of a constellation line, px
  const DRIFT = 6;           // how far stars wander from home, px
  const HINT_MS = 700;       // the portrait hint's brief half-transformation
  const HINT_DEPTH = 0.45;   // how far toward the other form it goes
  const TEXT_FLOOR = 0.4;    // how much of an effect still shows over the text column

  const canvas = document.createElement('canvas');
  canvas.className = 'bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#8a9bb8';

  let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, ox = 0, oy = 0;
  let colL = 0, colR = 0;  // the text column; effects fade out over it
  let dots = [];           // { gx, gy, sx, sy, size, twinkle, phase, x, y }
  let edges = new Map();   // key -> { a, b (dot indexes), e (opacity), grow (0..1 drawn) }
  let pointer = null;
  let light = null;
  let running = false;
  let morphStart = 0;      // when the current grid/star transformation began
  let morphTo = isLayon ? 1 : 0;   // 0 = grid, 1 = stars
  let morphFrom = morphTo;

  // Deterministic randomness, so each dot always has the same star position
  function hash(n) {
    n = (n ^ 61) ^ (n >>> 16);
    n = Math.imul(n, 9);
    n ^= n >>> 4;
    n = Math.imul(n, 0x27d4eb2d);
    n ^= n >>> 15;
    return (n >>> 0) / 4294967296;
  }

  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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

    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * 4099 + c;
        dots.push({
          gx: ox + c * SPACING, gy: oy + r * SPACING,
          sx: hash(i * 5) * w, sy: hash(i * 5 + 1) * h,
          size: 0.6 + hash(i * 5 + 2) * 1.3,          // stars vary in size...
          twinkle: 0.4 + hash(i * 5 + 3) * 0.9,       // ...and brightness
          phase: hash(i * 5 + 4) * Math.PI * 2,
          x: 0, y: 0,
        });
      }
    }
    edges = new Map();

    // Arriving from the other persona: start in its form and transform into ours
    if (morph && !reduceMotion) {
      morphFrom = morph === 'toLayon' ? 0 : 1;
      morphStart = performance.now();
    } else {
      morphFrom = morphTo;
    }
    morph = null;
    wake();
  }

  // 0 = grid, 1 = stars, eased over the transformation, plus the hint's brief swell
  let hintStart = -Infinity;
  function form(now) {
    let f = morphTo;
    if (morphFrom !== morphTo) {
      const t = Math.min(1, (now - morphStart) / MORPH_MS);
      if (t >= 1) morphFrom = morphTo;
      else f = morphFrom + (morphTo - morphFrom) * ease(t);
    }
    const ht = (now - hintStart) / HINT_MS;
    if (ht >= 0 && ht < 1) {
      const swell = Math.sin(Math.PI * ht) * HINT_DEPTH;   // out and back
      f += isLayon ? -swell : swell;
    }
    return f;
  }
  const hinting = now => now - hintStart < HINT_MS;

  window.addEventListener('persona-hint', () => {
    if (reduceMotion) return;
    hintStart = performance.now();
    wake();
  });

  function place(now, f) {
    const tsec = now / 1000;
    for (const d of dots) {
      const driftX = reduceMotion ? 0 : Math.sin(tsec * 0.15 + d.phase) * DRIFT;
      const driftY = reduceMotion ? 0 : Math.cos(tsec * 0.12 + d.phase * 1.3) * DRIFT;
      d.x = d.gx + (d.sx + driftX - d.gx) * f;
      d.y = d.gy + (d.sy + driftY - d.gy) * f;
    }
  }

  // 1 in the margins, softened over the text column, so text stays readable
  function clearance(x) {
    const d = x < colL ? colL - x : x > colR ? x - colR : -1;
    if (d < 0) return TEXT_FLOOR;
    return Math.min(1, TEXT_FLOOR + (d / (SPACING * 2)) * (1 - TEXT_FLOOR));
  }

  function setEdge(a, b, strength) {
    const k = a < b ? a * 1e6 + b : b * 1e6 + a;
    let edge = edges.get(k);
    if (!edge) { edge = { a, b, e: 0, grow: 0 }; edges.set(k, edge); }
    if (strength > edge.e) {
      edge.e = strength;
      edge.grow = Math.max(edge.grow, 0.01);
    }
  }

  // Lion: connect grid neighbors near the cursor at right angles (about half
  // of them, chosen by hash so the same lines appear every time)
  function connectGrid(x, y, radius = RADIUS, scale = 1) {
    const c0 = Math.max(0, Math.floor((x - ox - radius) / SPACING));
    const c1 = Math.min(cols - 1, Math.ceil((x - ox + radius) / SPACING));
    const r0 = Math.max(0, Math.floor((y - oy - radius) / SPACING));
    const r1 = Math.min(rows - 1, Math.ceil((y - oy + radius) / SPACING));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const i = r * cols + c;
        const dist = Math.hypot(dots[i].x - x, dots[i].y - y);
        if (dist > radius) continue;
        const strength = (1 - dist / radius) * LINE_ALPHA * scale;
        const id = r * 4099 + c;
        if (c + 1 < cols && hash(id * 4) < 0.55) setEdge(i, i + 1, strength);
        if (r + 1 < rows && hash(id * 4 + 1) < 0.55) setEdge(i, i + cols, strength);
      }
    }
  }

  // Láyon: join each star near the cursor to its two nearest neighbors
  function connectStars(x, y, radius = RADIUS, scale = 1) {
    const near = [];
    dots.forEach((d, i) => { if (Math.hypot(d.x - x, d.y - y) < radius) near.push(i); });
    for (const i of near) {
      const d = dots[i];
      const strength = (1 - Math.hypot(d.x - x, d.y - y) / radius) * LINE_ALPHA * scale;
      const closest = near
        .filter(j => j !== i)
        .map(j => [j, Math.hypot(dots[j].x - d.x, dots[j].y - d.y)])
        .filter(([, dist]) => dist < STAR_LINK)
        .sort((p, q) => p[1] - q[1])
        .slice(0, 2);
      for (const [j] of closest) setEdge(i, j, strength);
    }
  }

  function draw(f) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = accent;
    ctx.strokeStyle = accent;
    const tsec = performance.now() / 1000;

    // Dots: uniform on the grid; as stars they take on size and a slow twinkle
    for (const d of dots) {
      let a = DOT_ALPHA * (1 + (d.twinkle - 1) * f);
      if (f > 0 && !reduceMotion) a *= 1 - 0.3 * f * (0.5 + 0.5 * Math.sin(tsec * 0.8 + d.phase));
      if (light) {
        const dist = Math.hypot(d.x - light.x, d.y - light.y);
        if (dist < RADIUS) a += (1 - dist / RADIUS) * GLOW_ALPHA * clearance(d.x);
      }
      const s = 2 + (d.size * 1.4 - 2) * f;
      ctx.globalAlpha = Math.min(1, a);
      ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s);
    }

    // Lines grow from one end, then fade. A line whose dots have moved apart
    // (during a transformation) is dropped rather than stretched across the page.
    ctx.lineWidth = 1;
    const maxLen = isLayon ? STAR_LINK * 1.25 : SPACING * 1.25;
    for (const [k, edge] of edges) {
      if (edge.e < 0.005) continue;
      const a = dots[edge.a], b = dots[edge.b];
      if (!a || !b || Math.hypot(b.x - a.x, b.y - a.y) > maxLen) { edges.delete(k); continue; }
      const g = Math.min(1, edge.grow);
      ctx.globalAlpha = edge.e * clearance((a.x + b.x) / 2);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + (b.x - a.x) * g, a.y + (b.y - a.y) * g);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  function step(now) {
    const f = form(now);
    const drifting = f > 0 && !reduceMotion;   // stars drift continuously
    let busy = morphFrom !== morphTo || hinting(now);   // full speed only while something changes

    place(now, f);

    if (pointer) {
      if (!light) light = { ...pointer };
      const k = reduceMotion ? 1 : 0.25;
      light.x += (pointer.x - light.x) * k;
      light.y += (pointer.y - light.y) * k;
      if (Math.hypot(pointer.x - light.x, pointer.y - light.y) > 0.5) busy = true;
      // No new connections while the dots are transforming
      if (morphFrom === morphTo && !hinting(now)) {
        if (isLayon) connectStars(light.x, light.y);
        else connectGrid(light.x, light.y);
      }
    }

    for (const [k, edge] of edges) {
      if (edge.grow < 1) edge.grow = reduceMotion ? 1 : edge.grow + 0.08;
      edge.e *= reduceMotion ? 0.8 : 0.96;
      if (edge.e < 0.005) edges.delete(k);
      else busy = true;
    }

    draw(f);

    if (busy) requestAnimationFrame(step);
    // Just drifting: ~20 fps is plenty for slow motion and spares the battery
    else if (drifting) setTimeout(() => requestAnimationFrame(step), 50);
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
  // On touch there's no hover: let the glow go once the finger lifts
  window.addEventListener('pointerup', e => {
    if (e.pointerType === 'touch') setTimeout(() => { pointer = null; light = null; wake(); }, 600);
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    // Phones resize as the address bar hides; don't rebuild for that
    if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 160) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 200);
  });

  setup();
  place(performance.now(), form(performance.now()));
  draw(form(performance.now()));
})();
