const menu = document.querySelector('[data-terms-menu]');
const sections = document.querySelectorAll('[data-terms-section]');

if (menu && sections.length) {
  const links = menu.querySelectorAll('[data-terms-link]');
  const current = menu.querySelector('[data-select-button-value]');
  const trigger = menu.querySelector('.select__button');
  const mobile = window.matchMedia('(width < 48rem)');
  let currentId = '';
  let scheduled = false;

  function updateCurrent() {
    scheduled = false;
    const offset = parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0;
    let active = sections[0];

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset + 1) active = section;
    });

    if (active.id === currentId) return;
    currentId = active.id;

    links.forEach((link) => {
      if (link.hash === `#${currentId}`) {
        link.setAttribute('aria-current', 'location');
        if (current) current.textContent = link.textContent.trim();
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateCurrent);
  }

  document.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  mobile.addEventListener('change', () => {
    // main.js owns the shared select state and keyboard navigation.
    if (trigger?.ariaExpanded === 'true') trigger.click();
    scheduleUpdate();
  });
  updateCurrent();
}
