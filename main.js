// ---- Site settings -------------------------------------------------------
const CONTACT_EMAIL = 'codebucketest@gmail.com';
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

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const idea = text.value.trim();
      if (!idea) {
        status.textContent = 'write something first :)';
        text.focus();
        return;
      }
      const subject = 'New item for the Codebucket list';
      const body = idea + '\n\n—\nSent from codebucket list';
      window.location.href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      row.classList.add('is-done');
      status.textContent = 'on its way — your mail app should open now';
    });

    text.addEventListener('input', () => {
      if (status.textContent.startsWith('write')) status.textContent = '';
    });
  }
})();
