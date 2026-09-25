const initTableOfContents = () => {
    const toc = document.querySelector('[data-toc]');
    if (!toc) return;

    const slot = document.querySelector('[data-toc-slot]');
    const hero = document.querySelector('[data-ai-hero]');
    const footer = document.querySelector('footer');
    const header = document.querySelector('[data-site-header]');
    const navigation = toc.querySelector('[data-toc-navigation]');
    const toggle = toc.querySelector('[data-toc-toggle]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const updateSticky = () => {
        frame = 0;
        const headerHeight = header?.offsetHeight ?? 0;
        const tocHeight = toc.offsetHeight;
        const pastHero = hero?.getBoundingClientRect().bottom <= headerHeight;
        const beforeFooter =
            !footer ||
            footer.getBoundingClientRect().top > headerHeight + tocHeight;
        const stuck = pastHero && beforeFooter;
        toc.style.setProperty('--toc-top', `${headerHeight}px`);
        // Reserve the same space in both modes so scroll anchoring cannot jump.
        slot.style.height = `${tocHeight}px`;
        slot.dataset.ready = 'true';
        toc.classList.toggle('is-stuck', stuck);
        document.documentElement.style.setProperty(
            '--page-sticky-offset',
            `${headerHeight + (stuck ? tocHeight : 0)}px`,
        );
    };

    const scheduleStickyUpdate = () => {
        if (!frame) frame = window.requestAnimationFrame(updateSticky);
    };

    window.addEventListener('scroll', scheduleStickyUpdate, { passive: true });
    window.addEventListener('resize', scheduleStickyUpdate);
    new ResizeObserver(scheduleStickyUpdate).observe(toc);
    if (header) new ResizeObserver(scheduleStickyUpdate).observe(header);
    if (hero) new ResizeObserver(scheduleStickyUpdate).observe(hero);
    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(expanded));
        navigation.hidden = !expanded;
        toc.classList.toggle('is-expanded', expanded);
        updateSticky();
    });
    toc.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || navigation.hidden) return;
        navigation.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toc.classList.remove('is-expanded');
        toggle.focus({ preventScroll: true });
        updateSticky();
    });
    updateSticky();

    const navigateToSection = (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const target = document.getElementById(link.hash.slice(1));
        if (!target) return;

        event.preventDefault();
        navigation.querySelectorAll('a').forEach((item) => {
            if (item.hash === link.hash)
                item.setAttribute('aria-current', 'location');
            else item.removeAttribute('aria-current');
        });
        const headerHeight =
            document.querySelector('[data-site-header]')?.offsetHeight ?? 0;
        const top =
            target.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            toc.offsetHeight -
            16;
        if (window.location.hash !== link.hash)
            window.history.pushState(null, '', link.hash);
        window.scrollTo({
            top: Math.max(0, top),
            behavior: reducedMotion.matches ? 'instant' : 'smooth',
        });
    };
    navigation.addEventListener('click', navigateToSection);
    document.querySelectorAll('[data-page-section-link]').forEach((link) => {
        link.addEventListener('click', navigateToSection);
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
    const desktop = window.matchMedia('(min-width: 834px)');
    cards.forEach((card) => {
        const details = card.querySelector('[data-case-details]');
        let animation;
        let mouseInside = false;
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
            if (event.detail && desktop.matches && mouseInside) return;
            setOpen(card.dataset.open !== 'true');
        });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') setOpen(false);
            if (!['Enter', ' '].includes(event.key)) return;
            event.preventDefault();
            setOpen(card.dataset.open !== 'true');
        });
        card.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'mouse' || !desktop.matches) return;
            mouseInside = true;
            setOpen(true);
        });
        card.addEventListener('pointerleave', (event) => {
            if (event.pointerType !== 'mouse') return;
            mouseInside = false;
            if (desktop.matches) setOpen(false);
        });
        card.addEventListener('blur', () => {
            if (!mouseInside) setOpen(false);
        });
        desktop.addEventListener('change', () => {
            mouseInside = false;
            setOpen(false);
        });
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

const initCountryCodeSelect = () => {
    const root = document.querySelector('[data-country-code]');
    if (!root) return;

    const select = root.querySelector('select');
    const trigger = root.querySelector('[data-country-trigger]');
    const label = root.querySelector('[data-country-label]');
    const menu = root.querySelector('[data-country-menu]');
    const options = menu.querySelector('[data-country-options]');
    const buttons = [...select.options].map((option) => {
        const button = document.createElement('button');
        const iso = option.textContent.trim().split(/\s+/)[0];
        button.type = 'button';
        button.className = 'country-code-option';
        button.dataset.value = option.value;
        button.setAttribute(
            'aria-label',
            `${option.dataset.country}, ${iso} ${option.value}`,
        );
        [
            ['country-code-iso', iso],
            ['country-code-name', option.dataset.country],
            ['country-code-dial', option.value],
            ['country-code-check', ''],
        ].forEach(([className, text]) => {
            const span = document.createElement('span');
            span.className = className;
            span.textContent = text;
            button.append(span);
        });
        options.append(button);
        return button;
    });

    const close = () => {
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
    };

    const sync = () => {
        const selected = select.selectedOptions[0];
        label.textContent = selected?.textContent.trim() ?? '';
        trigger.setAttribute(
            'aria-label',
            `Country calling code: ${selected?.dataset.country} ${select.value}`,
        );
        buttons.forEach((button) => {
            button.setAttribute(
                'aria-current',
                String(button.dataset.value === select.value),
            );
        });
    };

    const focusOption = (button) => {
        button.focus({ preventScroll: true });
        const top = button.offsetTop - options.offsetTop;
        const bottom = top + button.offsetHeight;
        if (top < options.scrollTop) options.scrollTop = top;
        else if (bottom > options.scrollTop + options.clientHeight)
            options.scrollTop = bottom - options.clientHeight;
    };

    const open = () => {
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        focusOption(
            buttons.find((button) => button.dataset.value === select.value) ??
                buttons[0],
        );
    };

    trigger.addEventListener('click', () => (menu.hidden ? open() : close()));
    menu.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        select.value = button.dataset.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        close();
        trigger.focus({ preventScroll: true });
    });
    root.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            trigger.focus({ preventScroll: true });
        }
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
            return;
        event.preventDefault();
        if (menu.hidden) {
            open();
            if (event.key.startsWith('Arrow')) return;
        }
        const index = buttons.indexOf(document.activeElement);
        const next =
            event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? buttons.length - 1
                  : event.key === 'ArrowDown'
                    ? index + 1
                    : index - 1;
        focusOption(buttons[(next + buttons.length) % buttons.length]);
    });
    root.addEventListener('focusout', (event) => {
        if (!root.contains(event.relatedTarget)) close();
    });
    document.addEventListener('pointerdown', (event) => {
        if (!root.contains(event.target)) close();
    });
    select.addEventListener('change', sync);
    select.form?.addEventListener('reset', () => {
        close();
        window.setTimeout(sync, 0);
    });
    sync();
};

const initHeroContact = () => {
    const contact = document.querySelector('[data-ai-contact]');
    if (!contact) return;
    document.querySelectorAll('[data-ai-project-link]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            contact.dataset.visible = 'true';
            const header = document.querySelector('[data-site-header]');
            // The table of contents returns below the hero at the destination.
            const top =
                contact.getBoundingClientRect().top +
                window.scrollY -
                (header?.offsetHeight ?? 0) -
                16;
            if (window.location.hash !== '#ai-project')
                window.history.pushState(null, '', '#ai-project');
            window.scrollTo({
                top: Math.max(0, top),
                behavior: motionPreference.matches ? 'instant' : 'smooth',
            });
            contact.querySelector('input')?.focus({ preventScroll: true });
        });
    });
    if (window.location.hash === '#ai-project')
        contact.dataset.visible = 'true';
};

const initCtaGlow = () => {
    document.querySelectorAll('[data-cta-glow]').forEach((block) => {
        let frame = 0;
        let point;
        block.addEventListener('pointermove', (event) => {
            if (event.pointerType !== 'mouse' || motionPreference.matches)
                return;
            point = { x: event.clientX, y: event.clientY };
            if (frame) return;
            frame = window.requestAnimationFrame(() => {
                frame = 0;
                const rect = block.getBoundingClientRect();
                block.style.setProperty('--glow-x', point.x - rect.left + 'px');
                block.style.setProperty('--glow-y', point.y - rect.top + 'px');
            });
        });
        block.addEventListener('pointerleave', () => {
            window.cancelAnimationFrame(frame);
            frame = 0;
        });
    });
};

initHeroContact();
initCtaGlow();
initCountryCodeSelect();
initTableOfContents();
initServices();
initTeamDetails();
initCaseStudies();
initTestimonialVideo();
