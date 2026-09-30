import '../libs/text-rotator/text-rotator.js';
import { marquee } from '../libs/vanilla-marquee/vanilla-marquee.js';
import { initToggleGroup } from '../libs/initToggleGroup/initToggleGroup.js';

const header = document.querySelector('#header');
const menuButton = document.querySelector('#menu-button');

if (header && menuButton) {
  const closeMenu = () => {
    header.dataset.open = 'false';
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overflow-hidden');
  };

  menuButton.addEventListener('click', () => {
    const open = header.dataset.open !== 'true';

    header.dataset.open = String(open);
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('overflow-hidden', open);
  });

  const desktopMedia = window.matchMedia('(min-width: 1024)');

  desktopMedia.addEventListener('change', (e) => {
    if (e.matches) {
      closeMenu();
    }
  });
}

/* Marquee */
document.querySelectorAll('[data-marquee]').forEach((element) => {
  const gap = Number(element.dataset.marqueeGap);
  const speed = Number(element.dataset.marqueeSpeed);

  new marquee(element, {
    direction: element.dataset.marqueeDirection || 'left',

    duplicated:
      element.dataset.marqueeDuplicated === undefined
        ? true
        : element.dataset.marqueeDuplicated === 'true' || element.dataset.marqueeDuplicated === '',

    gap: Number.isFinite(gap) ? gap : 12,
    speed: Number.isFinite(speed) ? speed : 40,

    pauseOnHover:
      element.dataset.marqueePauseOnHover === undefined
        ? true
        : element.dataset.marqueePauseOnHover === 'true' ||
          element.dataset.marqueePauseOnHover === '',

    startVisible:
      element.dataset.marqueeStartVisible === undefined
        ? true
        : element.dataset.marqueeStartVisible === 'true' ||
          element.dataset.marqueeStartVisible === '',
  });
});

initToggleGroup({
  containerSelector: 'data-accordions',
  itemSelector: 'data-accordion',
  triggerSelector: 'data-accordion-trigger',
});

initToggleGroup({
  containerSelector: 'data-cards',
  itemSelector: 'data-card',
  triggerSelector: 'data-card-trigger',
});

document.querySelectorAll('[data-auto-accordions]').forEach((accordions) => {
  let index = 0;
  let interval = null;
  let stoppedByUser = false;

  const buttons = accordions.querySelectorAll('[data-accordion-trigger]');

  if (buttons.length !== 0) {
    function startAuto() {
      if (interval || stoppedByUser) return;

      buttons[index].click();
      index++;

      interval = setInterval(() => {
        buttons[index].click();
        index++;

        if (index === buttons.length) index = 0;
      }, 6000);
    }

    function stopAuto() {
      clearInterval(interval);
      interval = null;
    }

    accordions.addEventListener('pointerdown', () => {
      if (!stoppedByUser) {
        accordions.querySelectorAll('.auto-accordions-line').forEach((line) => {
          line.classList.add('no-duration');
        });
        stoppedByUser = true;
        stopAuto();
      }
    });

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startAuto();
      else stopAuto();
    });

    observer.observe(accordions);
  }
});

const selects = document.querySelectorAll('.select');

if (selects.length > 0) {
  selects.forEach((select) => {
    const button = select.querySelector('.select__button');
    const dropdown = select.querySelector('.select__dropdown');
    const hiddenInput = select.querySelector('input[type="hidden"]');
    const valueElement = select.querySelector('[data-select-button-value]');

    function closeSelect() {
      button.ariaExpanded = 'false';
      dropdown.dataset.open = 'false';
      dropdown.dataset.position = '';
    }

    function updateDropdownPosition() {
      const buttonRect = button.getBoundingClientRect();

      const dropdownHeight = Math.min(dropdown.scrollHeight, 320);

      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      const gap = 8;

      const shouldOpenUp = spaceBelow < dropdownHeight + gap && spaceAbove > spaceBelow;

      dropdown.dataset.position = shouldOpenUp ? 'top' : 'bottom';
    }

    button.addEventListener('click', (e) => {
      e.stopPropagation();

      const isOpen = dropdown.dataset.open === 'true';

      document.querySelectorAll('.select__dropdown[data-open="true"]').forEach((openedDropdown) => {
        if (openedDropdown !== dropdown) {
          openedDropdown.dataset.open = 'false';

          const parent = openedDropdown.closest('.select');
          const openedButton = parent?.querySelector('.select__button');

          if (openedButton) {
            openedButton.ariaExpanded = 'false';
          }
        }
      });

      if (isOpen) {
        closeSelect();
        return;
      }

      button.ariaExpanded = 'true';
      dropdown.dataset.open = 'true';

      requestAnimationFrame(() => {
        updateDropdownPosition();
      });
    });

    dropdown.querySelectorAll('[data-select]').forEach((option) => {
      const value = option.dataset.select;

      if (option.ariaSelected === 'true') {
        if (hiddenInput) {
          hiddenInput.value = value;
        }

        if (valueElement) {
          valueElement.textContent = value;
        }
      }

      option.addEventListener('click', () => {
        const value = option.dataset.select;

        dropdown.querySelectorAll('[data-select]').forEach((item) => {
          item.setAttribute('aria-selected', 'false');
        });

        option.setAttribute('aria-selected', 'true');

        if (hiddenInput) {
          hiddenInput.value = value;
        }

        if (valueElement) {
          valueElement.textContent = value;
        }

        closeSelect();
      });
    });
    window.addEventListener('resize', () => {
      if (dropdown.dataset.open === 'true') {
        updateDropdownPosition();
      }
    });

    window.addEventListener(
      'scroll',
      () => {
        if (dropdown.dataset.open === 'true') {
          updateDropdownPosition();
        }
      },
      true,
    );
  });

  document.addEventListener('click', (e) => {
    selects.forEach((select) => {
      if (!select.contains(e.target)) {
        const button = select.querySelector('.select__button');
        const dropdown = select.querySelector('.select__dropdown');

        button.ariaExpanded = 'false';
        dropdown.dataset.open = 'false';
        dropdown.dataset.position = '';
      }
    });
  });
}

document.querySelectorAll('[data-cta-glow]').forEach((cta) => {
  cta.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const rect = cta.getBoundingClientRect();
    cta.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
    cta.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
  });
});
