/* Reels & Shorts — a sideways row of phone-shaped 9:16 videos, one per project.
   Hover plays the muted loop (desktop); clicking opens the project already
   playing its Reel version (#/project/<slug>/<format>). */
import { $, esc, prefersReduced, formatsOf, formatKey } from './utils.js';
import { icon } from '../icons.js';
import { PROJECTS } from '../data.js';
import { catOf, mediaFor } from './work.js';

const { gsap } = window;

export function initReels() {
  const track = $('[data-reels]');
  if (!track) return;
  const items = PROJECTS.map((p) => ({ p, m: mediaFor(p, '9:16') })).filter((x) => x.m.format);

  track.innerHTML = items.map(({ p, m }) => {
    const i = formatsOf(p).indexOf(m.format);
    const href = `#/project/${p.slug}${i ? `/${formatKey(m.format)}` : ''}`;
    return `
    <div class="rcard" role="listitem" data-slug="${esc(p.slug)}" style="--c:${catOf(p).color}">
      <a class="rcard__link" href="${esc(href)}" data-hover-host aria-label="Watch the Reel: ${esc(p.title)}">
        <div class="rcard__phone" data-media>
          <img src="${esc(m.poster)}" alt="" loading="lazy" decoding="async">
          ${m.preview ? `<video muted playsinline loop preload="none" data-lazy-src="${esc(m.preview)}" data-mode="hover"></video>` : ''}
          <span class="rcard__play" aria-hidden="true">${icon('play', { size: 20, stroke: 0 })}</span>
          <span class="rcard__badge" aria-hidden="true">${esc(m.format.label)} ${esc(m.format.aspect)}</span>
          ${p.placeholder ? '<span class="badge-demo">Demo</span>' : ''}
        </div>
        <p class="rcard__cat">${esc(catOf(p).filter || catOf(p).label)}</p>
        <h3 class="rcard__title">${esc(p.title)}</h3>
      </a>
    </div>`;
  }).join('');

  // Arrow buttons scroll by roughly one screen of cards
  const step = () => Math.max(track.clientWidth * 0.8, 240);
  const go = (dir) => track.scrollBy({ left: dir * step(), behavior: prefersReduced() ? 'auto' : 'smooth' });
  $('[data-reels-prev]')?.addEventListener('click', () => go(-1));
  $('[data-reels-next]')?.addEventListener('click', () => go(1));
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    $('[data-reels-prev]').disabled = track.scrollLeft <= 2;
    $('[data-reels-next]').disabled = track.scrollLeft >= max;
  };
  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
}

export function reelsScroll() {
  if (prefersReduced()) return;
  gsap.from('.rcard', {
    autoAlpha: 0, x: 60, duration: 0.9, ease: 'power3.out', stagger: 0.06,
    scrollTrigger: { trigger: '[data-reels]', start: 'top 85%', once: true },
  });
}
