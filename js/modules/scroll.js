/* Lenis smooth scrolling, synced with GSAP ScrollTrigger (official integration pattern). */
import { prefersReduced } from './utils.js';

export let lenis = null;
/** true while a link-triggered scroll is animating (header stays visible) */
export const scrollState = { programmatic: false };

export function initScroll() {
  const { gsap, ScrollTrigger, Lenis } = window;

  if (!prefersReduced() && typeof Lenis === 'function') {
    lenis = new Lenis({
      lerp: 0.16, // higher = snappier, less "floaty"
      wheelMultiplier: 1,
      smoothWheel: true,
      // touch devices keep native momentum scrolling
      syncTouch: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // In-page anchors → smooth scroll (works with or without Lenis)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2 || id.startsWith('#/')) return; // "#/project/..." handled by router
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });
}

export function scrollToTarget(target, opts = {}) {
  if (lenis) {
    scrollState.programmatic = true;
    lenis.scrollTo(target, { duration: 1.4, ...opts, onComplete: () => (scrollState.programmatic = false) });
    setTimeout(() => (scrollState.programmatic = false), ((opts.duration || 1.4) + 0.5) * 1000);
  } else {
    const el = typeof target === 'number' ? null : target;
    window.scrollTo({ top: el ? el.getBoundingClientRect().top + window.scrollY : target, behavior: prefersReduced() ? 'auto' : 'smooth' });
  }
  // move focus for keyboard / screen reader users without jumping
  if (target instanceof HTMLElement && !opts.keepFocus) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}

export const stopScroll = () => {
  lenis && lenis.stop();
  document.documentElement.style.overflow = 'hidden';
};
export const startScroll = () => {
  lenis && lenis.start();
  document.documentElement.style.overflow = '';
};
