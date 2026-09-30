import { fixedBlock } from '../../libs/fixedBlock/fixedBlock.js';
import { initToggleGroup } from '../../libs/initToggleGroup/initToggleGroup.js';

const navigation = document.querySelector('[data-fixed-content]');
const trigger = navigation.querySelector('[data-fixed-trigger]');
const desktop = matchMedia('(min-width: 1280px)');

function resetNavigation() {
  const open = desktop.matches && navigation.dataset.fixed !== 'true';

  navigation.dataset.open = String(open);
  trigger.setAttribute('aria-expanded', String(open));
}

initToggleGroup({
  itemSelector: 'data-fixed-content',
  triggerSelector: 'data-fixed-trigger',
});

fixedBlock('[data-fixed]', '[data-fixed-content]', {
  onChange: () => {
    if (desktop.matches) resetNavigation();
  },
});

desktop.addEventListener('change', resetNavigation);
