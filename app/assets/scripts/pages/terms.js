const links = [...document.querySelectorAll('[data-terms-link]')];
const sections = [...document.querySelectorAll('main section[id]')];
const menu = document.querySelector('[data-terms-menu]');

function updateCurrent() {
  const active =
    [...sections].reverse().find((section) => section.getBoundingClientRect().top <= 180) ||
    sections[0];
  links.forEach((link) => {
    if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

links.forEach((link) =>
  link.addEventListener('click', () => {
    menu.open = false;
  }),
);
if (sections.length) {
  document.addEventListener('scroll', updateCurrent, { passive: true });
  updateCurrent();
}
