const one = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];

const initTabs = () => {
    const section = one('[data-tech-tabs]');
    if (!section) return;
    const buttons = all('[data-tech-trigger]', section);
    const desktop = one('[data-tech-desktop]', section);
    const content = one('[data-tech-content]', desktop) ?? desktop;
    const desktopLayout = matchMedia('(min-width: 834px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = 0;
    let visible = false;
    let keyboardFocused = false;
    let timer;
    const select = (index) => {
        activeIndex = index;
        buttons.forEach((button, i) => {
            const selected = index === i;
            button.dataset.selected = String(selected);
            button.setAttribute('aria-selected', String(selected));
            button.tabIndex = selected || (index < 0 && i === 0) ? 0 : -1;
            const card = one('[data-tech-card]', button);
            card?.classList.toggle('border-[#f66135]', selected);
            card?.classList.toggle('border-[#ffffff]', !selected);
            card?.classList.toggle(
                'shadow-[0_10px_15px_-3px_#0000001a,_0_4px_6px_-4px_#0000001a]',
                selected,
            );
            one('[data-tech-title]', card)?.classList.toggle(
                'font-bold',
                selected,
            );
            one('[data-tech-connector]', button)?.classList.toggle(
                'opacity-0',
                !selected,
            );
            const mobile = one('[data-tech-mobile]', button);
            const panel = mobile?.firstElementChild;
            panel?.classList.toggle('hidden', !selected);
            if (panel) panel.inert = !selected;
            if (selected && panel && content)
                content.innerHTML =
                    one('[data-tech-content]', panel)?.innerHTML ??
                    panel.innerHTML;
        });
        if (desktop && index >= 0) {
            desktop.style.height = `${((index + 1) / buttons.length) * 100}%`;
        }
    };
    const updateAutoplay = () => {
        clearInterval(timer);
        if (
            !visible ||
            keyboardFocused ||
            document.hidden ||
            reducedMotion.matches
        )
            return;
        timer = setInterval(
            () => select((activeIndex + 1) % buttons.length),
            3000,
        );
    };
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            select(
                !desktopLayout.matches && button.dataset.selected === 'true'
                    ? -1
                    : index,
            );
            updateAutoplay();
        });
        button.addEventListener('keydown', (event) => {
            keyboardFocused = true;
            updateAutoplay();
            let next;
            if (['Enter', ' '].includes(event.key)) next = index;
            if (['ArrowRight', 'ArrowDown'].includes(event.key))
                next = (index + 1) % buttons.length;
            if (['ArrowLeft', 'ArrowUp'].includes(event.key))
                next = (index + buttons.length - 1) % buttons.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = buttons.length - 1;
            if (next === undefined) return;
            event.preventDefault();
            select(next);
            buttons[next].focus();
        });
    });
    select(0);
    new IntersectionObserver(
        ([entry]) => {
            visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
            updateAutoplay();
        },
        { threshold: [0, 0.2] },
    ).observe(section);
    section.addEventListener('focusin', () => {
        keyboardFocused = document.activeElement.matches(':focus-visible');
        updateAutoplay();
    });
    section.addEventListener('focusout', (event) => {
        if (section.contains(event.relatedTarget)) return;
        keyboardFocused = false;
        updateAutoplay();
    });
    section.addEventListener('pointerdown', () => {
        keyboardFocused = false;
        updateAutoplay();
    });
    document.addEventListener('visibilitychange', updateAutoplay);
    reducedMotion.addEventListener('change', updateAutoplay);
    desktopLayout.addEventListener('change', () => {
        select(
            Math.max(
                0,
                buttons.findIndex(
                    (button) => button.dataset.selected === 'true',
                ),
            ),
        );
        updateAutoplay();
    });
};

initTabs();

const initFaq = () => {
    const section = one('[data-faq]');
    if (!section) return;
    const buttons = all('[data-accordion-trigger]', section);
    const setOpen = (button, open) => {
        button.setAttribute('aria-expanded', String(open));
        const panel = button.nextElementSibling;
        panel.inert = !open;
        panel.classList.toggle('grid-rows-[1fr]', open);
        panel.classList.toggle('grid-rows-[0fr]', !open);
        one('[data-accordion-icon]', button)?.classList.toggle(
            'rotate-180',
            open,
        );
    };
    buttons.forEach((button) => {
        setOpen(button, button.getAttribute('aria-expanded') === 'true');
        button.addEventListener('click', () => {
            const open = button.getAttribute('aria-expanded') !== 'true';
            buttons.forEach((item) => setOpen(item, item === button && open));
        });
    });
};

const initClientLogos = () => {
    const logos = one('[data-client-logos]');
    if (!logos) return;
    const section = logos.closest('section');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let frame;

    const update = () => {
        frame = undefined;
        if (reducedMotion.matches) {
            logos.style.removeProperty('--client-logo-offset');
            return;
        }
        if (!visible || document.hidden) return;
        // Match the reference: half-speed parallax, centered on the logo grid.
        const offset = (innerHeight - section.getBoundingClientRect().top) / 2;
        logos.style.setProperty('--client-logo-offset', `${offset}px`);
    };
    const schedule = () => {
        if (frame === undefined) frame = requestAnimationFrame(update);
    };
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        schedule();
    }).observe(section);
    new ResizeObserver(schedule).observe(section);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', schedule);
};

initFaq();
initClientLogos();
