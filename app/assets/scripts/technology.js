import { Swiper } from '../libs/swiper/swiper.min.js';

const initAiProfessionals = () => {
    const carousel = document.querySelector('[data-ai-professionals]');
    if (!carousel) return;

    const wrapper = carousel.querySelector('.swiper-wrapper');
    const people = [...wrapper.querySelectorAll('[data-ai-person]')];
    const desktopPeople = people.filter(
        (person) => !person.hasAttribute('data-ai-mobile-only'),
    );
    const desktop = window.matchMedia('(min-width: 1024px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = window.matchMedia('(hover: hover)');
    let desktopIndex = 2;
    let mobileIndex = 3;
    let swiper;
    let timer;
    let visible = true;
    let hovered = false;
    let focused = false;

    const selectDesktopPerson = (index) => {
        desktopIndex = index;
        people.forEach((person) => {
            person.dataset.active = String(person === desktopPeople[index]);
            person.dataset.distance = '1';
        });
    };

    const selectMobilePerson = (instance) => {
        mobileIndex = Number(
            instance.slides[instance.activeIndex]?.dataset.aiPerson ??
                mobileIndex,
        );
        instance.slides.forEach((person, index) => {
            const distance = Math.abs(index - instance.activeIndex);
            person.dataset.active = String(index === instance.activeIndex);
            person.dataset.distance = String(
                Math.min(distance, instance.slides.length - distance),
            );
        });
    };

    const updateMotion = () => {
        window.clearInterval(timer);
        const canMove =
            !reducedMotion.matches &&
            !document.hidden &&
            visible &&
            !hovered &&
            !focused;
        if (swiper) {
            if (canMove && !swiper.autoplay.running) swiper.autoplay.start();
            else if (!canMove && swiper.autoplay.running)
                swiper.autoplay.stop();
        } else if (desktop.matches && canMove) {
            timer = window.setInterval(() => {
                selectDesktopPerson((desktopIndex + 1) % desktopPeople.length);
            }, 3400);
        }
    };

    const updateLayout = () => {
        if (desktop.matches) {
            if (swiper) {
                swiper.destroy(true, true);
                swiper = undefined;
                // Restore the four desktop cards in their original order after loop mode.
                wrapper.replaceChildren(...people);
            }
            selectDesktopPerson(desktopIndex);
        } else if (!swiper) {
            // Two copies let five unique portraits stay visible through the loop boundary.
            const copies = people.map((person) => {
                const copy = person.cloneNode(true);
                copy.dataset.aiClone = '';
                return copy;
            });
            wrapper.replaceChildren(...people, ...copies);
            swiper = new Swiper(carousel, {
                slidesPerView: 5,
                centeredSlides: true,
                initialSlide: mobileIndex,
                spaceBetween: 4,
                loop: true,
                speed: reducedMotion.matches ? 0 : 750,
                allowTouchMove: true,
                grabCursor: true,
                watchSlidesProgress: true,
                autoplay: {
                    delay: 2800,
                    disableOnInteraction: false,
                    waitForTransition: true,
                },
                breakpoints: {
                    640: { spaceBetween: 8 },
                },
                on: {
                    init: selectMobilePerson,
                    slideChange: selectMobilePerson,
                    loopFix: selectMobilePerson,
                },
            });
        } else {
            swiper.params.speed = reducedMotion.matches ? 0 : 750;
        }
        updateMotion();
    };

    carousel.addEventListener('keydown', (event) => {
        if (!swiper || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'ArrowRight') swiper.slideNext();
        else swiper.slidePrev();
    });
    carousel.addEventListener('mouseenter', () => {
        hovered = hover.matches;
        updateMotion();
    });
    carousel.addEventListener('mouseleave', () => {
        hovered = false;
        updateMotion();
    });
    carousel.addEventListener('focusin', () => {
        focused = true;
        updateMotion();
    });
    carousel.addEventListener('focusout', (event) => {
        focused = carousel.contains(event.relatedTarget);
        updateMotion();
    });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            updateMotion();
        }).observe(carousel);
    }
    desktop.addEventListener('change', updateLayout);
    reducedMotion.addEventListener('change', updateLayout);
    document.addEventListener('visibilitychange', updateMotion);
    updateLayout();
};

const initTableOfContents = () => {
    const toc = document.querySelector('[data-toc]');
    if (!toc) return;

    const toggle = toc.querySelector('[data-toc-toggle]');
    const navigation = toc.querySelector('[data-toc-navigation]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const setExpanded = (expanded) => {
        toggle.setAttribute('aria-expanded', String(expanded));
        navigation.hidden = !expanded;
    };

    toggle.addEventListener('click', () => {
        setExpanded(toggle.getAttribute('aria-expanded') !== 'true');
    });
    toggle.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowDown') return;
        event.preventDefault();
        setExpanded(true);
        navigation.querySelector('a')?.focus();
    });
    toc.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || navigation.hidden) return;
        event.preventDefault();
        setExpanded(false);
        toggle.focus();
    });
    navigation.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const target = document.getElementById(link.hash.slice(1));
        // Keep native hash links until the corresponding page sections are added.
        if (!target) return;

        event.preventDefault();
        const headerHeight =
            document.querySelector('[data-site-header]')?.offsetHeight ?? 0;
        const top =
            target.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            16;
        if (window.location.hash !== link.hash)
            window.history.pushState(null, '', link.hash);
        window.scrollTo({
            top: Math.max(0, top),
            behavior: reducedMotion.matches ? 'instant' : 'smooth',
        });
    });
};

const panelAnimations = new WeakMap();
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

const setPanelExpanded = (panel, expanded, animate = true) => {
    const previousHeight = panel.hidden
        ? 0
        : panel.getBoundingClientRect().height;
    panelAnimations.get(panel)?.cancel();
    panel.inert = !expanded;
    if (!animate || motionPreference.matches) {
        panel.hidden = !expanded;
        return;
    }
    if (panel.hidden && !expanded) return;
    panel.hidden = false;
    const nextHeight = expanded
        ? panel.firstElementChild.getBoundingClientRect().height
        : 0;
    const animation = panel.animate(
        [{ height: `${previousHeight}px` }, { height: `${nextHeight}px` }],
        { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' },
    );
    panelAnimations.set(panel, animation);
    animation.onfinish = () => {
        panel.hidden = !expanded;
        panelAnimations.delete(panel);
    };
};

const initServices = () => {
    const section = document.querySelector('[data-services]');
    if (!section) return;
    const list = section.querySelector('[data-services-list]');
    const items = [...list.querySelectorAll('[data-service-item]')];
    const triggers = items.map((item) =>
        item.querySelector('[data-service-trigger]'),
    );
    let activeIndex = 0;
    let manual = false;
    let visible = false;
    let progressAnimation;

    const updatePlayback = () => {
        if (!progressAnimation || manual) return;
        if (visible && !document.hidden && !motionPreference.matches)
            progressAnimation.play();
        else progressAnimation.pause();
    };
    const selectService = (
        index,
        { userInitiated = false, animate = true } = {},
    ) => {
        manual ||= userInitiated;
        section.dataset.playback = manual ? 'manual' : 'auto';
        progressAnimation?.cancel();
        progressAnimation = undefined;
        activeIndex = index;
        items.forEach((item, itemIndex) => {
            const expanded = itemIndex === index;
            const changed = item.dataset.active !== String(expanded);
            item.dataset.active = String(expanded);
            triggers[itemIndex].setAttribute('aria-expanded', String(expanded));
            if (changed || !animate)
                setPanelExpanded(
                    item.querySelector('[data-service-panel]'),
                    expanded,
                    animate,
                );
        });
        if (manual || motionPreference.matches) return;
        progressAnimation = items[index]
            .querySelector('[data-service-progress]')
            .animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], {
                duration: 10000,
                easing: 'linear',
                fill: 'forwards',
            });
        progressAnimation.onfinish = () => {
            if (!manual) selectService((activeIndex + 1) % items.length);
        };
        updatePlayback();
    };
    triggers.forEach((trigger, index) => {
        trigger.addEventListener('click', () =>
            selectService(index, { userInitiated: true }),
        );
    });
    new IntersectionObserver(
        ([entry]) => {
            visible = entry.isIntersecting;
            updatePlayback();
        },
        { rootMargin: '-10% 0px -15% 0px', threshold: 0 },
    ).observe(list);
    document.addEventListener('visibilitychange', updatePlayback);
    motionPreference.addEventListener('change', () =>
        selectService(activeIndex, { animate: false }),
    );
    selectService(0, { animate: false });
};

const initTeamDetails = () => {
    const section = document.querySelector('[data-technology-team]');
    if (!section) return;
    const triggers = [...section.querySelectorAll('[data-team-trigger]')];
    const panels = [...section.querySelectorAll('[data-team-panel]')];
    const desktopPanel = section.querySelector('[data-team-desktop]');
    const desktop = window.matchMedia('(min-width: 640px)');
    let selectedIndex = 0;
    let desktopAnimation;
    const select = (index, animate = true) => {
        selectedIndex = index;
        triggers.forEach((trigger, itemIndex) => {
            const expanded = itemIndex === index;
            trigger.dataset.selected = String(expanded);
            trigger.setAttribute('aria-expanded', String(expanded));
            setPanelExpanded(
                panels[itemIndex],
                expanded,
                animate && !desktop.matches,
            );
        });
        const previousHeight = desktopPanel.getBoundingClientRect().height;
        desktopAnimation?.cancel();
        desktopPanel.replaceChildren(
            panels[index].firstElementChild.cloneNode(true),
        );
        // The desktop frame supplies the border and spacing itself.
        desktopPanel.firstElementChild.className = '';
        if (animate && desktop.matches && !motionPreference.matches) {
            const nextHeight = desktopPanel.getBoundingClientRect().height;
            desktopAnimation = desktopPanel.animate(
                [
                    { height: `${previousHeight}px`, opacity: 0.65 },
                    { height: `${nextHeight}px`, opacity: 1 },
                ],
                { duration: 300, easing: 'ease-out' },
            );
        }
    };
    triggers.forEach((trigger, index) => {
        trigger.addEventListener('click', () => select(index));
        trigger.addEventListener('keydown', (event) => {
            let next;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
                next = (index + 1) % triggers.length;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
                next = (index + triggers.length - 1) % triggers.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = triggers.length - 1;
            if (next === undefined) return;
            event.preventDefault();
            select(next);
            triggers[next].focus({ preventScroll: true });
        });
    });
    desktop.addEventListener('change', () => select(selectedIndex, false));
    select(0, false);
};

const initCaseStudies = () => {
    const section = document.querySelector('[data-technology-cases]');
    if (!section) return;
    const list = section.querySelector('[data-case-list]');
    const showMore = section.querySelector('[data-show-cases]');
    const cards = [...list.querySelectorAll('[data-case-card]')];
    const hover = window.matchMedia('(min-width: 834px) and (hover: hover)');
    cards.forEach((card) => {
        const details = card.querySelector('[data-case-details]');
        let animation;
        const setOpen = (open) => {
            const previousHeight = card.getBoundingClientRect().height;
            animation?.cancel();
            card.dataset.open = String(open);
            card.setAttribute('aria-expanded', String(open));
            details.inert = !open;
            if (window.innerWidth < 834 && !motionPreference.matches) {
                const nextHeight = card.getBoundingClientRect().height;
                animation = card.animate(
                    [
                        { height: `${previousHeight}px` },
                        { height: `${nextHeight}px` },
                    ],
                    { duration: 350, easing: 'ease-out' },
                );
            }
        };
        card.addEventListener('click', (event) => {
            if (event.detail && hover.matches) return;
            setOpen(card.dataset.open !== 'true');
        });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') setOpen(false);
            if (!['Enter', ' '].includes(event.key)) return;
            event.preventDefault();
            setOpen(card.dataset.open !== 'true');
        });
        card.addEventListener('pointerenter', (event) => {
            if (event.pointerType === 'mouse' && hover.matches) setOpen(true);
        });
        card.addEventListener('pointerleave', (event) => {
            if (event.pointerType === 'mouse' && hover.matches) setOpen(false);
        });
        hover.addEventListener('change', () => setOpen(false));
    });
    showMore.addEventListener('click', () => {
        list.dataset.expanded = 'true';
        showMore.setAttribute('aria-expanded', 'true');
        showMore.disabled = true;
    });
};

const initTestimonialVideo = () => {
    const dialog = document.querySelector('[data-video-dialog]');
    if (!dialog) return;
    const video = dialog.querySelector('video');
    let opener;
    let bodyWasLocked = false;
    document.querySelectorAll('[data-video]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            opener = trigger;
            video.src = trigger.dataset.video;
            bodyWasLocked = document.body.classList.contains('overflow-hidden');
            document.body.classList.add('overflow-hidden');
            dialog.showModal();
            video.play().catch(() => {});
        });
    });
    dialog
        .querySelector('[data-close-video]')
        .addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
        const bounds = dialog.getBoundingClientRect();
        if (
            event.target === dialog &&
            (event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom)
        )
            dialog.close();
    });
    dialog.addEventListener('close', () => {
        video.pause();
        video.removeAttribute('src');
        video.load();
        if (!bodyWasLocked) document.body.classList.remove('overflow-hidden');
        opener?.focus({ preventScroll: true });
    });
};

initAiProfessionals();
initTableOfContents();
initServices();
initTeamDetails();
initCaseStudies();
initTestimonialVideo();
