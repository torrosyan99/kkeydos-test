/* All presentation lives in the Tailwind classes in ai.html. */
import { Swiper } from '../../../assets/libs/swiper/swiper.min.js';

(() => {
    const one = (selector, root = document) => root.querySelector(selector);
    const all = (selector, root = document) => [
        ...root.querySelectorAll(selector),
    ];
    const mobileMenuButton = one('[data-mobile-menu-toggle]');
    const mobileMenu = one('#ai-mobile-menu');
    const mobileMenuLines = all('[data-menu-line]', mobileMenuButton);
    function setMobileMenuOpen(open) {
        mobileMenuButton.setAttribute('aria-expanded', String(open));
        mobileMenuButton.setAttribute(
            'aria-label',
            open ? 'Close navigation menu' : 'Open navigation menu',
        );
        mobileMenu.classList.toggle('hidden', !open);
        mobileMenuLines[0].classList.toggle('translate-y-2', open);
        mobileMenuLines[0].classList.toggle('rotate-45', open);
        mobileMenuLines[1].classList.toggle('opacity-0', open);
        mobileMenuLines[2].classList.toggle('-translate-y-2', open);
        mobileMenuLines[2].classList.toggle('-rotate-45', open);
    }
    mobileMenuButton.addEventListener('click', () =>
        setMobileMenuOpen(
            mobileMenuButton.getAttribute('aria-expanded') !== 'true',
        ),
    );
    mobileMenu.addEventListener('click', (event) => {
        if (event.target.closest('a')) setMobileMenuOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (
            event.key === 'Escape' &&
            mobileMenuButton.getAttribute('aria-expanded') === 'true'
        ) {
            setMobileMenuOpen(false);
            mobileMenuButton.focus();
        }
    });
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const scrollBehavior = () => (reducedMotion.matches ? 'instant' : 'smooth');

    // Load the project's existing font assets without an additional stylesheet.
    window.aiReady = Promise.all(
        [
            ['Variable', '300'],
            ['Regular', '400'],
            ['Medium', '500'],
            ['SemiBold', '600'],
            ['Bold', '700'],
        ].map(async ([name, weight]) => {
            const fontPath =
                name === 'Variable'
                    ? 'assets/fonts/Outfit/Outfit-Variable.ttf'
                    : `../assets/fonts/Outfit/Outfit-${name}.ttf`;
            const font = new FontFace('Outfit', `url(${fontPath})`, {
                weight,
                style: 'normal',
                display: 'swap',
            });
            document.fonts.add(await font.load());
        }),
    ).catch((error) => console.warn('Could not load the local font:', error));

    function activateWithKeyboard(element, action) {
        element.addEventListener('click', action);
        if (element.tagName === 'BUTTON') return;
        element.addEventListener('keydown', (event) => {
            if (event.target !== element || !['Enter', ' '].includes(event.key))
                return;
            event.preventDefault();
            action(event);
        });
    }

    const heroPeople = all('[data-hero-person]').slice(0, 5);
    const heroDesktop = matchMedia('(min-width: 1024px)');
    const heroCarousel = one('[data-hero-carousel]');
    let heroSwiper;
    let activeHero = 2;
    let heroTimer;
    function selectHeroPerson(index) {
        activeHero = index;
        heroPeople.forEach((person, i) => {
            person.dataset.active = String(i === index);
        });
    }
    function updateHeroMode() {
        window.clearInterval(heroTimer);
        if (heroDesktop.matches) {
            heroSwiper?.destroy(true, true);
            heroSwiper = undefined;
            selectHeroPerson(2);
            if (reducedMotion.matches) return;
            heroTimer = window.setInterval(() => {
                if (!document.hidden)
                    selectHeroPerson((activeHero + 1) % heroPeople.length);
            }, 3000);
            return;
        }
        if (!heroSwiper) {
            heroSwiper = new Swiper(heroCarousel, {
                allowTouchMove: true,
                centeredSlides: true,
                initialSlide: 2,
                slidesPerView: 'auto',
                spaceBetween: 12,
                speed: reducedMotion.matches ? 0 : 300,
                watchOverflow: false,
                on: {
                    slideChange: (swiper) =>
                        selectHeroPerson(swiper.activeIndex),
                },
            });
        } else {
            heroSwiper.params.speed = reducedMotion.matches ? 0 : 300;
        }
    }
    selectHeroPerson(2);
    updateHeroMode();
    heroDesktop.addEventListener('change', updateHeroMode);
    reducedMotion.addEventListener('change', updateHeroMode);
    document.addEventListener('visibilitychange', updateHeroMode);

    const toc = one('[data-toc]');
    const tocButton = one('[data-toc-toggle]', toc);
    const tocNavigation = one('[data-toc-navigation]', toc);
    tocButton.addEventListener('click', () => {
        const expanded = tocButton.getAttribute('aria-expanded') !== 'true';
        tocButton.setAttribute('aria-expanded', expanded);
        tocNavigation.classList.toggle('hidden', !expanded);
    });
    tocNavigation.addEventListener('click', (event) => {
        if (!event.target.closest('a')) return;
        tocButton.setAttribute('aria-expanded', 'false');
        tocNavigation.classList.add('hidden');
    });
    toc.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        tocButton.setAttribute('aria-expanded', 'false');
        tocNavigation.classList.add('hidden');
        tocButton.focus();
    });

    function setAccordion(button, expanded) {
        const panel = button.nextElementSibling;
        button.setAttribute('aria-expanded', expanded);
        panel.inert = !expanded;
        panel.classList.toggle('grid-rows-[1fr]', expanded);
        panel.classList.toggle('grid-rows-[0fr]', !expanded);
        const icon = one('[data-accordion-icon]', button);
        if (icon) {
            if (button.closest('[data-engagement]')) {
                icon.classList.toggle('rotate-90', expanded);
                icon.classList.toggle('-rotate-90', !expanded);
            } else {
                const startsOpen = button.dataset.startsOpen === 'true';
                icon.classList.toggle('rotate-180', startsOpen !== expanded);
            }
            icon.classList.add('transition-transform', 'duration-300');
        }
        if (button.closest('[data-engagement]')) {
            button.classList.toggle('font-bold', expanded);
            button.classList.toggle('font-normal', !expanded);
            const card = button.parentElement;
            card.classList.toggle('border-[#f66135]', expanded);
            card.classList.toggle('border-[#d9dcdf]', !expanded);
            card.classList.toggle(
                'shadow-[0_10px_15px_-3px_#0000001a,_0_4px_6px_-4px_#0000001a]',
                expanded,
            );
        }
        const track = one('[data-service-track]', button);
        const progress = one('[data-service-progress]', button);
        if (track) {
            button.classList.toggle('mt-3', expanded);
            panel.classList.toggle('mb-6', expanded);
            panel.classList.toggle('mb-3', !expanded);
            track.classList.toggle('h-[45%]', !expanded);
            track.classList.toggle('h-[85%]', expanded);
            progress.classList.toggle('h-0', !expanded);
            progress.classList.toggle('h-[85%]', expanded);
            [track, progress].forEach((bar) => {
                bar.classList.toggle('top-1.5', !expanded);
                bar.classList.toggle('top-[0.875rem]', expanded);
            });
            progress.classList.add('origin-top');
        }
    }
    all('[data-faq], [data-engagement]').forEach((group) => {
        const triggers = all('[data-accordion-trigger]', group);
        triggers.forEach((button) => {
            button.dataset.startsOpen = button.getAttribute('aria-expanded');
            setAccordion(
                button,
                button.getAttribute('aria-expanded') === 'true',
            );
            activateWithKeyboard(button, () => {
                const expanded =
                    button.getAttribute('aria-expanded') !== 'true';
                triggers.forEach((other) =>
                    setAccordion(other, other === button && expanded),
                );
            });
        });
    });

    // Start in view; a manual selection permanently ends autoplay for this visit.
    const services = one('[data-services]');
    const serviceList = one('[data-services-list]', services);
    const serviceButtons = all('[data-accordion-trigger]', services);
    let activeService = 0;
    let serviceAnimation;
    let servicesVisible = false;
    let servicesHovered = false;
    let servicesFocused = false;
    let serviceSelectedManually = false;

    function updateServicePlayback() {
        if (!serviceAnimation || serviceSelectedManually) return;
        if (
            !servicesVisible ||
            servicesHovered ||
            servicesFocused ||
            document.hidden ||
            reducedMotion.matches
        ) {
            serviceAnimation.pause();
        } else {
            serviceAnimation.play();
        }
    }

    function selectService(index, manual = false) {
        serviceAnimation?.cancel();
        serviceAnimation = null;
        activeService = index;
        serviceSelectedManually ||= manual;
        serviceButtons.forEach((button, i) =>
            setAccordion(button, i === index),
        );
        if (index < 0 || reducedMotion.matches || serviceSelectedManually)
            return;

        const progress = one('[data-service-progress]', serviceButtons[index]);
        serviceAnimation = progress.animate(
            [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
            {
                duration: 10000,
                easing: 'linear',
                fill: 'forwards',
            },
        );
        serviceAnimation.onfinish = () => {
            if (!serviceSelectedManually)
                selectService((activeService + 1) % serviceButtons.length);
        };
        if (!serviceSelectedManually) updateServicePlayback();
    }

    serviceButtons.forEach((button, index) => {
        activateWithKeyboard(button, () => selectService(index, true));
        button.parentElement.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'mouse' || index !== activeService)
                return;
            servicesHovered = true;
            updateServicePlayback();
        });
        button.parentElement.addEventListener('pointerleave', () => {
            servicesHovered = false;
            updateServicePlayback();
        });
    });
    services.addEventListener('focusin', () => {
        servicesFocused = true;
        updateServicePlayback();
    });
    services.addEventListener('focusout', (event) => {
        servicesFocused = services.contains(event.relatedTarget);
        updateServicePlayback();
    });
    document.addEventListener('visibilitychange', updateServicePlayback);
    reducedMotion.addEventListener('change', () =>
        selectService(activeService),
    );
    const servicesObserver = new IntersectionObserver(
        ([entry]) => {
            servicesVisible = entry.isIntersecting;
            updateServicePlayback();
        },
        { threshold: 0 },
    );
    servicesObserver.observe(serviceList);
    selectService(0);

    function tabKeyboard(buttons, select) {
        buttons.forEach((button, index) => {
            button.addEventListener('keydown', (event) => {
                const last = buttons.length - 1;
                let next;
                if (['ArrowRight', 'ArrowDown'].includes(event.key))
                    next = (index + 1) % buttons.length;
                if (['ArrowLeft', 'ArrowUp'].includes(event.key))
                    next = (index + last) % buttons.length;
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = last;
                if (next === undefined) return;
                event.preventDefault();
                select(next);
                buttons[next].focus();
            });
        });
    }
    const team = one('[data-team-tabs]');
    const teamButtons = all('[data-tab-trigger]', team);
    const teamDesktop = one('[data-tab-desktop]', team);
    const teamDesktopLayout = matchMedia('(min-width: 640px)');
    function selectTeam(index) {
        teamButtons.forEach((button, i) => {
            const selected = i === index;
            button.dataset.selected = selected;
            button.tabIndex = selected ? 0 : -1;
            button.classList.toggle('border-[#f66135]', selected);
            button.classList.toggle('border-[#d9dcdf]', !selected);
            button.classList.toggle('text-[#111111]', selected);
            button.classList.toggle('text-[#3d4751]', !selected);
            button.classList.toggle(
                'shadow-[0_20px_25px_-5px_#0000001a,_0_8px_10px_-6px_#0000001a]',
                selected,
            );
            button.classList.toggle('cursor-default', selected);
            const icon = one('[data-tab-icon]', button);
            icon.classList.toggle('bg-[#f66135]', selected);
            icon.classList.toggle('bg-[#fbc4b2]', !selected);
            const mobile = one(`[data-tab-mobile="${i}"]`, team);
            const panel = mobile.firstElementChild;
            panel.classList.toggle('grid-rows-[1fr]', selected);
            panel.classList.toggle('grid-rows-[0fr]', !selected);
            panel.inert = !selected;
            if (selected) teamDesktop.innerHTML = panel.innerHTML;
        });
    }
    teamButtons.forEach((button, i) =>
        activateWithKeyboard(button, () => selectTeam(i)),
    );
    tabKeyboard(teamButtons, selectTeam);
    selectTeam(0);
    teamDesktopLayout.addEventListener('change', () => {
        selectTeam(
            teamButtons.findIndex(
                (button) => button.dataset.selected === 'true',
            ),
        );
    });

    const technology = one('[data-tech-tabs]');
    const techButtons = all('[data-tech-trigger]', technology);
    const techDesktop = one('[data-tech-desktop]', technology);
    const techDesktopLayout = matchMedia('(min-width: 834px)');
    // The desktop detail frame also includes the vertical orange selection marker.
    const techContent = one('[data-tech-content]', techDesktop) ?? techDesktop;
    function selectTechnology(index) {
        techButtons.forEach((button, i) => {
            const selected = index === i;
            button.dataset.selected = selected;
            button.tabIndex = selected ? 0 : -1;
            const card = one('[data-tech-card]', button);
            card.classList.toggle('border-[#f66135]', selected);
            card.classList.toggle('border-[#ffffff]', !selected);
            card.classList.toggle(
                'shadow-[0_10px_15px_-3px_#0000001a,_0_4px_6px_-4px_#0000001a]',
                selected,
            );
            const title = one('[data-tech-title]', card);
            title.classList.toggle('font-bold', selected);
            const connector = one('[data-tech-connector]', button);
            connector?.classList.toggle('opacity-0', !selected);
            const mobile = one('[data-tech-mobile]', button);
            const panel = mobile.firstElementChild;
            panel.classList.toggle('hidden', !selected);
            panel.inert = !selected;
            if (selected && techContent)
                techContent.innerHTML = panel.firstElementChild.innerHTML;
        });
        if (techDesktop && index >= 0) {
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
            techDesktop.classList.remove(
                '[height:11.11111111111111%]',
                ...heights,
            );
            techDesktop.classList.add(
                heights[index],
                'transition-[height]',
                'duration-300',
            );
        }
    }
    techButtons.forEach((button, i) =>
        activateWithKeyboard(button, () =>
            selectTechnology(
                !techDesktopLayout.matches && button.dataset.selected === 'true'
                    ? -1
                    : i,
            ),
        ),
    );
    tabKeyboard(techButtons, selectTechnology);
    selectTechnology(0);
    techDesktopLayout.addEventListener('change', () => {
        selectTechnology(
            Math.max(
                0,
                techButtons.findIndex(
                    (button) => button.dataset.selected === 'true',
                ),
            ),
        );
    });

    all('[data-case-card]').forEach((card) => {
        const details = one('[data-case-details]', card);
        const front = one('[data-case-front]', card);
        function setOpen(open) {
            card.dataset.open = open;
            card.setAttribute('aria-expanded', open);
            details.inert = !open;
            front.inert = open;
        }
        setOpen(false);
        activateWithKeyboard(card, (event) => {
            if (event.target.closest('a')) return;
            if (
                event.detail &&
                matchMedia('(min-width: 834px) and (hover: hover)').matches
            )
                return;
            setOpen(card.dataset.open !== 'true');
        });
        card.addEventListener('mouseenter', () => {
            if (matchMedia('(min-width: 834px) and (hover: hover)').matches)
                setOpen(true);
        });
        card.addEventListener('mouseleave', () => {
            if (matchMedia('(min-width: 834px) and (hover: hover)').matches)
                setOpen(false);
        });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') setOpen(false);
        });
    });
    const caseButton = one('[data-show-cases]');
    const caseGrid = one('[data-case-grid]');
    caseButton.addEventListener('click', () => {
        const expanded = true;
        caseButton.setAttribute('aria-expanded', expanded);
        caseGrid.classList.toggle('auto-rows-[0px]', !expanded);
        caseGrid.classList.toggle(
            'auto-rows-[minmax(20rem,min-content)]',
            expanded,
        );
        caseButton.disabled = true;
        updateCaseAccessibility();
    });
    function updateCaseAccessibility() {
        const width = window.innerWidth;
        const visible = width >= 1024 ? 3 : width >= 640 ? 2 : 3;
        const expanded = caseButton.getAttribute('aria-expanded') === 'true';
        all(':scope > li', caseGrid).forEach((card, i) => {
            card.inert = !expanded && i >= visible;
        });
    }
    updateCaseAccessibility();
    window.addEventListener('resize', updateCaseAccessibility);

    const carousel = one('[data-talent-carousel]');
    const viewport = one('[data-talent-viewport]', carousel);
    const previous = one('[data-carousel-prev]', carousel);
    const next = one('[data-carousel-next]', carousel);
    function updateCarousel() {
        previous.disabled = viewport.scrollLeft < 2;
        next.disabled =
            viewport.scrollLeft >=
            viewport.scrollWidth - viewport.clientWidth - 2;
    }
    function slide(direction) {
        const slides = all('[data-talent-track] > *', carousel);
        const positions = slides.map(
            (item) => item.offsetLeft - slides[0].offsetLeft,
        );
        const current = viewport.scrollLeft;
        const nextPosition =
            direction > 0
                ? (positions.find((position) => position > current + 2) ??
                  viewport.scrollWidth)
                : (positions.findLast((position) => position < current - 2) ??
                  0);
        viewport.scrollTo({ left: nextPosition, behavior: scrollBehavior() });
    }
    previous.addEventListener('click', () => slide(-1));
    next.addEventListener('click', () => slide(1));
    viewport.addEventListener('scroll', updateCarousel, { passive: true });
    new ResizeObserver(updateCarousel).observe(viewport);
    all('[data-profile-toggle], [data-profile-close]').forEach((button) => {
        button.addEventListener('click', () => {
            const card = button.closest('[data-profile]');
            const expanded = button.hasAttribute('data-profile-toggle');
            const opener = one('[data-profile-toggle]', card);
            const closer = one('[data-profile-close]', card);
            [opener, closer].forEach((control) =>
                control.setAttribute('aria-expanded', expanded),
            );
            opener.classList.toggle('hidden', expanded);
            closer.classList.toggle('hidden', !expanded);
            closer.classList.toggle('flex', expanded);
            card.classList.toggle('cursor-pointer', !expanded);
            const details = one('[data-profile-details]', card);
            const summary = one('[data-profile-summary]', card);
            details.classList.toggle('hidden', !expanded);
            summary.classList.toggle('hidden', expanded);
            const photo = one('[data-profile-photo]', card);
            photo.classList.toggle('[height:18.25rem]', !expanded);
            photo.classList.toggle('h-[3.75rem]', expanded);
            one('img', photo).classList.toggle(
                'group-hover:scale-[1.07]',
                !expanded,
            );
            const namebar = one('[data-profile-name]', card);
            namebar.classList.toggle('bg-[#3d4751]', expanded);
            namebar.classList.toggle('bg-none', expanded);
            const footer = one('[data-profile-footer]', card);
            footer.classList.toggle('items-center', expanded);
            footer.classList.toggle('items-end', !expanded);
            footer.classList.toggle('pt-3', !expanded);
            footer.classList.toggle('pt-6', expanded);
            one('[data-profile-client]', card).classList.toggle(
                'hidden',
                expanded,
            );
            one('[data-profile-hint]', card).classList.toggle(
                'hidden',
                expanded,
            );
            one('[data-profile-link]', card)?.classList.toggle(
                'hidden',
                !expanded,
            );
            (expanded ? closer : opener).focus({ preventScroll: true });
        });
    });

    const testimonials = one('[data-testimonials]');
    const showTestimonials = one('[data-show-testimonials]');
    showTestimonials.addEventListener('click', () => {
        const expanded =
            showTestimonials.getAttribute('aria-expanded') !== 'true';
        showTestimonials.setAttribute('aria-expanded', expanded);
        all('[data-testimonial-card]', testimonials).forEach((card) => {
            card.classList.toggle('[&:nth-child(n+4)]:hidden', !expanded);
        });
        one('[data-show-testimonials-label]', showTestimonials).textContent =
            expanded ? 'Show Fewer Testimonials' : 'Show More Testimonials';
    });
    all('[data-testimonial-toggle]').forEach((card) => {
        const details = one('[data-testimonial-detail]', card);
        function toggle(expanded) {
            card.setAttribute('aria-expanded', expanded);
            card.dataset.open = expanded;
            details.inert = !expanded;
        }
        toggle(false);
        card.addEventListener('click', (event) => {
            if (event.detail && matchMedia('(hover: hover)').matches) return;
            toggle(card.getAttribute('aria-expanded') !== 'true');
        });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') toggle(false);
        });
        card.addEventListener('mouseenter', () => {
            if (matchMedia('(hover: hover)').matches) toggle(true);
        });
        card.addEventListener('mouseleave', () => {
            if (matchMedia('(hover: hover)').matches) toggle(false);
        });
    });

    all('[data-engagement-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') !== 'true';
            button.setAttribute('aria-expanded', expanded);
            const panel = button.parentElement.nextElementSibling;
            panel.classList.toggle('grid-rows-[0fr]', !expanded);
            panel.classList.toggle('grid-rows-[1fr]', expanded);
            const icon = one('[data-engagement-icon]', button);
            icon?.classList.toggle('rotate-45', expanded);
        });
    });

    const modal = one('[data-video-dialog]');
    const video = one('video', modal);
    all('[data-video]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            video.src = trigger.dataset.video;
            modal.showModal();
            document.body.classList.add('overflow-hidden');
            video.play().catch(() => {});
        });
    });
    one('[data-close-video]', modal).addEventListener('click', () =>
        modal.close(),
    );
    modal.addEventListener('click', (event) => {
        if (event.target === modal) modal.close();
    });
    modal.addEventListener('close', () => {
        video.pause();
        video.removeAttribute('src');
        video.load();
        document.body.classList.remove('overflow-hidden');
    });

    // Move the background client logos one row at a time, pausing off screen or on hover.
    const logos = one('[data-client-logos]');
    if (logos && !reducedMotion.matches) {
        let visible = false;
        let hovered = false;
        const section = logos.closest('section');
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
        }).observe(section);
        section.addEventListener('mouseenter', () => {
            hovered = true;
        });
        section.addEventListener('mouseleave', () => {
            hovered = false;
        });
        setInterval(() => {
            if (!visible || hovered || document.hidden) return;
            logos.classList.add('transition-transform', '-translate-y-24');
            logos.classList.remove('translate-y-0');
            setTimeout(() => {
                const columns =
                    getComputedStyle(logos).gridTemplateColumns.split(
                        ' ',
                    ).length;
                logos.append(...[...logos.children].slice(0, columns));
                logos.classList.remove(
                    'transition-transform',
                    '-translate-y-24',
                );
                logos.classList.add('translate-y-0');
            }, 710);
        }, 3500);
    }

    one('[data-hero-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const message = one('[data-form-message]');
        message.classList.remove('hidden');
        message.textContent =
            'Your details are ready. Continue to schedule a call.';
        const link = document.createElement('a');
        link.href = 'https://www.bairesdev.com/start/basic-details/';
        link.className =
            'mt-2 block font-medium text-[#f66135] underline hover:text-[#d64e29]';
        link.textContent = 'Continue to schedule a call →';
        message.append(link);
    });
})();
