// Lion's homepage clock: a 12-hour clock face. It starts at the
// current time in Manila. Drag the hand (or use the arrow keys) and pick a day,
// and the caption says what Lion is usually doing then.
//
// EDIT THE SCHEDULE HERE. Hours are 0–24 in Manila time; blocks may not overlap.
(function () {
  // what each side says, one line each. Láyon is asleep except in the writing
  // hours, when Láyon is awake (and Láyon's clock turns over to night)
  const box0 = document.getElementById('day-clock');
  const side = box0 && box0.dataset.persona === 'layon' ? 'layon' : 'lion';
  const ACTIVITIES = side === 'lion' ? {
    globe:    { label: 'At Globe', status: 'Working as FDE at Globe.' },
    saiph:    { label: 'Safe AI Philippines', status: 'Running programs at Safe AI PH.' },
    research: { label: 'AI research', status: 'Doing AI research.' },
    writing:  { label: 'Writing poems', status: 'If not asleep, writing poems.' },
    sleep:    { label: 'Asleep', status: 'Asleep.' },
  } : {
    globe:    { label: 'Asleep', status: 'Asleep.' },
    saiph:    { label: 'Asleep', status: 'Asleep.' },
    research: { label: 'Asleep', status: 'Asleep.' },
    writing:  { label: 'Awake, writing', status: 'Láyon is awake.' },
    sleep:    { label: 'Asleep', status: 'Asleep.' },
  };
  const WEEKDAY = [[0, 2, 'writing'], [2, 8, 'sleep'], [8, 17, 'globe'], [17, 23, 'research'], [23, 24, 'writing']];
  const WEEKEND = [[0, 2, 'writing'], [2, 9, 'sleep'], [9, 17, 'saiph'], [17, 23, 'research'], [23, 24, 'writing']];
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const scheduleFor = d => (d >= 5 ? WEEKEND : WEEKDAY);

  const box = document.getElementById('day-clock');
  if (!box) return;

  // now, in Manila, as minutes since midnight
  function manilaNow() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(new Date());
    const get = t => parts.find(p => p.type === t).value;
    return { day: DAYS.indexOf(get('weekday')), t: (+get('hour') % 24) * 60 + (+get('minute')) };
  }

  let { day, t } = manilaNow();
  let live = true;                                   // the hand is at the current time

  // ---- the face: a full 12-hour clock in heavy rods and big serif numerals ----
  const C = 120;
  const pt = (frac, r) => { const a = frac * 2 * Math.PI - Math.PI / 2; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
  const f = n => n.toFixed(2);
  let marks = '';
  for (let m = 0; m < 60; m++) {                      // minute ticks
    if (m % 5 === 0) continue;
    const [x0, y0] = pt(m / 60, 104), [x1, y1] = pt(m / 60, 109);
    marks += `<line x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}" class="tick"/>`;
  }
  for (let h = 0; h < 12; h++) {                      // an hour rod at every hour, heavier at the quarters
    const q = h % 3 === 0;
    const [x0, y0] = pt(h / 12, q ? 88 : 95), [x1, y1] = pt(h / 12, 109);
    marks += `<line x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}" class="rod${q ? ' quarter' : ''}" style="--i:${h}"/>`;
  }
  const numerals = Array.from({ length: 12 }, (_, i) => i + 1).map(n => {
    const q = n % 3 === 0, [x, y] = pt(n / 12, q ? 70 : 76);
    return `<text x="${f(x)}" y="${f(y)}" class="numeral${q ? ' quarter' : ''}">${n}</text>`;
  }).join('');
  box.innerHTML = `
    <div class="clock-days" role="group" aria-label="Day of the week">
      <button type="button" class="clock-day" data-day="0">Weekday</button>
      <button type="button" class="clock-day" data-day="5">Weekend</button>
    </div>
    <svg class="clock-face doom-style" viewBox="0 0 240 240">
      <circle cx="${C}" cy="${C}" r="113" class="ring-outer"/>
      ${marks}${numerals}
      <text x="${C}" y="${C + 40}" class="meridiem"></text>
      <line x1="${C}" y1="${C}" class="hand-minute"/>
      <g class="hand" tabindex="0" role="slider" aria-label="Time of day" aria-valuemin="0" aria-valuemax="1440">
        <line x1="${C}" y1="${C}" class="hand-hour"/>
        <rect width="11" height="11" class="hand-knob"/>
      </g>
      <rect x="${C - 7}" y="${C - 7}" width="14" height="14" class="hub"/>
      <g class="moon" aria-hidden="true">
        <mask id="moon-bite-${side}"><rect width="240" height="240" fill="#fff"/><circle cx="${C + 9}" cy="${C - 50}" r="11" fill="#000"/></mask>
        <circle cx="${C + 2}" cy="${C - 46}" r="12" class="moon-disc" mask="url(#moon-bite-${side})"/>
      </g>
    </svg>
    <p class="clock-status" aria-live="polite"></p>`;

  const svg = box.querySelector('svg'), hand = box.querySelector('.hand');
  const handLine = box.querySelector('.hand-hour'), knob = box.querySelector('.hand-knob');
  const minHand = box.querySelector('.hand-minute'), meridiem = box.querySelector('.meridiem');
  const status = box.querySelector('.clock-status');

  const wrap = m => ((Math.round(m) % 1440) + 1440) % 1440;
  const fmt = m => { const h = Math.floor(m / 60); return `${(h % 12) || 12}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };

  function render() {
    const m = wrap(t), h = m / 60, sched = scheduleFor(day);
    const [x, y] = pt((m / 60 % 12) / 12, 62), [mx, my] = pt((m % 60) / 60, 96);
    handLine.setAttribute('x2', f(x)); handLine.setAttribute('y2', f(y));
    minHand.setAttribute('x2', f(mx)); minHand.setAttribute('y2', f(my));
    meridiem.textContent = m < 720 ? 'AM' : 'PM';
    knob.setAttribute('x', f(x - 5.5)); knob.setAttribute('y', f(y - 5.5));
    const block = sched.find(([a, b]) => h >= a && h < b) || sched[0];
    const act = ACTIVITIES[block[2]];
    box.classList.toggle('awake', side === 'layon' && block[2] === 'writing');   // Láyon's hours: Láyon's clock turns over
    const today = manilaNow().day, sameKind = (today >= 5) === (day >= 5);
    status.innerHTML = `<span class="clock-when">${live && sameKind ? `Right now · ${DAYS[today]}` : (day >= 5 ? 'Weekend' : 'Weekday')} · ${fmt(m)}</span>${act.status}`;
    hand.setAttribute('aria-valuenow', m);
    hand.setAttribute('aria-valuetext', `${DAYS[day]} ${fmt(m)}: ${act.label}`);
    box.querySelectorAll('[data-day]').forEach(b => b.setAttribute('aria-pressed', (+b.dataset.day >= 5) === (day >= 5)));
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let returnTimer = 0, anim = 0;
  const touch = () => { live = false; clearTimeout(returnTimer); cancelAnimationFrame(anim); };

  // after a pause, the hand springs back to the current time (a slight overshoot)
  function springBack(delay = 1500) {
    clearTimeout(returnTimer);
    returnTimer = setTimeout(() => {
      const from = t, to = manilaNow().t;
      let d = to - from; if (d > 720) d -= 1440; if (d < -720) d += 1440;   // the short way round
      if (reduce || Math.abs(d) < 1) { t = to; live = true; render(); return; }
      const start = performance.now(), dur = 700;
      const ease = x => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);   // ease-out-back
      (function step(now) {
        const k = Math.min(1, (now - start) / dur);
        t = from + d * ease(k);
        render();
        if (k < 1) anim = requestAnimationFrame(step); else { t = to; live = true; render(); }
      })(start);
    }, delay);
  }

  // drag the hour hand: the change in angle moves time (one turn = 12 hours),
  // so passing 12 flips AM/PM; the minute hand follows
  const angleAt = e => {
    const r = svg.getBoundingClientRect();
    return Math.atan2((e.clientY - r.top) / r.height * 240 - C, (e.clientX - r.left) / r.width * 240 - C);
  };
  let dragging = false, lastA = 0;
  svg.addEventListener('pointerdown', e => {
    dragging = true; lastA = angleAt(e); svg.setPointerCapture(e.pointerId); touch(); e.preventDefault();
  });
  svg.addEventListener('pointermove', e => {
    if (!dragging) return;
    const a = angleAt(e);
    let d = a - lastA; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
    lastA = a; t = (((t + (d / (2 * Math.PI)) * 720) % 1440) + 1440) % 1440;
    render();
  });
  svg.addEventListener('pointerup', () => { if (!dragging) return; dragging = false; t = Math.round(t / 5) * 5 % 1440; render(); springBack(); });
  hand.addEventListener('keydown', e => {
    const step = { ArrowRight: 15, ArrowUp: 15, ArrowLeft: -15, ArrowDown: -15, PageUp: 60, PageDown: -60 }[e.key];
    if (step == null) return;
    e.preventDefault(); touch(); t = wrap(t + step); render(); springBack();
  });
  box.querySelector('.clock-days').addEventListener('click', e => {
    const b = e.target.closest('[data-day]'); if (!b) return;
    day = +b.dataset.day; render();
  });
  setInterval(() => { if (live) { t = manilaNow().t; render(); } }, 30000);

  // when the summary band arrives, the hand sweeps up from 00 to now
  window.addEventListener('band:in', e => {
    if (!e.detail || !e.detail.animate || reduce) return;
    const to = manilaNow().t, from = 0, startAt = performance.now() + 500, dur = 1100;
    t = from; render();
    (function step(now) {
      const k = Math.max(0, Math.min(1, (now - startAt) / dur));
      t = from + (to - from) * (1 - Math.pow(1 - k, 3));
      render();
      if (k < 1) anim = requestAnimationFrame(step); else { t = to; live = true; render(); }
    })(performance.now());
  });

  render();
})();
