/* Footer: live clock, year, edge-to-edge wordmark, rewind-to-top. */
import { $, $$, prefersReduced } from './utils.js';
import { SITE } from '../data.js';
import { scrollToTarget } from './scroll.js';

const { gsap } = window;

export function initFooter() {
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  $$('[data-location]').forEach((el) => (el.textContent = SITE.location));

  const clock = $('[data-clock]');
  const fmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: SITE.timezone });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 1000);

  // Fit the wordmark to the full width
  const mark = $('[data-footer-mark]');
  mark.textContent = SITE.shortName;
  const fit = () => {
    mark.style.setProperty('--mark-size', '100px');
    const avail = mark.parentElement.clientWidth - parseFloat(getComputedStyle(mark.parentElement).paddingLeft) * 2;
    const w = mark.scrollWidth;
    if (w) mark.style.setProperty('--mark-size', `${(100 * avail) / w}px`);
  };
  fit();
  document.fonts?.ready.then(fit);
  window.addEventListener('resize', fit);

  $('[data-rewind]').addEventListener('click', () => {
    scrollToTarget($('#top'), { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
  });
}

export function footerScroll() {
  if (prefersReduced()) return;
  gsap.from('[data-footer-mark]', {
    yPercent: 70,
    duration: 1.2,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.footer__mark', start: 'top 95%', once: true },
  });
}
