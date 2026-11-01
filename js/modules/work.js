/* ==========================================================================
   Work — every project as a clear 16:9 video card with an always-visible
   "Watch" button. The card nearest the middle of the screen plays its muted
   preview; clicking opens the project with the video already playing.
   Filtering is animated with GSAP Flip and deep-linkable (#work/<category>).
   ========================================================================== */
import { $, $$, esc, prefersReduced, formatsOf } from './utils.js';
import { icon } from '../icons.js';
import { PROJECTS, CATEGORIES } from '../data.js';

const { gsap, ScrollTrigger, Flip } = window;

export const catOf = (p) => CATEGORIES.find((c) => c.key === p.category) || { label: p.category, short: '', filter: p.category, color: 'var(--violet)' };

/** Poster + preview for a given shape: the matching format's own, else the project's when the shape matches. */
export function mediaFor(p, aspect) {
  const f = formatsOf(p).find((x) => x.aspect === aspect);
  const same = p.aspect === aspect;
  return {
    format: f,
    poster: f?.poster || p.poster,
    preview: f?.preview || (same ? p.preview : ''),
  };
}

function cardHTML(p) {
  const cat = catOf(p);
  const formats = formatsOf(p);
  // No 16:9 cut (e.g. a Reel-only project): show the whole video, uncropped, over a blurred backdrop
  const tall = !formats.some((f) => f.aspect === '16:9');
  const media = mediaFor(p, tall ? formats[0].aspect : '16:9');
  const duration = (media.format || formats[0]).duration;
  return `
  <article class="card" data-slug="${esc(p.slug)}" data-cat="${esc(p.category)}" style="--c:${cat.color}">
    <a class="card__link" href="#/project/${esc(p.slug)}" data-hover-host aria-label="Watch: ${esc(p.title)} (${esc(cat.label)})">
      <div class="card__media${tall ? ' card__media--tall' : ''}" data-media>
        ${tall && p.backdrop ? `<img class="card__bg" src="${esc(p.backdrop)}" alt="" loading="lazy" decoding="async">` : ''}
        <img src="${esc(media.poster)}" alt="" loading="lazy" decoding="async">
        ${media.preview ? `<video muted playsinline loop preload="none" data-lazy-src="${esc(media.preview)}" data-mode="view"></video>` : ''}
        <span class="card__watch" aria-hidden="true">
          <span class="card__play">${icon('play', { size: 22, stroke: 0 })}</span>
          <span class="card__watch-label">Watch${duration ? ` · ${esc(duration)}` : ''}</span>
        </span>
        <span class="card__formats" aria-hidden="true">${formats.map((f) => `<span>${esc(f.label)} ${esc(f.aspect)}</span>`).join('')}</span>
        ${p.placeholder ? '<span class="badge-demo">Demo media</span>' : ''}
      </div>
      <div class="card__meta">
        <p class="card__cat">${esc(cat.label)}</p>
        <h3 class="card__title">${esc(p.title)}</h3>
        <p class="card__desc">${esc(p.summary)}</p>
      </div>
    </a>
  </article>`;
}

export function initWork() {
  const grid = $('[data-work-grid]');
  const filtersEl = $('[data-filters]');
  const status = $('[data-filter-status]');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map(cardHTML).join('');
  const cards = $$('.card', grid);

  // Filters (only categories that have projects, plus All)
  const used = new Set(PROJECTS.map((p) => p.category));
  const cats = CATEGORIES.filter((c) => used.has(c.key));
  filtersEl.innerHTML =
    `<button class="chip" type="button" data-filter="all" aria-pressed="true">All</button>` +
    cats.map((c) => `<button class="chip" type="button" data-filter="${c.key}" aria-pressed="false" style="--c:${c.color}"><span class="chip__dot"></span>${esc(c.filter || c.label)}</button>`).join('');

  let current = 'all';
  const apply = (key, { animate = true, updateHash = true } = {}) => {
    if (!cats.some((c) => c.key === key)) key = 'all';
    if (key === current && animate) return;
    current = key;
    $$('[data-filter]', filtersEl).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));

    const state = animate && !prefersReduced() ? Flip.getState(cards, { props: 'opacity' }) : null;
    cards.forEach((c) => (c.hidden = key !== 'all' && c.dataset.cat !== key));
    const shown = cards.filter((c) => !c.hidden).length;
    grid.classList.toggle('is-empty', shown === 0);
    status.textContent = `Showing ${shown} video${shown === 1 ? '' : 's'}${key === 'all' ? '' : ' in ' + cats.find((c) => c.key === key).label}.`;

    if (state) {
      Flip.from(state, {
        duration: 0.7,
        ease: 'expo.inOut',
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'expo.out' }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.95, duration: 0.3, ease: 'power2.in' }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    } else {
      ScrollTrigger.refresh();
    }
    if (updateHash) history.replaceState(null, '', key === 'all' ? '#work' : `#work/${key}`);
  };

  filtersEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (b) apply(b.dataset.filter);
  });

  // Deep link: #work/<category>
  const m = location.hash.match(/^#work\/([\w-]+)/);
  if (m) apply(m[1], { animate: false, updateHash: false });

  injectStructuredData();
  return { apply };
}

/** One gentle reveal per card (kept light on purpose). */
export function workScroll() {
  if (prefersReduced()) return;
  $$('.card').forEach((c) => {
    gsap.from(c, { autoAlpha: 0, y: 40, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 92%', once: true } });
  });
}

function injectStructuredData() {
  const base = location.origin + location.pathname.replace(/index\.html$/, '');
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Selected work',
    itemListElement: PROJECTS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: p.title,
        genre: catOf(p).label,
        description: p.summary,
        url: `${base}#/project/${p.slug}`,
        image: base + p.poster,
      },
    })),
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
}
