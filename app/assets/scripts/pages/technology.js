import { initToggleGroup } from '../../libs/initToggleGroup/initToggleGroup.js';
import { fixedBlock } from '../../libs/fixedBlock/fixedBlock.js';

initToggleGroup({
  itemSelector: 'data-table-content',
  triggerSelector: 'data-table-trigger',
});

fixedBlock('[data-fixed]', '[data-fixed-content]');

initToggleGroup({
  itemSelector: 'data-business-content',
  triggerSelector: 'data-business-trigger',
  containerSelector: 'data-business-container',
});

document.querySelectorAll('[data-technology-card]').forEach((card) => {
  card.addEventListener('click', () => {
    if (window.innerWidth > 833) return;

    const isOpen = card.dataset.open === 'true';

    if (isOpen) return;
    card.dataset.open = String('true');
    card.setAttribute('aria-expanded', String('true'));
  });
});

const desktop = window.matchMedia('(min-width: 768px)');
const techTools = document.querySelector('[data-tech-tools]');

if (techTools) {
  initToggleGroup({
    containerSelector: 'data-tech-tools',
    itemSelector: 'data-tech-item',
    triggerSelector: 'data-tech-trigger',
  });
  const items = [...techTools.querySelectorAll('[data-tech-item]')];
  const buttons = items.map((item) => item.querySelector('[data-tech-trigger]'));
  const frame = techTools.querySelector('[data-tech-desktop]');
  const content = frame.querySelector('[data-tech-desktop-content]');

  let interval = null;
  let visible = false;

  const activeIndex = () => items.findIndex((item) => item.dataset.open === 'true');

  function updatePanel() {
    const index = activeIndex();

    if (index < 0 || !desktop.matches) return;

    frame.style.height = `${((index + 1) / items.length) * 100}%`;

    content.replaceChildren(items[index].querySelector('[data-tech-content]').cloneNode(true));
  }

  function updateAutoplay() {
    clearInterval(interval);
    interval = null;

    if (!desktop.matches || !visible || document.hidden) return;

    interval = setInterval(() => {
      buttons[(activeIndex() + 1) % buttons.length].click();
    }, 3000);
  }

  techTools.addEventListener(
    'click',
    (event) => {
      const trigger = event.target.closest('[data-tech-trigger]');

      if (!trigger) return;

      updateAutoplay();

      if (desktop.matches && trigger.getAttribute('aria-expanded') === 'true') {
        event.stopPropagation();
      }
    },
    true,
  );

  buttons.forEach((button) => {
    button.addEventListener('click', updatePanel);
  });

  function updateLayout() {
    buttons.forEach((button, index) => {
      button.setAttribute(
        'aria-controls',
        desktop.matches ? content.id : items[index].querySelector('[data-tech-panel]').id,
      );
    });

    if (desktop.matches && activeIndex() < 0) {
      buttons[0].click();
    }

    updatePanel();
    updateAutoplay();
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateAutoplay();
  });

  observer.observe(techTools);

  document.addEventListener('visibilitychange', updateAutoplay);
  desktop.addEventListener('change', updateLayout);

  updateLayout();
}
