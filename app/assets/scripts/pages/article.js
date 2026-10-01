const copyButton = document.querySelector('[data-copy-link]');

copyButton?.addEventListener('click', async () => {
  const status = document.querySelector('[data-copy-status]');
  const url = new URL(window.location.href);
  url.hash = '';
  try {
    await navigator.clipboard.writeText(url.href);
    status.textContent = 'Link copied';
  } catch {
    status.textContent = 'Copy the page address from your browser to share this article.';
  }
});

const links = [...document.querySelectorAll('[data-toc-link]')];
const targets = links
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (targets.length) {
  let frame = 0;
  const update = () => {
    frame = 0;
    const current =
      targets.findLast((target) => target.getBoundingClientRect().top <= 160) || targets[0];
    links.forEach((link) => {
      const active = link.hash === `#${current.id}`;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      link.classList.toggle('text-brand-teal', active);
    });
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}
