const links = [...document.querySelectorAll('[data-terms-link]')];
const sections = [...document.querySelectorAll('[data-terms-section]')];
const menu = document.querySelector('[data-terms-menu]');
const current = document.querySelector('[data-terms-current]');
const mobile = window.matchMedia('(width < 48rem)');

function updateCurrent() {
  const offset = mobile.matches ? 192 : 112;
  const active =
    [...sections].reverse().find((section) => section.getBoundingClientRect().top <= offset + 1) ||
    sections[0];
  links.forEach((link) => {
    if (link.hash === `#${active.id}`) {
      link.setAttribute('aria-current', 'location');
      current.textContent = link.textContent.trim();
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

links.forEach((link) =>
  link.addEventListener('click', () => {
    menu.open = false;
  }),
);
if (sections.length) {
  document.addEventListener('scroll', updateCurrent, { passive: true });
  mobile.addEventListener('change', () => {
    menu.open = false;
    updateCurrent();
  });
  updateCurrent();
}
