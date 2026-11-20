// Lion's homepage, scenes one and two: the introduction pins in place for a
// stretch of scrolling. Under the eyebrow and name, "Currently" and the links
// fade out completely, and only then does "Previously" fade into the same spot.
(function () {
  const stack = document.querySelector('.intro-stack');
  if (!stack) return;
  const [now, then] = stack.querySelectorAll('.intro-block');
  const wide = matchMedia('(min-width: 761px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => x * x * (3 - 2 * x);
  let raf = 0;

  function update() {
    raf = 0;
    if (!wide.matches) { [now, then].forEach(b => { b.style.opacity = ''; b.style.transform = ''; }); return; }
    const r = stack.getBoundingClientRect();
    const travel = Math.max(1, r.height - (innerHeight - 56));
    const p = clamp((56 - r.top) / travel);                 // 0 at the top … 1 when the stretch is done
    const out = smooth(clamp((p - 0.25) / 0.2));            // Currently leaves …
    const inn = smooth(clamp((p - 0.5) / 0.2));             // … and only then Previously arrives
    now.style.opacity = (1 - out).toFixed(3);
    then.style.opacity = inn.toFixed(3);
    if (!reduce) {
      now.style.transform = `translateY(${(-18 * out).toFixed(1)}px)`;
      then.style.transform = `translateY(${(18 * (1 - inn)).toFixed(1)}px)`;
    }
    now.style.visibility = out >= 1 ? 'hidden' : '';
    then.style.visibility = inn <= 0 ? 'hidden' : '';
  }
  const ask = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', ask);
  update();
})();
