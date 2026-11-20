// Homepage motion: the left side crossfades between its scenes as you scroll
// (CSS, scroll-driven). This script only starts the clock's sweep (Lion's
// third scene) when that scene comes into view, via the "band:in" event that
// home-clock.js listens for. If the page opens there already, it just shows.
(function () {
  const scene = document.getElementById('clock');
  if (!scene) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fire = animate => window.dispatchEvent(new CustomEvent('band:in', { detail: { animate } }));

  const already = location.hash === '#clock' || scene.getBoundingClientRect().top < innerHeight * 0.6;
  if (reduce || already || !('IntersectionObserver' in window)) { fire(false); return; }

  let done = false;
  const go = () => { if (done) return; done = true; io.disconnect(); removeEventListener('scroll', check); fire(true); };
  const check = () => { if (scene.getBoundingClientRect().top < innerHeight * 0.6) go(); };
  const io = new IntersectionObserver(([e]) => { if (e.intersectionRatio >= 0.4) go(); }, { threshold: [0.4] });
  io.observe(scene);
  addEventListener('scroll', check, { passive: true });
})();
