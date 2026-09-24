import { Swiper } from '../libs/swiper/swiper.min.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const initFeaturedSlider = () => {
    const root = document.querySelector('[data-featured-slider]');

    if (!root) return;

    new Swiper(root.querySelector('[data-swiper-slider]'), {
        a11y: { enabled: false },
        speed: reducedMotion.matches ? 0 : 650,
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 0,
        loop: true,
        autoplay: reducedMotion.matches
            ? false
            : {
                  delay: 4000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
              },
        navigation: {
            prevEl: root.querySelector('[data-featured-prev]'),
            nextEl: root.querySelector('[data-featured-next]'),
        },
        pagination: {
            el: root.querySelector('[data-featured-pagination]'),
            clickable: true,
        },
    });
};

const initTestimonialsSlider = () => {
    const root = document.querySelector('[data-testimonials-slider]');

    if (!root) return;
    new Swiper(root.querySelector('[data-testimonials-swiper]'), {
        a11y: { enabled: false },
        speed: reducedMotion.matches ? 0 : 650,
        slidesPerView: 'auto',
        slidesPerGroup: 1,
        spaceBetween: 32,
        autoplay: reducedMotion.matches
            ? false
            : {
                  delay: 4000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
              },
        loop: false,
        rewind: false,
        watchSlidesProgress: true,
        navigation: {
            prevEl: root.querySelector('[data-testimonials-prev]'),
            nextEl: root.querySelector('[data-testimonials-next]'),
        },
        breakpoints: {
            834: {
                spaceBetween: 65,
            },
        },
    });
};

const initTeamAssembly = () => {
    const section = document.querySelector('[data-team-assembly]');
    if (!section || section.__keydosTeamAssemblyV4) return;

    // Replace the previous controller, if it was already initialized.
    section.__keydosTeamAssemblyV3?.destroy();
    const visual = section.querySelector('[data-team-visual]');
    if (!visual || !('IntersectionObserver' in window) || !visual.animate)
        return;

    const order = ['project', 'ux', 'software', 'qa', 'data'];
    const members = order
        .map((slot) =>
            visual.querySelector(
                `[data-team-member][data-team-slot="${slot}"]`,
            ),
        )
        .filter(Boolean);
    const tracks = [...visual.querySelectorAll('[data-team-track]')];
    if (members.length !== 5 || !tracks.length) return;

    const settings = {
        rowHold: 500,
        assembly: 2200,
        stagger: 180,
        lap: 40000,
        acceleration: 1200,
        samples: 480,
    };
    // Mobile is supported. Only accessibility preferences disable motion.
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const desktop = window.matchMedia('(min-width: 768px)');
    const pathCache = new WeakMap();
    let active = [];
    let stage = 'static';
    let started = false;
    let activated = false;
    let visible = false;
    let destroyed = false;
    let generation = 0;
    let geometry = null;
    let observedWidth = 0;
    let observedHeight = 0;
    let resizeTimer = 0;
    let resume = null;

    const cancelActive = () => {
        generation += 1;
        active.forEach(({ animation }) => {
            animation.onfinish = null;
            animation.cancel();
        });
        active = [];
        section.removeAttribute('data-team-running');
    };

    const elapsed = () =>
        Math.max(
            0,
            ...active.map(
                ({ animation }) => Number(animation.currentTime) || 0,
            ),
        );

    const samplePath = (path) => {
        const d = path.getAttribute('d');
        const cached = pathCache.get(path);
        if (cached?.d === d) return cached.points;
        const length = path.getTotalLength();
        if (!(length > 0)) throw new Error('Infinity path has zero length.');
        const points = Array.from({ length: settings.samples }, (_, index) => {
            const point = path.getPointAtLength(
                (length * index) / settings.samples,
            );
            return { x: point.x, y: point.y };
        });
        pathCache.set(path, { d, points });
        return points;
    };

    const measure = () => {
        const path = tracks.find(
            (item) => getComputedStyle(item.ownerSVGElement).display !== 'none',
        );
        if (!path) return null;
        const svg = path.ownerSVGElement;
        const vb = svg.viewBox.baseVal;
        const width = visual.clientWidth;
        const height = visual.clientHeight;
        if (!width || !height || !vb.width || !vb.height) return null;

        // The two supplied SVGs fill visual and use xMidYMid meet.
        // Include the non-zero viewBox origin in both orientations.
        const scale = Math.min(width / vb.width, height / vb.height);
        const dx = (width - vb.width * scale) / 2 - vb.x * scale;
        const dy = (height - vb.height * scale) / 2 - vb.y * scale;
        const points = samplePath(path).map((point) => ({
            x: point.x * scale + dx,
            y: point.y * scale + dy,
        }));
        const bases = members.map((member) => {
            const css = getComputedStyle(member);
            const x = Number.parseFloat(css.left);
            const y = Number.parseFloat(css.top);
            return {
                x: Number.isFinite(x) ? x : member.offsetLeft,
                y: Number.isFinite(y) ? y : member.offsetTop,
            };
        });
        return {
            svg,
            width,
            height,
            points,
            bases,
            desktop: desktop.matches,
        };
    };

    const position = (phase) => {
        const count = geometry.points.length;
        const value = (((phase % 1) + 1) % 1) * count;
        const index = Math.floor(value);
        const a = geometry.points[index % count];
        const b = geometry.points[(index + 1) % count];
        const blend = value - index;
        return {
            x: a.x + (b.x - a.x) * blend,
            y: a.y + (b.y - a.y) * blend,
        };
    };
    const transform = (point, base) =>
        `translate3d(${(point.x - base.x).toFixed(3)}px, ${(point.y - base.y).toFixed(3)}px, 0px)`;

    const makeAnimation = (element, frames, options, time) => {
        const animation = element.animate(frames, {
            fill: 'both',
            ...options,
        });
        animation.pause();
        animation.currentTime = time;
        const end =
            options.iterations === Infinity
                ? Infinity
                : (options.delay || 0) + options.duration;
        active.push({ animation, end });
        return animation;
    };

    const sync = () => {
        if (destroyed) return;
        if (
            stage === 'ready' &&
            activated &&
            visible &&
            !document.hidden &&
            motion.matches
        ) {
            stage = 'assembly';
            started = true;
        }
        const running =
            started &&
            stage !== 'static' &&
            stage !== 'ready' &&
            visible &&
            !document.hidden &&
            motion.matches;
        section.toggleAttribute('data-team-running', running);
        const now = document.timeline.currentTime;
        active.forEach(({ animation, end }) => {
            const time = Number(animation.currentTime) || 0;
            if (running && time < end) {
                if (animation.playState !== 'running') {
                    animation.play();
                    if (now !== null) animation.startTime = now - time;
                }
            } else if (animation.playState === 'running') {
                animation.pause();
            }
        });
    };

    const install = (nextStage, time = 0) => {
        cancelActive();
        stage = nextStage;
        const token = generation;
        const launchAdvance = settings.acceleration / (2 * settings.lap);
        let lastCard;

        members.forEach((member, index) => {
            const base = geometry.bases[index];
            const startPhase = index / members.length;
            let frames;
            let options;

            if (stage === 'ready' || stage === 'assembly') {
                const progress = index / (members.length - 1);
                // Desktop starts in a row, mobile in a column, avoiding a cramped row.
                const startPoint = geometry.desktop
                    ? {
                          x: geometry.width * (0.1 + 0.8 * progress),
                          y: geometry.height * 0.5,
                      }
                    : {
                          x: geometry.width * 0.5,
                          y: geometry.height * (0.1 + 0.8 * progress),
                      };
                frames = [
                    { transform: transform(startPoint, base) },
                    { transform: transform(position(startPhase), base) },
                ];
                options = {
                    duration: settings.assembly,
                    delay: settings.rowHold + index * settings.stagger,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                };
            } else {
                const isLaunch = stage === 'launch';
                const count = isLaunch ? 48 : settings.samples;
                frames = Array.from({ length: count + 1 }, (_, step) => {
                    const t = step / count;
                    const phase = isLaunch
                        ? startPhase + launchAdvance * t * t
                        : startPhase + launchAdvance + t;
                    return {
                        offset: t,
                        transform: transform(position(phase), base),
                    };
                });
                if (!isLaunch) frames[count].transform = frames[0].transform;
                options = {
                    duration: isLaunch ? settings.acceleration : settings.lap,
                    iterations: isLaunch ? 1 : Infinity,
                    easing: 'linear',
                };
            }
            lastCard = makeAnimation(member, frames, options, time);
        });

        if (stage === 'ready' || stage === 'assembly') {
            makeAnimation(
                geometry.svg,
                [{ opacity: 0 }, { opacity: 1 }],
                {
                    duration: 1800,
                    delay: 600,
                    easing: 'ease-in-out',
                },
                time,
            );
        }
        if (stage !== 'orbit') {
            lastCard.onfinish = () => {
                if (destroyed || token !== generation) return;
                install(stage === 'launch' ? 'orbit' : 'launch');
            };
        }
        sync();
    };

    const rebuild = () => {
        if (destroyed) return;
        try {
            if (!motion.matches) {
                if (stage !== 'static') resume = { stage, time: elapsed() };
                cancelActive();
                stage = 'static';
                return;
            }
            const nextGeometry = measure();
            if (!nextGeometry) {
                if (stage !== 'static') resume = { stage, time: elapsed() };
                cancelActive();
                stage = 'static';
                return;
            }
            const previous =
                stage === 'static'
                    ? resume || { stage: 'ready', time: 0 }
                    : { stage, time: elapsed() };
            resume = null;
            geometry = nextGeometry;
            observedWidth = geometry.width;
            observedHeight = geometry.height;
            let nextStage = previous.stage;
            let time = previous.time;
            const assemblyEnd =
                settings.rowHold +
                settings.assembly +
                (members.length - 1) * settings.stagger;
            if (nextStage === 'assembly' && time >= assemblyEnd) {
                nextStage = 'launch';
                time = 0;
            } else if (
                nextStage === 'launch' &&
                time >= settings.acceleration
            ) {
                nextStage = 'orbit';
                time = 0;
            }
            if (nextStage === 'orbit') time %= settings.lap;
            install(nextStage, time);
        } catch (error) {
            cancelActive();
            stage = 'static';
            console.warn('KEYDOS team animation: using static layout.', error);
        }
    };

    const observer = new IntersectionObserver(
        ([entry]) => {
            visible = entry.isIntersecting;
            if (visible && entry.intersectionRatio >= 0.15) activated = true;
            sync();
        },
        { threshold: [0, 0.15], rootMargin: '0px 0px -24px 0px' },
    );

    const scheduleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
            if (
                Math.abs(visual.clientWidth - observedWidth) > 0.5 ||
                Math.abs(visual.clientHeight - observedHeight) > 0.5
            )
                rebuild();
        }, 120);
    };
    const resizer =
        'ResizeObserver' in window ? new ResizeObserver(scheduleResize) : null;
    const mediaChange = () => rebuild();
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', mediaChange);
    desktop.addEventListener('change', mediaChange);
    if (resizer) resizer.observe(visual);
    else window.addEventListener('resize', scheduleResize);

    section.__keydosTeamAssemblyV4 = {
        destroy() {
            destroyed = true;
            clearTimeout(resizeTimer);
            observer.disconnect();
            resizer?.disconnect();
            document.removeEventListener('visibilitychange', sync);
            motion.removeEventListener('change', mediaChange);
            desktop.removeEventListener('change', mediaChange);
            window.removeEventListener('resize', scheduleResize);
            cancelActive();
            delete section.__keydosTeamAssemblyV4;
        },
    };
    rebuild();
    observer.observe(visual);
};

const initInsightsSlider = () => {
    const root = document.querySelector('[data-insights-slider]');

    if (!root) return;
    new Swiper(root.querySelector('[data-insights-swiper]'), {
        a11y: { enabled: false },
        speed: reducedMotion.matches ? 0 : 500,

        slidesPerView: 1.12,
        slidesPerGroup: 1,
        spaceBetween: 20,
        navigation: {
            prevEl: root.querySelector('[data-insights-prev]'),
            nextEl: root.querySelector('[data-insights-next]'),
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 24,
            },

            1024: {
                slidesPerView: 3,
                spaceBetween: 32,
            },
        },
    });
};

const initUI = () => {
    initFeaturedSlider();
    initTestimonialsSlider();
    initTeamAssembly();
    initInsightsSlider();
};

// Supports both deferred/body scripts and scripts loaded before the HTML is ready.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI, {
        once: true,
    });
} else {
    initUI();
}
