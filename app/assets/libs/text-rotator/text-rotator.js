(function (global) {
    'use strict';

    class TextRotator {
        constructor(element) {
            this.items = [...element.querySelectorAll('.text-rotator-item')];
            if(this.items.length === 0) return;
            this.interval = Math.max(
                Number(element.dataset.interval) || 2200,
                800,
            );
            this.duration = Math.min(
                Math.max(Number(element.dataset.duration) || 550, 150),
                this.interval - 100,
            );
            this.index = 0;
            this.timer = null;
            this.reduceMotion = global.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches;

            if (this.items.length < 2) return;

            this.prepare();
            this.play();
            document.addEventListener(
                'visibilitychange',
                this.handleVisibility,
            );
        }

        handleVisibility = () => {
            document.hidden ? this.pause() : this.play();
        };

        prepare() {
            this.items.forEach((item, index) => {
                const isCurrent = index === this.index;

                item.style.opacity = isCurrent ? '1' : '0';
                item.style.transform = isCurrent
                    ? 'translate3d(0, 0, 0) rotateX(0deg)'
                    : 'translate3d(0, 100%, 0) rotateX(-25deg)';
                item.style.transformOrigin = '50% 50%';
                item.setAttribute('aria-hidden', String(!isCurrent));
            });
        }

        rotate() {
            const current = this.items[this.index];
            const nextIndex = (this.index + 1) % this.items.length;
            const next = this.items[nextIndex];

            if (this.reduceMotion) {
                current.style.opacity = '0';
                current.style.transform = 'translate3d(0, -100%, 0)';
                next.style.opacity = '1';
                next.style.transform = 'translate3d(0, 0, 0)';
            } else {
                const transition = `transform ${this.duration}ms cubic-bezier(.22,1,.36,1), opacity ${this.duration}ms ease`;

                next.style.transition = 'none';
                next.style.opacity = '0';
                next.style.transform =
                    'translate3d(0, 100%, 0) rotateX(-25deg)';
                void next.offsetHeight;

                current.style.transition = transition;
                next.style.transition = transition;
                current.style.opacity = '0';
                current.style.transform =
                    'translate3d(0, -100%, 0) rotateX(25deg)';
                next.style.opacity = '1';
                next.style.transform = 'translate3d(0, 0, 0) rotateX(0deg)';
            }

            current.setAttribute('aria-hidden', 'true');
            next.setAttribute('aria-hidden', 'false');
            this.index = nextIndex;
        }

        play() {
            if (this.timer || this.items.length < 2) return;
            this.timer = global.setInterval(() => this.rotate(), this.interval);
        }

        pause() {
            global.clearInterval(this.timer);
            this.timer = null;
        }

        destroy() {
            this.pause();
            document.removeEventListener(
                'visibilitychange',
                this.handleVisibility,
            );
            this.items.forEach((item) => item.removeAttribute('style'));
        }

        static initAll(selector = '.text-rotator') {
            return [...document.querySelectorAll(selector)].map(
                (element) => new TextRotator(element),
            );
        }
    }

    global.TextRotator = TextRotator;

    const init = () => {
        global.TEXT_ROTATORS = TextRotator.initAll();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})(window);
