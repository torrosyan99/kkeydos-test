const copyButton = document.querySelector('[data-copy-link]');

copyButton?.addEventListener('click', async () => {
  const status = document.querySelector('[data-copy-status]');
  const url = new URL(window.location.href);
  url.hash = '';
  try {
    await navigator.clipboard.writeText(url.href);
    if (status) status.textContent = 'Link copied';
  } catch {
    if (status)
      status.textContent = 'Copy the page address from your browser to share this article.';
  }
});

const contents = document.querySelector('[data-article-contents]');
const sectionInput = contents?.querySelector('input');
const options = [...(contents?.querySelectorAll('[data-select]') || [])];
const targets = options
  .map((option) => document.getElementById(option.dataset.select))
  .filter(Boolean);
const progress = document.querySelector('[data-reading-progress]');
const reading = document.querySelector('.article-reading');

// main.js owns opening, keyboard navigation, selection, and closing of the select.
sectionInput?.addEventListener('change', () => {
  const target = document.getElementById(sectionInput.value);
  if (!target) return;
  const url = new URL(window.location.href);
  url.hash = target.id;
  history.replaceState(null, '', url);
  requestAnimationFrame(() => {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
  });
});

if (targets.length) {
  let frame = 0;
  const update = () => {
    frame = 0;
    if (progress && reading) {
      const rect = reading.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight + 112);
      const fraction = Math.max(0, Math.min(1, (112 - rect.top) / distance));
      progress.style.setProperty('--reading-progress', String(fraction));
    }
    const current =
      targets.findLast((target) => target.getBoundingClientRect().top <= 160) || targets[0];
    options.forEach((option) => {
      const active = option.dataset.select === current.id;
      if (active) option.setAttribute('aria-current', 'location');
      else option.removeAttribute('aria-current');
    });
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true },
  );
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  update();
}
