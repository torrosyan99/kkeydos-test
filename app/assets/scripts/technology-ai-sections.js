const one = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];

const initTabs = () => {
    const section = one('[data-tech-tabs]');
    if (!section) return;
    const buttons = all('[data-tech-trigger]', section);
    const desktop = one('[data-tech-desktop]', section);
    const content = one('[data-tech-content]', desktop) ?? desktop;
    const desktopLayout = matchMedia('(min-width: 834px)');
    const select = (index) => {
        buttons.forEach((button, i) => {
            const selected = index === i;
            button.dataset.selected = String(selected);
            button.tabIndex = selected ? 0 : -1;
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
            const heights = [
                'h-[11.111%]',
                'h-[22.222%]',
                'h-[33.333%]',
                'h-[44.444%]',
                'h-[55.555%]',
                'h-[66.666%]',
                'h-[77.777%]',
                'h-[88.888%]',
                'h-full',
            ];
            desktop.classList.remove('[height:11.11111111111111%]', ...heights);
            desktop.classList.add(
                heights[index],
                'transition-[height]',
                'duration-300',
            );
        }
    };
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            select(
                !desktopLayout.matches && button.dataset.selected === 'true'
                    ? -1
                    : index,
            );
        });
        button.addEventListener('keydown', (event) => {
            let next;
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
    desktopLayout.addEventListener('change', () => {
        select(
            Math.max(
                0,
                buttons.findIndex(
                    (button) => button.dataset.selected === 'true',
                ),
            ),
        );
    });
};

const initTalentCarousel = () => {
    const carousel = one('[data-talent-carousel]');
    if (!carousel) return;
    const viewport = one('[data-talent-viewport]', carousel);
    const previous = one('[data-carousel-prev]', carousel);
    const next = one('[data-carousel-next]', carousel);
    const slides = all('[data-talent-track] > *', carousel);
    const update = () => {
        previous.disabled = viewport.scrollLeft < 2;
        next.disabled =
            viewport.scrollLeft >=
            viewport.scrollWidth - viewport.clientWidth - 2;
    };
    const slide = (direction) => {
        const positions = slides.map(
            (item) => item.offsetLeft - slides[0].offsetLeft,
        );
        const current = viewport.scrollLeft;
        const position =
            direction > 0
                ? (positions.find((value) => value > current + 2) ??
                  viewport.scrollWidth)
                : (positions.findLast((value) => value < current - 2) ?? 0);
        viewport.scrollTo({
            left: position,
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'instant'
                : 'smooth',
        });
    };
    previous.addEventListener('click', () => slide(-1));
    next.addEventListener('click', () => slide(1));
    viewport.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(viewport);
    update();

    all('[data-profile-toggle], [data-profile-close]', carousel).forEach(
        (button) => {
            button.addEventListener('click', () => {
                const card = button.closest('[data-profile]');
                const expanded = button.hasAttribute('data-profile-toggle');
                const opener = one('[data-profile-toggle]', card);
                const closer = one('[data-profile-close]', card);
                [opener, closer].forEach((control) =>
                    control.setAttribute('aria-expanded', String(expanded)),
                );
                opener.classList.toggle('hidden', expanded);
                closer.classList.toggle('hidden', !expanded);
                closer.classList.toggle('flex', expanded);
                card.classList.toggle('cursor-pointer', !expanded);
                one('[data-profile-details]', card)?.classList.toggle(
                    'hidden',
                    !expanded,
                );
                one('[data-profile-summary]', card)?.classList.toggle(
                    'hidden',
                    expanded,
                );
                const photo = one('[data-profile-photo]', card);
                photo?.classList.toggle('[height:18.25rem]', !expanded);
                photo?.classList.toggle('h-[3.75rem]', expanded);
                one('img', photo)?.classList.toggle(
                    'group-hover:scale-[1.07]',
                    !expanded,
                );
                const name = one('[data-profile-name]', card);
                name?.classList.toggle('bg-[#3d4751]', expanded);
                name?.classList.toggle('bg-none', expanded);
                const footer = one('[data-profile-footer]', card);
                footer?.classList.toggle('items-center', expanded);
                footer?.classList.toggle('items-end', !expanded);
                footer?.classList.toggle('pt-3', !expanded);
                footer?.classList.toggle('pt-6', expanded);
                one('[data-profile-client]', card)?.classList.toggle(
                    'hidden',
                    expanded,
                );
                one('[data-profile-hint]', card)?.classList.toggle(
                    'hidden',
                    expanded,
                );
                one('[data-profile-link]', card)?.classList.toggle(
                    'hidden',
                    !expanded,
                );
                (expanded ? closer : opener).focus({ preventScroll: true });
            });
        },
    );
};

const initTestimonials = () => {
    const section = one('[data-testimonials]');
    if (!section) return;
    const showMore = one('[data-show-testimonials]', section);
    showMore?.addEventListener('click', () => {
        const expanded = showMore.getAttribute('aria-expanded') !== 'true';
        showMore.setAttribute('aria-expanded', String(expanded));
        all('[data-testimonial-card]', section).forEach((card) => {
            card.classList.toggle('[&:nth-child(n+4)]:hidden', !expanded);
        });
        one('[data-show-testimonials-label]', showMore).textContent = expanded
            ? 'Show Fewer Testimonials'
            : 'Show More Testimonials';
    });
    all('[data-testimonial-toggle]', section).forEach((card) => {
        const details = one('[data-testimonial-detail]', card);
        const toggle = (expanded) => {
            card.setAttribute('aria-expanded', String(expanded));
            card.dataset.open = String(expanded);
            if (details) details.inert = !expanded;
        };
        toggle(false);
        card.addEventListener('click', (event) => {
            if (event.detail && matchMedia('(hover: hover)').matches) return;
            toggle(card.getAttribute('aria-expanded') !== 'true');
        });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') toggle(false);
            if (['Enter', ' '].includes(event.key)) {
                event.preventDefault();
                toggle(card.getAttribute('aria-expanded') !== 'true');
            }
        });
        card.addEventListener('mouseenter', () => {
            if (matchMedia('(hover: hover)').matches) toggle(true);
        });
        card.addEventListener('mouseleave', () => {
            if (matchMedia('(hover: hover)').matches) toggle(false);
        });
    });
};

initTabs();
initTalentCarousel();
initTestimonials();
