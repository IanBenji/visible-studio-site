/* Process: four steps along a simple timeline line (a row on desktop, stacked on mobile). */
import { $, esc, pad2, timecode, prefersReduced } from './utils.js';
import { PROCESS } from '../data.js';

const { gsap } = window;
const COLORS = ['var(--violet)', 'var(--cobalt)', 'var(--orange)', 'var(--lime)'];
const TOTAL_SECONDS = 60; // used for the "IN" timecode when a step has none

export function initProcess() {
  const steps = $('[data-process]');
  if (!steps) return;
  steps.innerHTML = PROCESS.map((s, i) => `
    <li class="step" style="--c:${COLORS[i % COLORS.length]}">
      <span class="step__num">${pad2(i + 1)}</span>
      <h3 class="step__title">${esc(s.title)}</h3>
      <p class="step__text">${esc(s.text)}</p>
      <span class="step__tc">IN ${esc(s.tc || timecode((TOTAL_SECONDS / PROCESS.length) * i))}</span>
    </li>`).join('');
}

export function processScroll() {
  if (prefersReduced()) return;
  gsap.from('.step', {
    autoAlpha: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.steps', start: 'top 85%', once: true },
  });
}
