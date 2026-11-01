/* ==========================================================================
   Reusable scroll-reveal system, driven by data attributes so new content
   animates without new JavaScript:

     data-anim="lines"    → SplitText line-mask rise
     data-anim="type"     → mono label (shown as-is; kept as a hook)
     data-anim="fade"     → soft fade + rise
     data-anim="clip"     → clip-path inset reveal (media)
     data-anim="stagger"  → children stagger in
     data-anim="words"    → soft fade (was a per-word scrub; removed for speed)
     data-anim="parallax" data-speed="0.2" → gentle vertical parallax
   ========================================================================== */
import { $$, prefersReduced } from './utils.js';

const { gsap, ScrollTrigger, SplitText } = window;

export function revealLines(el, opts = {}) {
  const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line-inner', autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.09,
        scrollTrigger: opts.trigger === false ? undefined : { trigger: el, start: 'top 88%', once: true },
        ...opts.vars,
      });
    },
  });
  return split;
}

export function revealFade(el) {
  gsap.from(el, { autoAlpha: 0, y: 30, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
}

export function revealClip(el, opts = {}) {
  gsap.fromTo(
    el,
    { clipPath: 'inset(18% 12% 18% 12% round 24px)' },
    {
      clipPath: 'inset(0% 0% 0% 0% round 0px)',
      duration: 1.5,
      ease: 'expo.out',
      clearProps: 'clipPath',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      ...opts,
    }
  );
}

export function revealStagger(el) {
  gsap.from(el.children, {
    autoAlpha: 0,
    y: 40,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.08,
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  });
}

export function parallax(el) {
  const speed = parseFloat(el.dataset.speed || '0.15');
  gsap.fromTo(el, { yPercent: -speed * 50 }, {
    yPercent: speed * 50,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

const map = { lines: revealLines, fade: revealFade, clip: revealClip, stagger: revealStagger, words: revealFade, parallax };

export function initReveals(root = document) {
  if (prefersReduced()) {
    // Reduced motion: no transforms, just a gentle fade for headings/blocks
    $$('[data-anim]', root).forEach((el) => {
      if (['lines', 'fade', 'stagger', 'clip'].includes(el.dataset.anim)) {
        gsap.from(el, { autoAlpha: 0, duration: 0.6, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
      }
    });
    return;
  }
  $$('[data-anim]', root).forEach((el) => {
    const fn = map[el.dataset.anim];
    if (fn && !el.dataset.animated) {
      el.dataset.animated = '1';
      fn(el);
    }
  });
}
