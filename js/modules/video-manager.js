/* ==========================================================================
   VideoManager — decorative preview videos
   • <video data-lazy-src="…"> elements get their src only when near the viewport
   • autoplay previews ([data-autoplay]) play muted only while visible
   • hover previews (data-mode="hover") play on pointer hover (desktop) or when
     mostly in view (touch)
   • view previews (data-mode="view") play whenever mostly in view, on every
     device, and also on hover — used by the work cards
   • only one preview plays at a time, to keep scrolling smooth
   • never plays sound; respects reduced motion and data-saver
   ========================================================================== */
import { isFinePointer, prefersReduced, saveData } from './utils.js';

const MAX_PLAYING = 1;
const playing = new Set();
const visibleAutoplay = new Set(); // autoplay loops currently on screen (e.g. the showreel)

function load(video) {
  if (video.dataset.loaded) return;
  const src = video.dataset.lazySrc;
  if (!src) return;
  video.src = src;
  video.dataset.loaded = '1';
  video.addEventListener('error', () => video.closest('[data-media]')?.classList.add('has-video-error'), { once: true });
}

export function play(video) {
  if (prefersReduced() || saveData()) return;
  load(video);
  video.muted = true;
  // enforce concurrency limit — pause the oldest
  if (!playing.has(video) && playing.size >= MAX_PLAYING) {
    const oldest = playing.values().next().value;
    pause(oldest, { resume: false });
  }
  playing.add(video);
  const p = video.play();
  if (p && p.then) {
    p.then(() => video.classList.add('is-playing')).catch(() => playing.delete(video));
  }
}

export function pause(video, { resume = true } = {}) {
  if (!video) return;
  playing.delete(video);
  video.pause();
  video.classList.remove('is-playing');
  // hand the single slot back to an on-screen autoplay loop
  if (resume && !playing.size) {
    const next = [...visibleAutoplay].find((x) => x !== video);
    if (next) play(next);
  }
}

/** Registers every lazy video inside root. Safe to call again for new content. */
export function registerVideos(root = document) {
  const videos = [...root.querySelectorAll('video[data-lazy-src]:not([data-vm])')];
  if (!videos.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        const mode = v.dataset.mode; // 'autoplay' | 'view' | 'hover'
        if (mode === 'autoplay') entry.isIntersecting ? visibleAutoplay.add(v) : visibleAutoplay.delete(v);
        if (entry.isIntersecting) {
          if (mode === 'autoplay') play(v);
          else if ((mode === 'view' || (mode === 'hover' && !isFinePointer())) && entry.intersectionRatio >= 0.6) play(v);
          else if (mode === 'view' && playing.has(v)) pause(v);
          else if (entry.intersectionRatio > 0) {
            // warm up metadata just before it is needed
            if (!saveData()) v.preload = 'metadata';
          }
        } else {
          pause(v);
        }
      });
    },
    { rootMargin: '150px 0px', threshold: [0, 0.6] }
  );

  videos.forEach((v) => {
    v.dataset.vm = '1';
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.setAttribute('aria-hidden', 'true');
    v.setAttribute('tabindex', '-1');
    io.observe(v);

    const host = v.closest('[data-hover-host]');
    if (host && (v.dataset.mode === 'hover' || v.dataset.mode === 'view')) {
      // 'view' cards keep playing after the pointer leaves (they are still on screen)
      const leave = v.dataset.mode === 'hover' ? () => pause(v) : () => {};
      host.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && play(v));
      host.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && leave());
      host.addEventListener('focusin', () => play(v));
      host.addEventListener('focusout', leave);
    }
  });
}

/** Pause every preview (e.g. when an overlay opens). */
export function pauseAll() {
  [...playing].forEach((v) => pause(v, { resume: false }));
}
