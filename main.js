// ---- Site settings -------------------------------------------------------
const CONTACT_EMAIL = 'info@codebucket.ee';
// Web3Forms access key (public by design). Submissions arrive at the address the key was created for.
const WEB3FORMS_KEY = 'bc6983df-7391-4ed1-ab1b-c134606afe8a';
// Google Play link for Decanted. Leave empty to hide the button.
const DECANTED_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.agnevstsikov.decanted';
// --------------------------------------------------------------------------

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Contact e-mail everywhere
  document.querySelectorAll('[data-email]').forEach((a) => {
    a.href = 'mailto:' + CONTACT_EMAIL;
    a.textContent = CONTACT_EMAIL;
  });

  // Google Play button
  document.querySelectorAll('[data-play-link]').forEach((a) => {
    if (DECANTED_PLAY_URL) a.href = DECANTED_PLAY_URL;
    else a.remove();
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  // ---- Tick items off as they scroll into view ----------------------------
  const items = Array.from(document.querySelectorAll('[data-item]'));
  const counter = document.querySelector('[data-counter]');
  let doneCount = 0;

  function markDone(item) {
    if (item.classList.contains('is-done')) return;
    item.classList.add('is-done');
    doneCount += 1;
    if (counter) counter.textContent = String(doneCount);
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(markDone);
  } else {
    let queue = Promise.resolve();
    const io = new IntersectionObserver((entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => items.indexOf(a.target) - items.indexOf(b.target))
        .forEach((e) => {
          io.unobserve(e.target);
          // stagger rows that enter together, so they tick one after another
          queue = queue.then(() => new Promise((r) => {
            markDone(e.target);
            setTimeout(r, 260);
          }));
        });
    }, { threshold: 0.55, rootMargin: '0px 0px -8% 0px' });
    items.forEach((i) => io.observe(i));
  }

  // ---- Expand / collapse project details ----------------------------------
  document.querySelectorAll('button.item-head').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.item');
      const open = !item.classList.contains('open');
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      markDone(item);
    });
  });

  // ---- "Your idea goes here…" ---------------------------------------------
  const form = document.querySelector('[data-idea-form]');
  if (form) {
    const text = form.querySelector('textarea');
    const status = form.querySelector('[data-idea-status]');
    const row = form.closest('.item');

    const email = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const honeypot = form.querySelector('input[name="botcheck"]');
    let sending = false;
    const captchaBox = form.querySelector('.idea-captcha');
    let captchaWatch = null;

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (sending) return;
      const idea = text.value.trim();
      const from = email.value.trim();
      if (!idea) {
        status.textContent = 'write something first :)';
        text.focus();
        return;
      }
      if (!from || !email.checkValidity()) {
        status.textContent = 'and an e-mail, so we can reply';
        email.focus();
        return;
      }
      if (honeypot && honeypot.checked) return;

      // No key configured yet: fall back to the visitor's mail app.
      if (!WEB3FORMS_KEY) {
        window.location.href = 'mailto:' + CONTACT_EMAIL +
          '?subject=' + encodeURIComponent('New item for the Codebucket list') +
          '&body=' + encodeURIComponent(idea + '\n\n— ' + from);
        status.textContent = 'your mail app should open now';
        return;
      }

      const captchaField = form.querySelector('[name="h-captcha-response"]');
      const captcha = captchaField ? captchaField.value : '';
      if (!captcha) {
        // Show the human check only now, then send automatically once it is solved.
        captchaBox.classList.add('show');
        status.textContent = 'one last step — tick “I am human”';
        clearInterval(captchaWatch);
        captchaWatch = setInterval(() => {
          const f = form.querySelector('[name="h-captcha-response"]');
          if (f && f.value) {
            clearInterval(captchaWatch);
            form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
          }
        }, 300);
        return;
      }

      sending = true;
      button.disabled = true;
      status.textContent = 'adding it…';
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: 'New item for the Codebucket list',
            from_name: 'codebucket.ee',
            email: from,
            replyto: from,
            message: idea,
            'h-captcha-response': captcha,
            botcheck: false
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) throw new Error(data.message || 'failed');
        row.classList.add('is-done');
        status.textContent = 'added — we’ll get back to you soon';
        form.reset();
        captchaBox.classList.remove('show');
        if (window.hcaptcha) { try { window.hcaptcha.reset(); } catch (e) { /* ignore */ } }
      } catch (e) {
        status.textContent = 'something went wrong — please write to ' + CONTACT_EMAIL;
        if (window.hcaptcha) { try { window.hcaptcha.reset(); } catch (err) { /* ignore */ } }
      } finally {
        sending = false;
        button.disabled = false;
      }
    });

    text.addEventListener('input', () => {
      if (status.textContent.startsWith('write') || status.textContent.startsWith('and an')) status.textContent = '';
    });
  }
})();
