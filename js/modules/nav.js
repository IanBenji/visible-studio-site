/* Header: scrolled/compact state, hide on scroll-down, active section, timecode +
   playhead progress, and the animated, accessible mobile menu. */
import { $, $$, timecode, prefersReduced } from './utils.js';
import { lenis, stopScroll, startScroll, scrollState } from './scroll.js';

const { gsap, ScrollTrigger } = window;

export function initNav() {
  const header = $('[data-header]');
  const tcEl = $('[data-timecode]');
  let lastY = 0;

  // Scroll state + "timecode" readout (1 viewport ≈ 4 seconds of footage)
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    header.classList.toggle('is-scrolled', y > 40);
    const goingDown = y > lastY && y > window.innerHeight * 0.8;
    if (scrollState.programmatic) header.classList.remove('is-hidden');
    else if (!document.body.classList.contains('menu-open') && !header.matches(':focus-within')) {
      header.classList.toggle('is-hidden', goingDown && Math.abs(y - lastY) > 2);
    }
    lastY = y;
    if (tcEl) tcEl.textContent = timecode((y / window.innerHeight) * 4);
  };
  if (lenis) lenis.on('scroll', onScroll);
  else window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active section highlight
  $$('[data-nav]').forEach((link) => {
    const section = document.getElementById(link.dataset.nav);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        link.classList.toggle('is-active', self.isActive);
        if (self.isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      },
    });
  });

  initMobileMenu();
}

function initMobileMenu() {
  const btn = $('.nav__burger');
  const menu = $('#mobile-menu');
  if (!btn || !menu) return;
  const links = $$('.mmenu__links a', menu);
  let open = false;
  let tl;

  const focusables = () => [btn, ...$$('a, button', menu)];

  const show = () => {
    open = true;
    menu.hidden = false;
    document.body.classList.add('menu-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    stopScroll();
    tl && tl.kill();
    if (prefersReduced()) {
      gsap.set('.mmenu__bg', { clipPath: 'circle(150% at calc(100% - 2.6rem) 2.4rem)' });
    } else {
      tl = gsap.timeline()
        .to('.mmenu__bg', { clipPath: 'circle(150% at calc(100% - 2.6rem) 2.4rem)', duration: 0.9, ease: 'expo.inOut' })
        .from(links, { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, 0.35)
        .from('.mmenu__foot', { autoAlpha: 0, y: 20, duration: 0.6 }, 0.6);
    }
    links[0].focus({ preventScroll: true });
  };

  const hide = (returnFocus = true) => {
    if (!open) return;
    open = false;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    tl && tl.kill();
    const done = () => {
      menu.hidden = true;
      document.body.classList.remove('menu-open');
      gsap.set([links, '.mmenu__foot'], { clearProps: 'all' });
    };
    startScroll();
    if (prefersReduced()) done();
    else gsap.to('.mmenu__bg', { clipPath: 'circle(0% at calc(100% - 2.6rem) 2.4rem)', duration: 0.7, ease: 'expo.inOut', onComplete: done });
    gsap.to([links, '.mmenu__foot'], { autoAlpha: 0, duration: 0.25 });
    if (returnFocus) btn.focus({ preventScroll: true });
  };

  btn.addEventListener('click', () => (open ? hide() : show()));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) hide(false); // anchor scrolling handled globally
  });
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'Tab') {
      const f = focusables();
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  window.matchMedia('(min-width: 960px)').addEventListener('change', (e) => e.matches && hide(false));
}
