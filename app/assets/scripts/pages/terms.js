const links = document.querySelectorAll('[data-terms-link]');
const sections = document.querySelectorAll('[data-terms-section]');
const menu = document.querySelector('[data-terms-menu]');
const current = document.querySelector('[data-terms-current]');
const mobile = window.matchMedia('(width < 48rem)');
let currentId = '';

function updateCurrent() {
  const offset = parseFloat(getComputedStyle(sections[0]).scrollMarginTop);
  let active = sections[0];

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= offset + 1) active = section;
  });

  if (active.id === currentId) return;
  currentId = active.id;

  links.forEach((link) => {
    if (link.hash === `#${currentId}`) {
      link.setAttribute('aria-current', 'location');
      current.textContent = link.textContent.trim();
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function resetMenu() {
  menu.open = !mobile.matches;
  updateCurrent();
}

links.forEach((link) => {
  link.addEventListener('click', () => {
    if (mobile.matches) menu.open = false;
  });
});

menu.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !mobile.matches || !menu.open) return;
  menu.open = false;
  menu.querySelector('summary').focus();
});

document.addEventListener('scroll', updateCurrent, { passive: true });
mobile.addEventListener('change', resetMenu);
resetMenu();
