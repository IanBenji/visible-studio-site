/* ==========================================================================
   Boot sequence
   1. render content from js/data.js   2. smooth scroll + nav
   3. lazy video system                4. scroll animations (one-time reveals)
   5. router (project deep links)      6. hero entrance
   ========================================================================== */
import { SITE } from './data.js';
import { hydrateIcons } from './icons.js';
import { $$, prefersReduced } from './modules/utils.js';
import { initScroll } from './modules/scroll.js';
import { initNav } from './modules/nav.js';
import { initMagnetic } from './modules/magnetic.js';
import { registerVideos } from './modules/video-manager.js';
import { initReveals } from './modules/reveal.js';
import { renderHero, heroEntrance, initHeroMotion } from './modules/hero.js';
import { initTimeline } from './modules/timeline.js';
import { initWork, workScroll } from './modules/work.js';
import { initReels, reelsScroll } from './modules/reels.js';
import { initProjects } from './modules/project-detail.js';
import { initServices, servicesScroll } from './modules/services.js';
import { initProcess, processScroll } from './modules/process.js';
import { initContactDetails, initContactForm } from './modules/contact.js';
import { initFooter, footerScroll } from './modules/footer.js';

const { gsap, ScrollTrigger, SplitText, Flip } = window;
gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
gsap.defaults({ ease: 'power3.out' });

// Studio name everywhere it appears
$$('[data-site-name]').forEach((el) => (el.textContent = SITE.name));
$$('[data-site-short]').forEach((el) => (el.textContent = SITE.shortName));

// 1. Content
renderHero();
initTimeline();
initWork();
initReels();
initServices();
initProcess();
initContactDetails();
initContactForm();
initFooter();
hydrateIcons();

// 2. Chrome
initScroll();
initNav();
initMagnetic();

// 3. Media
registerVideos();

// 4. Scroll animations
initReveals();
workScroll();
reelsScroll();
servicesScroll();
processScroll();
footerScroll();

// 5. Router
initProjects();

// 6. Entrance — runs once fonts are ready so SplitText/line metrics are correct.
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
fontsReady.then(() => {
  ScrollTrigger.refresh();
  heroEntrance();
  initHeroMotion();
});

// Keep ScrollTrigger measurements correct once images/media have loaded
window.addEventListener('load', () => ScrollTrigger.refresh());
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
});

if (prefersReduced()) document.documentElement.classList.add('reduced-motion');
