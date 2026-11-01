/* Shared helpers */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const mq = {
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)'),
  fine: window.matchMedia('(hover: hover) and (pointer: fine)'),
  desktop: window.matchMedia('(min-width: 900px)'),
};
export const prefersReduced = () => mq.reduced.matches;
export const isFinePointer = () => mq.fine.matches;
export const isDesktop = () => mq.desktop.matches;
export const saveData = () => Boolean(navigator.connection && navigator.connection.saveData);

/** "16:9" → "16 / 9" for CSS aspect-ratio. "2.39:1" works too. */
export const cssAspect = (a = '16:9') => a.replace(':', ' / ');
/** "9:16" → 0.5625 */
export const ratio = (a = '16:9') => {
  const [w, h] = a.split(':').map(Number);
  return w / h;
};

/** seconds → "00:00:12:08" (25fps broadcast style) */
export function timecode(seconds, fps = 25) {
  const s = Math.max(0, seconds);
  const p = (n) => String(Math.floor(n)).padStart(2, '0');
  return `${p(s / 3600)}:${p((s / 60) % 60)}:${p(s % 60)}:${p((s % 1) * fps)}`;
}
/** seconds → "1:05" */
export function clock(seconds) {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const pad2 = (n) => String(n).padStart(2, '0');

/** Escape text for safe insertion into HTML templates. */
export function esc(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Build <source> tags from { mp4, webm } (webm first: usually smaller). */
export function sources(video = {}) {
  const out = [];
  if (typeof video === 'string') return `<source src="${esc(video)}" type="${video.endsWith('.webm') ? 'video/webm' : 'video/mp4'}">`;
  if (video.webm) out.push(`<source src="${esc(video.webm)}" type="video/webm">`);
  if (video.mp4) out.push(`<source src="${esc(video.mp4)}" type="video/mp4">`);
  return out.join('');
}

/** Wrap each word of an element's text nodes in spans (keeps <em> etc.). */
export function splitWords(el, cls = 'word') {
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else {
            const s = document.createElement('span');
            s.className = cls;
            s.textContent = part;
            frag.appendChild(s);
          }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        walk(child);
      }
    });
  };
  walk(el);
  return $$('.' + cls, el);
}

/** Full-length cuts of a project (e.g. YouTube 16:9 + Reel 9:16). */
export const formatsOf = (p) =>
  p.formats?.length ? p.formats : [{ label: p.aspect, aspect: p.aspect, video: p.video || {} }];

/** URL-safe key for a format label: 'YouTube' → 'youtube' (#/project/<slug>/youtube). */
export const formatKey = (f) => String(f.label).toLowerCase().replace(/[^a-z0-9]+/g, '-');
