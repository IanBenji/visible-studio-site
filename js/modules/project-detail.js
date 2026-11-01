/* ==========================================================================
   Project detail overlay + hash router.
   URL: #/project/<slug>  — shareable, works with back/forward, deep-linkable.
   Opens with a clip-path expansion from the clicked tile's media.
   ========================================================================== */
import { $, $$, esc, pad2, cssAspect, prefersReduced, formatsOf, formatKey } from './utils.js';
import { icon } from '../icons.js';
import { PROJECTS, CATEGORIES } from '../data.js';
import { createPlayer } from './player.js';
import { pauseAll } from './video-manager.js';
import { stopScroll, startScroll, scrollToTarget } from './scroll.js';
import { catOf } from './work.js';

const { gsap } = window;

let root, panel, player, current = null, formatIndex = 0, lastFocus = null, navigatedInside = false, originMedia = null;
const baseTitle = document.title;

function related(p) {
  const others = PROJECTS.filter((x) => x !== p);
  const same = others.filter((x) => x.category === p.category);
  const i = PROJECTS.indexOf(p);
  const rest = others.filter((x) => !same.includes(x)).sort((a, b) => {
    // nearest neighbours in the list first
    const da = Math.abs(PROJECTS.indexOf(a) - i), db = Math.abs(PROJECTS.indexOf(b) - i);
    return da - db;
  });
  return [...same, ...rest].slice(0, 2);
}

function detailHTML(p) {
  const cat = catOf(p);
  const i = PROJECTS.indexOf(p);
  const num = pad2(i + 1);
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const formats = formatsOf(p);
  const facts = [
    ['Category', cat.label],
    p.client && ['Client', p.client],
    p.year && ['Year', p.year],
    ['Formats', formats.map((f) => `${f.label} ${f.aspect}`).join(' · ')],
    p.deliverables?.length && ['Deliverables', `${p.deliverables.length} formats`],
  ].filter(Boolean);

  return `
    <div class="pd__bar">
      <p class="pd__crumb label"><i class="rec-dot"></i> Clip ${num} / ${esc(cat.short)}</p>
      <button class="pd__close" type="button" data-project-close><span>Close</span><span>${icon('x', { size: 18 })}</span></button>
    </div>
    <article class="pd" style="--c:${cat.color}">
      <header class="pd__head wrap">
        <p class="pd__cat label">${esc(cat.label)}</p>
        <h2 class="pd__title" id="project-title">${esc(p.title)}</h2>
      </header>

      ${formats.length > 1 ? `
      <div class="wrap pd__formats" role="group" aria-labelledby="pd-watch-as">
        <span class="pd__formats-label label" id="pd-watch-as">Watch as</span>
        ${formats.map((f, fi) => `
          <button class="fmt" type="button" data-format="${fi}" aria-pressed="false">
            <span class="fmt__shape" style="aspect-ratio:${cssAspect(f.aspect)}" aria-hidden="true"></span>
            <span>${esc(f.label)}</span><span class="fmt__ratio">${esc(f.aspect)}</span>
          </button>`).join('')}
      </div>` : ''}
      <div class="wrap pd__player-wrap" data-pd-player></div>

      <div class="wrap">
        <p class="pd__summary">${esc(p.summary)}</p>
        <dl class="pd__facts">
          ${facts.map(([k, v]) => `<div><dt class="label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>

        <div class="pd__body">
          <section><h3>Overview</h3><p>${esc(p.overview)}</p></section>
          <section><h3>Creative approach</h3><p>${esc(p.approach)}</p></section>
          <section>
            <h3>Services demonstrated</h3>
            <ul class="pd__services">${(p.services || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          </section>
          <section>
            <h3>Delivered as</h3>
            <ul class="pd__deliver">${(p.deliverables || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          </section>
        </div>

        ${p.gallery?.length ? `
        <div class="pd__section-label"><p class="label">Additional media</p><p class="label">${pad2(p.gallery.length)} items</p></div>
        <div class="pd__gallery" tabindex="0" aria-label="Additional media (scrollable)">
          ${p.gallery.map((g) => g.type === 'video'
            ? `<figure style="aspect-ratio:${cssAspect(g.aspect)}"><video src="${esc(g.src)}" muted loop playsinline controls preload="metadata" style="height:100%;width:auto"></video><figcaption>${esc(g.aspect)}</figcaption></figure>`
            : `<figure style="aspect-ratio:${cssAspect(g.aspect)}"><img src="${esc(g.src)}" alt="${esc(g.alt || p.title)}" loading="lazy" decoding="async"><figcaption>${esc(g.aspect)}</figcaption></figure>`).join('')}
        </div>` : ''}

        <div class="pd__section-label"><p class="label">Related projects</p></div>
        <div class="pd__related">
          ${related(p).map((r) => `
            <a class="rel" href="#/project/${esc(r.slug)}" style="--c:${catOf(r).color}">
              <img src="${esc(r.poster)}" alt="" loading="lazy">
              <div><p class="label">${esc(catOf(r).label)}</p><h4>${esc(r.title)}</h4></div>
            </a>`).join('')}
        </div>

        <div class="pd__cta">
          <p class="label" style="color:rgba(16,16,20,.7)">Next scene: yours</p>
          <h3>Have a project like this? <em class="serif-em">Let's talk.</em></h3>
          <a class="btn btn--ink" href="#contact" data-pd-contact><span class="btn__label">Start a Project</span><span class="btn__icon">${icon('arrow-up-right', { size: 16 })}</span></a>
        </div>

        <nav class="pd__nav" aria-label="More projects">
          <a href="#/project/${esc(prev.slug)}"><span class="label">← Previous</span><strong>${esc(prev.title)}</strong></a>
          <a href="#/project/${esc(next.slug)}"><span class="label">Next →</span><strong>${esc(next.title)}</strong></a>
        </nav>
      </div>
    </article>`;
}

/** The card the project was opened from (work grid or Reels row), else its work card. */
function originFor(slug) {
  if (originMedia?.closest(`[data-slug="${CSS.escape(slug)}"]`)) return originMedia;
  return $(`.card[data-slug="${CSS.escape(slug)}"] [data-media]`);
}

function insetFrom(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return null;
  return `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 16px)`;
}

/** Swap the player to another format of the current project. */
function showFormat(i, { autoplay = false } = {}) {
  const p = current;
  const formats = formatsOf(p);
  formatIndex = Math.max(0, Math.min(i, formats.length - 1));
  const f = formats[formatIndex];
  if (player) { player.destroy(); player = null; }
  player = createPlayer({
    title: `${p.title} (${f.label} ${f.aspect})`,
    poster: f.poster || p.poster,
    video: f.video,
    aspect: f.aspect,
    placeholder: p.placeholder,
  });
  const host = $('[data-pd-player]', panel);
  host.replaceChildren(player.el);
  $$('[data-format]', panel).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.format) === formatIndex)));
  if (autoplay) player.play();
}

function open(slug, { fromTile = true, format = '', autoplay = false } = {}) {
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) return close();
  const switching = Boolean(current);
  current = p;

  if (player) { player.destroy(); player = null; }
  panel.innerHTML = detailHTML(p);
  panel.scrollTop = 0;
  showFormat(Math.max(0, formatsOf(p).findIndex((f) => formatKey(f) === format)), { autoplay });
  document.title = `${p.title} — ${baseTitle.split(' — ')[0]}`;

  if (!switching) {
    lastFocus = document.activeElement;
    pauseAll();
    stopScroll();
    root.hidden = false;
    document.body.classList.add('project-open');
    const from = fromTile ? insetFrom(originFor(slug)) : null;
    if (!prefersReduced()) {
      gsap.timeline()
        .fromTo('.project__backdrop', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 })
        .fromTo(panel, { clipPath: from || 'inset(100% 0% 0% 0% round 0px)' }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1, ease: 'expo.inOut' }, 0)
        .from($$('.pd__head > *, .pd__player-wrap', panel), { y: 50, autoAlpha: 0, duration: 1, stagger: 0.07, ease: 'expo.out' }, 0.55);
    }
  } else if (!prefersReduced()) {
    gsap.from($$('.pd__head > *, .pd__player-wrap', panel), { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out' });
  }
  $('.pd__close', panel).focus({ preventScroll: true });
}

function close() {
  if (!current) return;
  const slug = current.slug;
  current = null;
  document.title = baseTitle;
  const finish = () => {
    if (player) { player.destroy(); player = null; }
    root.hidden = true;
    panel.innerHTML = '';
    document.body.classList.remove('project-open');
    gsap.set([panel, '.project__backdrop'], { clearProps: 'all' });
  };
  startScroll();
  const tileMedia = originFor(slug);
  const to = insetFrom(tileMedia);
  if (prefersReduced()) finish();
  else {
    gsap.timeline({ onComplete: finish })
      .to(panel, { clipPath: to || 'inset(100% 0% 0% 0% round 0px)', duration: 0.8, ease: 'expo.inOut' })
      .to('.project__backdrop', { autoAlpha: 0, duration: 0.4 }, 0.4);
  }
  const focusTarget = tileMedia?.closest('a') || lastFocus;
  focusTarget?.focus?.({ preventScroll: true });
}

function route() {
  const m = location.hash.match(/^#\/project\/([\w-]+)(?:\/([\w-]+))?/);
  // A click inside the site starts the video with sound; a deep link on page load waits for Play.
  if (m) open(m[1], { fromTile: true, format: m[2] || '', autoplay: navigatedInside });
  else if (current) close();
}

/** Close via UI: go back if we navigated here inside the site, else clean the URL. */
function requestClose() {
  if (navigatedInside) history.back();
  else {
    history.replaceState(null, '', location.pathname + location.search);
    close();
  }
}

export function initProjects() {
  root = $('[data-project]');
  panel = $('[data-project-panel]');
  if (!root) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Remember which card was clicked so the page opens out of (and closes back into) it
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#/project/"]');
    if (a && !root.contains(a)) originMedia = a.querySelector('[data-media]');
  }, true);

  window.addEventListener('hashchange', () => {
    navigatedInside = true;
    route();
  });

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-project-close]')) { e.preventDefault(); requestClose(); return; }
    // Format switch (YouTube 16:9 / Reel 9:16 / …): keeps playing if it was playing,
    // and updates the URL so a specific format can be shared (#/project/<slug>/reel).
    const fmt = e.target.closest('[data-format]');
    if (fmt) {
      const i = Number(fmt.dataset.format);
      if (i === formatIndex) return;
      const wasPlaying = player && !player.video.paused;
      showFormat(i, { autoplay: wasPlaying });
      if (!prefersReduced()) gsap.from(player.el, { autoAlpha: 0, y: 16, duration: 0.5, ease: 'power3.out' });
      const f = formatsOf(current)[i];
      history.replaceState(null, '', `#/project/${current.slug}${i ? `/${formatKey(f)}` : ''}`);
      return;
    }
    // Switching project inside the overlay replaces the history entry,
    // so "close" / back always returns to the page in one step.
    const projLink = e.target.closest('a[href^="#/project/"]');
    if (projLink) {
      e.preventDefault();
      history.replaceState(null, '', projLink.getAttribute('href'));
      const [, slug, format = ''] = projLink.getAttribute('href').match(/^#\/project\/([\w-]+)(?:\/([\w-]+))?/) || [];
      open(slug, { fromTile: false, format, autoplay: true });
      return;
    }
    const contact = e.target.closest('[data-pd-contact]');
    if (contact) {
      e.preventDefault();
      e.stopPropagation();
      requestClose();
      setTimeout(() => scrollToTarget($('#contact')), prefersReduced() ? 0 : 650);
    }
  });

  // Focus trap + Esc
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); requestClose(); }
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled]), input, video[controls], [tabindex]:not([tabindex="-1"])', panel).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Deep link on load
  if (/^#\/project\//.test(location.hash)) route();
}
