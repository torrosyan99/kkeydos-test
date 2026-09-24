const desktopLayout = window.matchMedia('(min-width: 834px)');

export const initCardSelectors = () => {
    const cards = [...document.querySelectorAll('details[data-card-selector]')];

    if (!cards.length) return;

    const mobileState = new WeakMap(cards.map((card) => [card, card.open]));
    let syncing = false;

    const syncCards = () => {
        syncing = true;

        cards.forEach((card) => {
            card.open = desktopLayout.matches
                ? true
                : (mobileState.get(card) ?? false);
        });

        syncing = false;
    };

    cards.forEach((card) => {
        const summary = card.querySelector(':scope > summary');

        summary?.addEventListener('click', (event) => {
            if (desktopLayout.matches) event.preventDefault();
        });

        card.addEventListener('toggle', () => {
            if (!syncing && !desktopLayout.matches) {
                mobileState.set(card, card.open);
            }
        });
    });

    desktopLayout.addEventListener('change', syncCards);
    syncCards();
};
