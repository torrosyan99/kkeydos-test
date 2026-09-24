import { marquee } from '../libs/vanilla-marquee/vanilla-marquee.js';
import '../libs/text-rotator/text-rotator.js';
import { initCardSelectors } from './components/card-selector.js';

const initHeader = () => {
    const header = document.querySelector('[data-site-header]');

    if (!header) return;

    const mobileMenuButton = header.querySelector('[data-mobile-menu-toggle]');
    const mobileMenu = header.querySelector('[data-mobile-menu]');

    const mobileToggles = [...header.querySelectorAll('.mobile-menu-toggle')];

    if (!mobileMenuButton || !mobileMenu) return;

    const desktopLayout = window.matchMedia('(min-width: 1024px)');
    const setMobileAccordion = (toggle, isOpen) => {
        const panel = toggle.nextElementSibling;

        if (!panel?.classList.contains('mobile-menu-item')) {
            return;
        }

        toggle.setAttribute('aria-expanded', String(isOpen));
        panel.dataset.open = String(isOpen);
    };

    const closeMobileAccordions = () => {
        mobileToggles.forEach((toggle) => {
            setMobileAccordion(toggle, false);
        });
    };

    const closeMobileMenu = () => {
        mobileMenu.classList.add('hidden');

        mobileMenu.dataset.open = 'false';

        mobileMenuButton.setAttribute('aria-expanded', 'false');
        mobileMenuButton.setAttribute('aria-label', 'Open navigation');

        closeMobileAccordions();

        document.body.classList.remove('overflow-hidden');
    };

    const openMobileMenu = () => {
        mobileMenu.classList.remove('hidden');

        mobileMenu.dataset.open = 'true';

        mobileMenuButton.setAttribute('aria-expanded', 'true');
        mobileMenuButton.setAttribute('aria-label', 'Close navigation');

        // Restore the header if the scroll handler previously hid it.
        header.classList.remove('-translate-y-full');

        document.body.classList.add('overflow-hidden');
    };

    mobileMenuButton.addEventListener('click', () => {
        const isOpen =
            mobileMenuButton.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (
            event.key === 'Escape' &&
            mobileMenuButton.getAttribute('aria-expanded') === 'true'
        ) {
            closeMobileMenu();
            mobileMenuButton.focus({ preventScroll: true });
        }
    });

    mobileToggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const wasOpen = toggle.getAttribute('aria-expanded') === 'true';

            // Keep only one mobile accordion panel open at a time.
            closeMobileAccordions();

            if (!wasOpen) {
                setMobileAccordion(toggle, true);
            }
        });
    });

    desktopLayout.addEventListener('change', (event) => {
        if (event.matches) {
            closeMobileMenu();
        }
    });

    closeMobileAccordions();
};

const initMarquees = () => {
    document.querySelectorAll('[data-marquee]').forEach((element) => {
        const gap = Number(element.dataset.marqueeGap);
        const speed = Number(element.dataset.marqueeSpeed);

        new marquee(element, {
            direction: element.dataset.marqueeDirection || 'left',

            duplicated:
                element.dataset.marqueeDuplicated === undefined
                    ? true
                    : element.dataset.marqueeDuplicated === 'true' ||
                      element.dataset.marqueeDuplicated === '',

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
};

function initUI() {
    initHeader();
    initMarquees();
    initCardSelectors();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI, {
        once: true,
    });
} else {
    initUI();
}
