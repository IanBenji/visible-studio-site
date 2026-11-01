/* Hero: a short headline and the showreel, visible without scrolling.
   The reel plays a muted preview loop; the big "Watch showreel" button plays
   the full version with sound in place. */
import { $, $$, isFinePointer, prefersReduced } from './utils.js';
import { createPlayer } from './player.js';
import { SITE } from '../data.js';

const { gsap } = window;

export function renderHero() {
  const host = $('[data-reel-player]');
  const box = $('[data-showreel]');
  if (!host || !SITE.showreel) return;
  const r = SITE.showreel;

  // Decorative muted loop underneath the player (managed by video-manager.js)
  const prev = document.createElement('video');
  prev.className = 'showreel__preview';
  prev.muted = true;
  prev.playsInline = true;
  prev.loop = true;
  prev.preload = 'none';
  prev.poster = r.poster;
  prev.dataset.lazySrc = r.preview;
  prev.dataset.mode = 'autoplay';
  host.appendChild(prev);

  const player = createPlayer({
    title: `${SITE.name} showreel`,
    video: r.video,
    aspect: '16:9',
    placeholder: r.placeholder,
    fill: true,
    label: 'Watch showreel — with sound',
  });
  player.video.style.opacity = '0';
  host.appendChild(player.el);
  if (r.placeholder) $('[data-reel-note]').textContent = 'Demo reel — replace in js/data.js';

  player.video.addEventListener('play', () => {
    box.classList.add('is-playing');
    player.video.style.opacity = '1';
  });
  player.video.addEventListener('pause', () => box.classList.remove('is-playing'));
  return player;
}

/** Entrance timeline — called once fonts are ready. */
export function heroEntrance() {
  $('.hero').classList.add('is-ready');
  if (prefersReduced()) {
    gsap.from('.hero', { autoAlpha: 0, duration: 0.6 });
    return;
  }
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero__line-inner', { yPercent: 115, duration: 1, stagger: 0.08 })
    .from('.hero__intro .label, .hero__side > *', { autoAlpha: 0, y: 20, duration: 0.8, stagger: 0.06 }, 0.2)
    .from('.editor', { autoAlpha: 0, y: 30, duration: 1 }, 0.1)
    .fromTo('.showreel', { clipPath: 'inset(6% 6% 6% 6% round 18px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.1, clearProps: 'clipPath',
    }, 0.2)
    // the edit assembles itself: clips drop onto the timeline, then the playhead appears
    .from('.tl__clip, .tl__chip', { autoAlpha: 0, y: -16, duration: 0.5, stagger: 0.06, ease: 'back.out(1.6)', clearProps: 'transform,opacity,visibility' }, 0.55)
    .from('.tl__wave', { scaleY: 0, duration: 0.6, ease: 'power2.out' }, 0.7)
    .from('.tl__playhead', { autoAlpha: 0, duration: 0.4 }, 1.2)
    .from('.blob', { autoAlpha: 0, duration: 1.6, stagger: 0.15, ease: 'power2.out' }, 0)
    .from('.header .nav', { autoAlpha: 0, y: -20, duration: 0.8 }, 0.3);
  return tl;
}

/** Soft mouse depth on the background glows (desktop only). */
export function initHeroMotion() {
  if (prefersReduced() || !isFinePointer()) return;
  const layers = $$('.hero [data-depth]').map((el) => ({
    d: parseFloat(el.dataset.depth),
    x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }),
    y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3' }),
  }));
  const hero = $('.hero');
  hero.addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    layers.forEach((l) => { l.x(nx * 40 * l.d); l.y(ny * 30 * l.d); });
  });
  hero.addEventListener('pointerleave', () => layers.forEach((l) => { l.x(0); l.y(0); }));
}
