/* ==========================================================================
   Featured video player — click to play (with sound, only after user action),
   custom accessible controls, scrubbing, mute, fullscreen, keyboard shortcuts.

   createPlayer({ title, poster, video:{mp4,webm}, aspect, placeholder, label })
   label → optional text beside the big play button, e.g. 'Watch showreel'
   → returns { el, play, pause, destroy }
   ========================================================================== */
import { icon } from '../icons.js';
import { esc, sources, clock, cssAspect, ratio } from './utils.js';
import { pauseAll } from './video-manager.js';

const instances = new Set();

export function createPlayer({ title = 'Video', poster = '', video = {}, aspect = '16:9', placeholder = false, fill = false, label = '' }) {
  const el = document.createElement('div');
  const r = ratio(aspect);
  el.className = `player${r < 0.9 ? ' is-portrait' : r < 1.1 ? ' is-square' : ''}`;
  if (!fill) el.style.aspectRatio = cssAspect(aspect);
  el.style.setProperty('--ar', r); // lets CSS cap the width so the box never letterboxes
  el.tabIndex = -1;

  el.innerHTML = `
    <video preload="none" playsinline ${poster ? `poster="${esc(poster)}"` : ''}>${sources(video)}</video>
    ${poster ? `<img class="player__poster" src="${esc(poster)}" alt="" loading="lazy" decoding="async">` : ''}
    <button class="player__big" type="button" aria-label="Play video: ${esc(title)}">
      <span class="player__big-btn">${icon('play', { size: 40, stroke: 0 })}</span>${label ? `<span class="player__big-label">${esc(label)}</span>` : ''}
    </button>
    <div class="player__loading"><span class="player__spinner"></span></div>
    <div class="player__error" role="alert"><strong>Video unavailable</strong><span class="label">Check the file path in js/data.js</span></div>
    ${placeholder ? '<span class="badge-demo"><i class="rec-dot"></i>Demo media — placeholder</span>' : ''}
    <div class="player__bar">
      <button class="player__btn" type="button" data-act="toggle" aria-label="Play">
        ${icon('play', { size: 20, cls: 'icon-play' })}${icon('pause', { size: 20, cls: 'icon-pause' })}
      </button>
      <input class="player__scrub" type="range" min="0" max="1000" step="1" value="0" aria-label="Seek" />
      <span class="player__time" aria-hidden="true">0:00 / 0:00</span>
      <button class="player__btn" type="button" data-act="mute" aria-label="Mute">
        ${icon('volume-2', { size: 20, cls: 'icon-vol' })}${icon('volume-x', { size: 20, cls: 'icon-muted' })}
      </button>
      <button class="player__btn" type="button" data-act="fs" aria-label="Fullscreen">${icon('maximize', { size: 18 })}</button>
    </div>`;

  const v = el.querySelector('video');
  const scrub = el.querySelector('.player__scrub');
  const time = el.querySelector('.player__time');
  const toggleBtn = el.querySelector('[data-act="toggle"]');
  const muteBtn = el.querySelector('[data-act="mute"]');
  let idleTimer;
  let scrubbing = false;

  const setState = () => {
    const isPlaying = !v.paused && !v.ended;
    el.classList.toggle('is-playing', isPlaying);
    el.classList.toggle('is-muted', v.muted);
    toggleBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    muteBtn.setAttribute('aria-label', v.muted ? 'Unmute' : 'Mute');
  };

  const updateTime = () => {
    const d = v.duration || 0;
    const p = d ? (v.currentTime / d) * 100 : 0;
    if (!scrubbing) scrub.value = Math.round(p * 10);
    scrub.style.setProperty('--p', p + '%');
    if (v.buffered.length && d) scrub.style.setProperty('--b', (v.buffered.end(v.buffered.length - 1) / d) * 100 + '%');
    time.textContent = `${clock(v.currentTime)} / ${clock(d)}`;
    scrub.setAttribute('aria-valuetext', `${clock(v.currentTime)} of ${clock(d)}`);
  };

  const play = () => {
    // pause any other featured player and all decorative previews
    instances.forEach((i) => i !== api && i.pause());
    pauseAll();
    if (v.preload === 'none') v.preload = 'auto';
    el.classList.add('is-started');
    const p = v.play();
    if (p && p.catch) {
      p.catch(() => {
        // autoplay with sound blocked (rare after a click) → retry muted
        v.muted = true;
        v.play().catch(() => {});
      });
    }
  };
  const pause = () => v.pause();
  const toggle = () => (v.paused || v.ended ? play() : pause());

  const fullscreen = () => {
    if (document.fullscreenElement) return document.exitFullscreen();
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iOS Safari
  };

  const wake = () => {
    el.classList.remove('is-idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => !v.paused && el.classList.add('is-idle'), 2200);
  };

  el.querySelector('.player__big').addEventListener('click', play);
  v.addEventListener('click', toggle);
  toggleBtn.addEventListener('click', toggle);
  muteBtn.addEventListener('click', () => { v.muted = !v.muted; setState(); });
  el.querySelector('[data-act="fs"]').addEventListener('click', fullscreen);
  v.addEventListener('dblclick', fullscreen);

  scrub.addEventListener('input', () => {
    scrubbing = true;
    if (v.duration) v.currentTime = (scrub.value / 1000) * v.duration;
    updateTime();
  });
  scrub.addEventListener('change', () => (scrubbing = false));

  // Some WebM files (e.g. browser-recorded) report duration = Infinity until the end is
  // reached. Seeking far ahead once forces the browser to compute the real duration.
  v.addEventListener('loadedmetadata', () => {
    if (v.duration !== Infinity) return;
    const resume = v.currentTime;
    v.addEventListener('durationchange', function fix() {
      if (v.duration === Infinity) return;
      v.removeEventListener('durationchange', fix);
      v.currentTime = resume;
      updateTime();
    });
    v.currentTime = 1e101;
  });

  ['play', 'pause', 'ended', 'volumechange'].forEach((e) => v.addEventListener(e, setState));
  ['timeupdate', 'loadedmetadata', 'progress', 'durationchange'].forEach((e) => v.addEventListener(e, updateTime));
  v.addEventListener('waiting', () => el.classList.add('is-waiting'));
  ['playing', 'canplay', 'pause'].forEach((e) => v.addEventListener(e, () => el.classList.remove('is-waiting')));
  v.addEventListener('ended', () => el.classList.remove('is-idle'));
  // <source> errors fire on the last source element
  const lastSource = v.querySelector('source:last-of-type');
  (lastSource || v).addEventListener('error', () => el.classList.add('is-error'));

  el.addEventListener('pointermove', wake);
  el.addEventListener('keydown', (e) => {
    if (e.target === scrub && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return; // native slider keys
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') { e.preventDefault(); toggle(); }
    else if (k === 'arrowright') { v.currentTime = Math.min(v.duration || 0, v.currentTime + 5); }
    else if (k === 'arrowleft') { v.currentTime = Math.max(0, v.currentTime - 5); }
    else if (k === 'm') { v.muted = !v.muted; }
    else if (k === 'f') { fullscreen(); }
    wake();
  });

  const api = {
    el,
    video: v,
    play,
    pause,
    destroy() {
      v.pause();
      v.removeAttribute('src');
      v.querySelectorAll('source').forEach((s) => s.remove());
      v.load();
      instances.delete(api);
    },
  };
  instances.add(api);
  setState();
  return api;
}

export function pauseAllPlayers() {
  instances.forEach((i) => i.pause());
}
