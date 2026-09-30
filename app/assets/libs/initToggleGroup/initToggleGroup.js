export function initToggleGroup({ containerSelector, itemSelector, triggerSelector }) {
  const containers = containerSelector ? document.querySelectorAll(`[${containerSelector}]`)
    : [document];

  containers.forEach((container) => {
    const mode = containerSelector ? container.getAttribute(containerSelector) : null;

    const oneActive = mode === 'one-active' || mode === 'one-active-important';

    const oneActiveImportant = mode === 'one-active-important';

    const items = container.querySelectorAll(`[${itemSelector}]`);

    const setOpen = (item, open) => {
      item.dataset.open = String(open);

      item.querySelector(`[${triggerSelector}]`)?.setAttribute('aria-expanded', String(open));
    };

    if (oneActiveImportant && items.length) {
      const openedItems = [...items].filter((item) => item.dataset.open === 'true');

      if (openedItems.length === 0) {
        setOpen(items[0], true);
      }

      if (openedItems.length > 1) {
        openedItems.slice(1).forEach((item) => {
          setOpen(item, false);
        });
      }
    }

    items.forEach((item) => {
      const trigger = item.querySelector(`[${triggerSelector}]`);

      if (trigger) {
        trigger.addEventListener('click', () => {
          const isOpen = item.dataset.open === 'true';

          if (oneActiveImportant && isOpen) {
            return;
          }

          if (oneActive && !isOpen) {
            items.forEach((otherItem) => {
              if (otherItem === item) return;

              setOpen(otherItem, false);
            });
          }

          setOpen(item, !isOpen);
        });
      }
    });
  });
}
