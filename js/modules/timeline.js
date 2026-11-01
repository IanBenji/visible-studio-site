/* ==========================================================================
   Timeline — the editing-app timeline under the showreel (hero).
   • V1 clips are the real projects (poster thumbnail + type); click opens one
   • T1 = title/caption chips, A1 = a static waveform (drawn once)
   • a playhead follows the showreel (full reel when playing, else the muted loop)
   • drag the ruler / tracks, or use the arrow keys on the ruler, to scrub
   Performance: only the playhead moves (transform), and its rAF loop runs only
   while the editor is on screen and the tab is visible.
   ========================================================================== */
import { $, $$, esc, prefersReduced, timecode, formatsOf } from './utils.js';
import { PROJECTS, SITE } from '../data.js';
import { catOf, mediaFor } from './work.js';

const FALLBACK_LEN = 30; // seconds shown on the ruler until the video reports a duration
const TEXT_CHIPS = [
  ['Title', 0, 11], ['Captions', 17, 30], ['Lower third', 50, 14], ['Captions', 68, 19], ['CTA', 91, 9],
];

const toSec = (d = '') => d.split(':').reduce((a, n) => a * 60 + Number(n), 0);
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Deterministic waveform bars (same shape on every visit). */
function waveform(n = 180) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let bars = '';
  for (let i = 0; i < n; i++) {
    const env = 0.45 + 0.35 * Math.sin(i / 9) * Math.sin(i / 23) + 0.2 * rnd();
    const h = Math.max(1.5, Math.min(22, env * 24 * (0.55 + 0.45 * rnd())));
    bars += `<rect x="${i}" y="${(12 - h / 2).toFixed(1)}" width="0.62" height="${h.toFixed(1)}"/>`;
  }
  return `<svg class="tl__wave" viewBox="0 0 ${n} 24" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
}

function clipHTML(p) {
  const f = formatsOf(p);
  const wide = f.some((x) => x.aspect === '16:9');
  const m = mediaFor(p, wide ? '16:9' : f[0].aspect);
  const dur = (m.format || f[0]).duration || '';
  const cat = catOf(p);
  const grow = Math.log(toSec(dur) + 20).toFixed(2); // longer videos get slightly longer clips
  return `
    <a class="tl__clip" href="#/project/${esc(p.slug)}" style="--c:${cat.color};flex-grow:${grow}"
       aria-label="Watch: ${esc(p.title)}${dur ? ` (${esc(dur)})` : ''}" data-tip="${esc(p.title)}${dur ? ` · ${esc(dur)}` : ''} — click to watch">
      <img class="tl__thumb" src="${esc(m.poster)}" alt="" loading="lazy" decoding="async">
      <span class="tl__name">${esc(cat.filter || p.title)}</span>
    </a>`;
}

export function initTimeline() {
  const root = $('[data-timeline]');
  if (!root) return;
  const file = $('[data-editor-file]');
  if (file) file.textContent = `${(SITE.shortName || 'STUDIO').toUpperCase()}_SHOWREEL.edit`;

  root.innerHTML = `
    <div class="tl__heads" aria-hidden="true"><span></span><span class="tl__head--t">T1</span><span>V1</span><span>A1</span></div>
    <div class="tl__body">
      <div class="tl__ruler" role="slider" tabindex="0" aria-label="Scrub the showreel preview"
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="00:00">
        ${[0, 1, 2, 3, 4, 5].map((k) => `<span class="tl__mark" style="left:${(k / 6) * 100}%">00:00</span>`).join('')}
      </div>
      <div class="tl__track tl__track--t" aria-hidden="true">
        ${TEXT_CHIPS.map(([t, l, w]) => `<span class="tl__chip" style="left:${l}%;width:${w}%">${t}</span>`).join('')}
      </div>
      <div class="tl__track tl__track--v">${PROJECTS.map(clipHTML).join('')}</div>
      <div class="tl__track tl__track--a" aria-hidden="true">${waveform()}</div>
      <div class="tl__playhead" aria-hidden="true"><span class="tl__tag">00:00:00:00</span></div>
    </div>`;

  const bin = $('[data-bin]');
  if (bin) bin.innerHTML = `<p class="panel__head"><span>Media bin</span><span>${PROJECTS.length} items</span></p>` +
    PROJECTS.map((p) => {
      const f = formatsOf(p);
      const m = mediaFor(p, f.some((x) => x.aspect === '16:9') ? '16:9' : f[0].aspect);
      return `<a class="bin__item" href="#/project/${esc(p.slug)}" tabindex="-1" style="--c:${catOf(p).color}"><img src="${esc(m.poster)}" alt="" loading="lazy" decoding="async"><span>${esc(p.title)}</span><span>${esc((m.format || f[0]).duration || '')}</span></a>`;
    }).join('');
  const insp = $('[data-inspector]');
  if (insp) insp.innerHTML = `<p class="panel__head"><span>Inspector</span><span>V1</span></p>
    <p class="insp__clip" data-insp-clip>—</p>
    ${[['Scale', 100, '100%'], ['Opacity', 100, '100%'], ['Exposure', 58, '+0.3'], ['Saturation', 64, '112'], ['Speed', 50, '100%']]
      .map(([k, v, t]) => `<p class="insp__row"><span>${k}</span><i style="--v:${v}%"></i><b>${t}</b></p>`).join('')}
    <div class="insp__meters"><span><em></em></span><span><em></em></span></div>`;
  const inspClip = $('[data-insp-clip]');
  const binItems = bin ? $$('.bin__item', bin) : [];
  const meters = insp ? $$('.insp__meters em', insp) : [];

  const body = $('.tl__body', root);
  const ruler = $('.tl__ruler', root);
  const head = $('.tl__playhead', root);
  const tag = $('.tl__tag', root);
  const barTc = $('[data-tl-tc]');
  const marks = $$('.tl__mark', root);
  const clips = $$('.tl__clip', root);

  // Video sources: the full reel when it is playing, otherwise the muted preview loop
  const preview = $('.showreel__preview');
  const full = $('.showreel .player video');
  const source = () => (full && !full.paused ? full : preview);
  const learned = new WeakMap();
  const lengthOf = (v) => {
    if (!v) return FALLBACK_LEN;
    if (Number.isFinite(v.duration) && v.duration > 0) return v.duration;
    const end = v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0;
    const len = Math.max(learned.get(v) || 0, end, v.currentTime);
    learned.set(v, len);
    return len > 1 ? len : FALLBACK_LEN;
  };

  let width = body.clientWidth;
  let ranges = [];
  const measure = () => {
    width = body.clientWidth;
    ranges = clips.map((c) => [c.offsetLeft, c.offsetLeft + c.offsetWidth]);
  };
  new ResizeObserver(measure).observe(body);
  measure();

  let shownLen = -1;
  const labelRuler = (len) => {
    if (len === shownLen) return;
    shownLen = len;
    marks.forEach((m, k) => (m.textContent = timecode((k / 6) * len).slice(3))); // MM:SS:FF
  };

  // ---- drawing (only touches the DOM when something changed) ----
  let lastFrame = -1;
  let active = -1;
  const draw = (t, len) => {
    const frac = Math.min(1, Math.max(0, t / len));
    const x = frac * width;
    head.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    const frame = Math.floor(t * 25);
    if (frame !== lastFrame) {
      lastFrame = frame;
      const tc = timecode(t);
      tag.textContent = tc;
      if (barTc) barTc.textContent = tc;
    }
    const i = ranges.findIndex(([a, b]) => x >= a && x < b);
    if (i !== active) {
      clips[active]?.classList.remove('is-active');
      clips[i]?.classList.add('is-active');
      binItems[active]?.classList.remove('is-active');
      binItems[i]?.classList.add('is-active');
      if (inspClip) inspClip.textContent = PROJECTS[i]?.title || '—';
      active = i;
    }
    labelRuler(Math.round(len * 10) / 10);
  };

  // ---- scrubbing ----
  let scrubT = null;
  const seekTo = (t) => {
    const v = source();
    const len = lengthOf(v);
    scrubT = Math.min(len, Math.max(0, t));
    if (v && v.readyState >= 1) {
      try { v.currentTime = scrubT; } catch { /* not seekable yet */ }
    }
    ruler.setAttribute('aria-valuenow', String(Math.round((scrubT / len) * 100)));
    ruler.setAttribute('aria-valuetext', mmss(scrubT));
    draw(scrubT, len);
  };
  const tFromEvent = (e) => {
    const r = body.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * lengthOf(source());
  };
  let dragging = false;
  body.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.tl__clip') || e.button !== 0) return; // clips are links
    dragging = true;
    body.setPointerCapture(e.pointerId);
    body.classList.add('is-scrubbing');
    seekTo(tFromEvent(e));
  });
  body.addEventListener('pointermove', (e) => { if (dragging) seekTo(tFromEvent(e)); });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    body.classList.remove('is-scrubbing');
    scrubT = null;
  };
  body.addEventListener('pointerup', endDrag);
  body.addEventListener('pointercancel', endDrag);
  ruler.addEventListener('keydown', (e) => {
    const v = source();
    const now = scrubT ?? (v ? v.currentTime : 0);
    const step = e.shiftKey ? 5 : 1;
    const to = { ArrowRight: now + step, ArrowLeft: now - step, Home: 0, End: lengthOf(v) }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    seekTo(to);
    scrubT = null;
  });

  // ---- playhead loop: only while visible ----
  const level = [0, 0];
  let onScreen = false;
  let raf = 0;
  const tick = () => {
    raf = 0;
    if (!onScreen || document.hidden) return;
    if (scrubT === null) {
      const v = source();
      if (v) draw(v.currentTime || 0, lengthOf(v));
    }
    if (meters.length) {
      const on = source() && !source().paused;
      meters.forEach((m, k) => {
        level[k] = on ? level[k] * 0.6 + (0.35 + Math.random() * 0.6) * 0.4 : level[k] * 0.85;
        m.style.transform = `scaleY(${(1 - Math.min(0.97, level[k])).toFixed(3)})`;
      });
    }
    raf = requestAnimationFrame(tick);
  };
  const start = () => { if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(tick); };
  new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; start(); }).observe(root.closest('.editor') || root);
  document.addEventListener('visibilitychange', start);

  draw(0, FALLBACK_LEN);
  root.classList.toggle('is-static', prefersReduced());
}
