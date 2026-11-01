/* ==========================================================================
   Contact form — inline validation + pluggable submission adapter.
   Configure FORM_CONFIG in js/data.js. With no provider configured the form
   is honest: it validates, then explains it is not connected yet and offers
   a pre-filled email instead of pretending to send.
   ========================================================================== */
import { $, $$, esc } from './utils.js';
import { SITE, CATEGORIES, FORM_CONFIG } from '../data.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initContactDetails() {
  const mail = `mailto:${SITE.email}`;
  const wa = `https://wa.me/${SITE.whatsapp}`;
  $$('[data-email-link]').forEach((a) => { a.href = mail; a.textContent = SITE.email; });
  $$('[data-whatsapp-link]').forEach((a) => (a.href = wa));
  $$('[data-whatsapp-label]').forEach((s) => (s.textContent = SITE.whatsappLabel));
  const socials = SITE.socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}<span aria-hidden="true">↗</span></a></li>`).join('');
  $$('[data-socials], [data-footer-socials]').forEach((ul) => (ul.innerHTML = socials));
  $$('[data-footer-contact]').forEach((ul) => (ul.innerHTML = `
    <li><a href="${mail}">${esc(SITE.email)}</a></li>
    <li><a href="${wa}" target="_blank" rel="noopener">WhatsApp ${esc(SITE.whatsappLabel)}</a></li>`));
  $$('[data-contact-links]').forEach((el) => (el.innerHTML = `
    <a href="${mail}">${esc(SITE.email)}</a><a href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
    ${SITE.socials.slice(0, 2).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}`));
}

export function initContactForm() {
  const form = $('[data-contact-form]');
  if (!form) return;
  const status = $('[data-form-status]', form);
  const chips = $('[data-type-chips]', form);
  const types = [...CATEGORIES.map((c) => c.label), 'Social media content', 'Something else'];
  chips.innerHTML = types.map((t, i) => `
    <label class="chip"><input type="radio" name="projectType" value="${esc(t)}" ${i === 0 ? 'required' : ''}>${esc(t)}</label>`).join('');

  const fields = {
    name: { el: form.elements.name, check: (v) => (v.trim().length >= 2 ? '' : 'Please tell us your name.') },
    email: { el: form.elements.email, check: (v) => (!v.trim() ? 'We need an email address to reply.' : EMAIL_RE.test(v.trim()) ? '' : 'That email address doesn’t look quite right.') },
    description: { el: form.elements.description, check: (v) => (v.trim().length >= 20 ? '' : 'A couple of sentences helps (at least 20 characters).') },
  };

  const setError = (input, msg) => {
    const field = input.closest('.field');
    const err = field.querySelector('.field__error');
    field.classList.toggle('is-invalid', Boolean(msg));
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg;
  };
  const validateType = () => {
    const ok = Boolean(form.querySelector('input[name="projectType"]:checked'));
    const fs = form.querySelector('.field--chips');
    fs.classList.toggle('is-invalid', !ok);
    $('#f-type-err').textContent = ok ? '' : 'Choose the closest project type.';
    return ok;
  };

  Object.values(fields).forEach(({ el, check }) => {
    el.addEventListener('blur', () => el.value && setError(el, check(el.value)));
    el.addEventListener('input', () => el.closest('.field').classList.contains('is-invalid') && setError(el, check(el.value)));
  });
  chips.addEventListener('change', validateType);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status';
    status.innerHTML = '';
    let firstInvalid = null;
    Object.values(fields).forEach(({ el, check }) => {
      const msg = check(el.value);
      setError(el, msg);
      if (msg && !firstInvalid) firstInvalid = el;
    });
    if (!validateType() && !firstInvalid) firstInvalid = chips.querySelector('input');
    if (firstInvalid) { firstInvalid.focus(); return; }
    if (form.elements._gotcha.value) return; // spam bot

    const data = {
      name: fields.name.el.value.trim(),
      email: fields.email.el.value.trim(),
      projectType: form.querySelector('input[name="projectType"]:checked').value,
      description: fields.description.el.value.trim(),
    };

    if (!FORM_CONFIG.provider) return notConnected(data);

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.querySelector('.btn__label').textContent = 'Sending…';
    try {
      await send(data);
      form.reset();
      status.className = 'form__status is-success';
      status.innerHTML = `<h3>Thank you — your brief is in.</h3><p>We'll reply to <strong>${esc(data.email)}</strong> as soon as we can.</p>`;
    } catch (err) {
      status.className = 'form__status is-warn';
      status.innerHTML = `<h3>Something went wrong sending your message.</h3><p>Please try again, or email us directly at <a href="${mailtoFor(data)}">${esc(SITE.email)}</a>.</p>`;
    } finally {
      btn.disabled = false;
      btn.querySelector('.btn__label').textContent = 'Send project brief';
    }
  });

  function notConnected(data) {
    status.className = 'form__status is-warn';
    status.innerHTML = `
      <h3>Your brief looks great — but this form isn't connected yet.</h3>
      <p>Nothing has been sent. Until the form service is set up, please <a href="${mailtoFor(data)}">send it by email</a> (we've pre-filled it for you) or message us on WhatsApp.</p>`;
  }
}

function mailtoFor(d) {
  const subject = encodeURIComponent(`Project enquiry — ${d.projectType}`);
  const body = encodeURIComponent(`Name: ${d.name}\nEmail: ${d.email}\nProject type: ${d.projectType}\n\n${d.description}`);
  return `mailto:${SITE.email}?subject=${subject}&body=${body}`;
}

async function send(data) {
  const { provider, endpoint, accessKey } = FORM_CONFIG;
  let url, body, headers = { Accept: 'application/json' };
  if (provider === 'formspree') {
    url = endpoint;
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  } else if (provider === 'web3forms') {
    url = 'https://api.web3forms.com/submit';
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ access_key: accessKey, subject: `New project enquiry — ${data.projectType}`, from_name: data.name, ...data });
  } else {
    url = endpoint;
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }
  if (!url) throw new Error('No endpoint configured');
  const res = await fetch(url, { method: 'POST', headers, body });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}
