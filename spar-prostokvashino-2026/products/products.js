(() => {
  const root = document.getElementById('spar-products');
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';
  const track = root.querySelector('.spar-products__track');
  const prev = root.querySelector('.spar-products__prev');
  const next = root.querySelector('.spar-products__next');
  const status = root.querySelector('.spar-products__status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const edgeTolerance = 2;
  const cards = Array.from(track.children);
  const stride = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
  const update = () => {
    const maximum = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= edgeTolerance;
    next.disabled = track.scrollLeft >= maximum - edgeTolerance;
    const first = Math.round(track.scrollLeft / stride()) + 1;
    const visible = Math.max(1, Math.round((track.clientWidth + parseFloat(getComputedStyle(track).columnGap)) / stride()));
    status.textContent = `Товары ${first}–${Math.min(cards.length, first + visible - 1)} из ${cards.length}`;
  };
  const move = direction => track.scrollBy({left: direction * stride(), behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); track.scrollTo({left:event.key === 'Home' ? 0 : track.scrollWidth,behavior:reducedMotion.matches ? 'instant' : 'smooth'});
    }
  });
  let scrollTimer;
  track.addEventListener('scroll', () => {clearTimeout(scrollTimer);scrollTimer = setTimeout(update, 100);}, {passive:true});
  new ResizeObserver(update).observe(track);
  update();
})();