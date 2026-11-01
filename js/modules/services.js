/* Services: a simple grid of icon, title and one line each. */
import { $, esc, prefersReduced } from './utils.js';
import { icon } from '../icons.js';
import { SERVICES } from '../data.js';

const { gsap } = window;

export function initServices() {
  const list = $('[data-services]');
  if (!list) return;
  list.innerHTML = SERVICES.map((s) => `
    <li class="svc" style="--c:${s.color}">
      <span class="svc__icon" aria-hidden="true">${icon(s.icon, { size: 22 })}</span>
      <h3 class="svc__title">${esc(s.title)}</h3>
      <p class="svc__text">${esc(s.text)}</p>
    </li>`).join('');
}

export function servicesScroll() {
  if (prefersReduced()) return;
  gsap.from('.svc', {
    autoAlpha: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.05,
    scrollTrigger: { trigger: '.svc-grid', start: 'top 85%', once: true },
  });
}
