// A photo slot for Work and Explore entries. With an `image` in data.js it
// shows the photo. Without one, a dark placeholder tile with a line symbol drawn
// for that entry (its `symbol` in data.js) on a dark tile. Symbols live on a 48×48 grid.
window.thumb = (() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const sunRays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4, c = Math.cos(a), s = Math.sin(a);
    return `M${(24 + 10 * c).toFixed(1)} ${(24 + 10 * s).toFixed(1)}L${(24 + 16 * c).toFixed(1)} ${(24 + 16 * s).toFixed(1)}`;
  }).join('');
  const dot = (x, y, r = 1.8) => `<circle cx="${x}" cy="${y}" r="${r}" class="f"/>`;

  // symbol → [color, drawing]
  const SYMBOLS = {
    landmark:  ['terracotta', '<path d="M9 40h30M13 40V22l11-9 11 9v18M20 40v-7a4 4 0 0 1 8 0v7M24 5v8M21 8h6M21 23h6v5h-6z"/>'],
    accent:    ['navy', '<text x="24" y="35" text-anchor="middle" class="glyph">á</text>'],
    tokens:    ['teal', '<path d="M6 19h11v10H6zM20 19h8v10h-8zM31 19h11v10H31z"/><path d="M6 34h36" stroke-dasharray="2 3"/>'],
    waveform:  ['plum', '<path d="M5 24h5l2-5 3 12 3-18 3 22 3-16 3 10 3-6 2 2h9"/>'],
    translate: ['ochre', '<path d="M7 10h17v12H14l-5 4v-4H7zM24 24h17v12h-2v4l-5-4H24z"/><path d="M11 16h9M28 30h9"/>'],
    vector:    ['clay', `<path d="M9 39L39 9M39 9h-9M39 9v9"/>${dot(14, 26)}${dot(19, 33)}${dot(27, 17)}${dot(31, 29)}${dot(18, 18)}${dot(35, 22)}`],
    graph:     ['slate', `<path d="M12 12L36 16M12 12L36 32M12 24L36 16M12 36L36 32M12 24L36 32"/>${dot(12, 12, 3)}${dot(12, 24, 3)}${dot(12, 36, 3)}${dot(36, 16, 3)}${dot(36, 32, 3)}`],
    chat:      ['sage', `<path d="M8 11h32v20H22l-8 7v-7H8z"/>${dot(17, 21)}${dot(24, 21)}${dot(31, 21)}`],
    network:   ['teal', `<path d="M11 14L29 9L38 25L24 30L10 34L11 14M24 30L29 9M24 30L27 41M10 34L27 41"/>${dot(11, 14, 2.6)}${dot(29, 9, 2.6)}${dot(38, 25, 2.6)}${dot(24, 30, 2.6)}${dot(10, 34, 2.6)}${dot(27, 41, 2.6)}`],
    sun:       ['ochre', `<circle cx="24" cy="24" r="6"/><path d="${sunRays}"/>`],
    book:      ['terracotta', '<path d="M24 14c-4-3-10-3-16-2v23c6-1 12-1 16 2 4-3 10-3 16-2V12c-6-1-12-1-16 2zM24 14v23"/>'],
    robot:     ['slate', `<path d="M14 16h20v19H14zM20 30h8M24 16v-5M11 22v7M37 22v7"/>${dot(24, 9, 2)}${dot(19.5, 23.5, 2)}${dot(28.5, 23.5, 2)}`],
    apple:     ['sage', '<path d="M24 16c-3-3-12-3-13 6-1 9 5 18 9 18 2 0 3-1 4-1s2 1 4 1c4 0 10-9 9-18-1-9-10-9-13-6z"/><path d="M24 16c0-3 1-6 3-8M26 12c3-3 7-3 9-1-3 3-7 3-9 1z"/>'],
    blackhole: ['plum', '<ellipse cx="24" cy="24" rx="18" ry="5.5" transform="rotate(-18 24 24)"/><circle cx="24" cy="24" r="7" class="hole"/>'],
    scales:    ['navy', '<path d="M24 9v29M16 38h16M11 14h26M11 14l-5 11M11 14l5 11M37 14l-5 11M37 14l5 11M6 25a5 3 0 0 0 10 0M32 25a5 3 0 0 0 10 0"/>'],
    glacier:   ['teal', '<path d="M5 38l14-21 6 8 5-6 13 19z"/><path d="M25 38l-2-6 3-3-2-4"/>'],
    eye:       ['clay', `<path d="M5 24c5-8 12-12 19-12s14 4 19 12c-5 8-12 12-19 12S10 32 5 24z"/><circle cx="24" cy="24" r="6"/>${dot(24, 24, 2.4)}`],
    feed:      ['teal', '<path d="M8 9h22v7H8zM12 20h22v7H12zM16 31h22v7H16z"/>'],
    lock:      ['clay', `<path d="M14 23h20v16H14zM18 23v-6a6 6 0 0 1 11.6-2.2M24 32v3"/>${dot(24, 30, 2)}`],
    glitch:    ['slate', '<path d="M7 11h24v7H7zM15 21h26v7H15zM5 31h22v7H5zM31 31h9v7h-9z"/>'],
  };

  return (item, fallback) => {
    if (item.image) return `<div class="thumb"><img src="${esc(item.image)}" alt="" loading="lazy" decoding="async"></div>`;
    const [color, art] = SYMBOLS[item.symbol] || SYMBOLS[fallback] || SYMBOLS.feed;
    return `<div class="thumb thumb-empty c-${color}" aria-hidden="true"><svg viewBox="0 0 48 48">${art}</svg></div>`;
  };
})();
