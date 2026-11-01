/* Magnetic buttons (desktop, fine pointer, motion allowed).
   The custom cursor was removed so play buttons are never hidden behind it. */
import { isFinePointer, prefersReduced } from './utils.js';

const { gsap } = window;

export function initMagnetic(root = document) {
  if (!isFinePointer() || prefersReduced()) return;
  root.querySelectorAll('[data-magnetic]').forEach((el) => {
    if (el.dataset.magInit) return;
    el.dataset.magInit = '1';
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    const strength = parseFloat(el.dataset.magnetic) || 0.3;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}
