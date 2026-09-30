class TextRotator {
  static defaults = {
    interval: 2200,
    duration: 550,
    minInterval: 800,
    minDuration: 150,
  };

  constructor(element) {
    if (!(element instanceof HTMLElement)) return;

    this.element = element;
    this.items = [...element.querySelectorAll('.text-rotator-item')];

    if (!this.items.length) return;

    this.index = Math.max(
      0,
      this.items.findIndex((item) => item.dataset.active === 'true'),
    );

    this.interval = Math.max(
      Number(element.dataset.interval) || TextRotator.defaults.interval,
      TextRotator.defaults.minInterval,
    );

    this.duration = Math.min(
      Math.max(
        Number(element.dataset.duration) || TextRotator.defaults.duration,
        TextRotator.defaults.minDuration,
      ),
      this.interval - 100,
    );

    this.timer = null;
    this.isVisible = true;

    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.reduceMotion = this.motionQuery.matches;

    this.handleVisibility = this.handleVisibility.bind(this);
    this.handleMotionChange = this.handleMotionChange.bind(this);
    this.handleIntersection = this.handleIntersection.bind(this);

    this.prepare();
    this.bind();

    if (this.items.length > 1) {
      this.play();
    }
  }

  prepare() {
    this.items.forEach((item, index) => {
      const active = index === this.index;

      item.style.transition = 'none';
      item.style.opacity = active ? '1' : '0';
      item.style.transform = active
        ? 'translate3d(0, 0, 0) rotateX(0deg)'
        : 'translate3d(0, 100%, 0) rotateX(-25deg)';

      item.style.transformOrigin = '50% 50%';

      item.setAttribute('aria-hidden', String(!active));
      item.dataset.active = String(active);
    });
  }

  bind() {
    document.addEventListener('visibilitychange', this.handleVisibility);

    this.motionQuery.addEventListener('change', this.handleMotionChange);

    this.observer = new IntersectionObserver(this.handleIntersection, {
      threshold: 0.1,
    });

    this.observer.observe(this.element);
  }

  handleVisibility() {
    this.updatePlayback();
  }

  handleMotionChange(event) {
    this.reduceMotion = event.matches;
  }

  handleIntersection(entries) {
    const [entry] = entries;

    this.isVisible = entry.isIntersecting;

    this.updatePlayback();
  }

  updatePlayback() {
    const shouldPlay = !document.hidden && this.isVisible && this.items.length > 1;

    shouldPlay ? this.play() : this.pause();
  }

  goTo(index) {
    if (index === this.index || index < 0 || index >= this.items.length) {
      return;
    }

    const current = this.items[this.index];
    const next = this.items[index];

    next.style.transition = 'none';
    next.style.opacity = '0';
    next.style.transform = 'translate3d(0, 100%, 0) rotateX(-25deg)';

    void next.offsetHeight;

    const transition = this.reduceMotion
      ? 'none'
      : `
        transform ${this.duration}ms cubic-bezier(.22, 1, .36, 1),
        opacity ${this.duration}ms ease
      `;

    current.style.transition = transition;
    next.style.transition = transition;

    current.style.opacity = '0';
    current.style.transform = 'translate3d(0, -100%, 0) rotateX(25deg)';

    next.style.opacity = '1';
    next.style.transform = 'translate3d(0, 0, 0) rotateX(0deg)';

    current.setAttribute('aria-hidden', 'true');
    next.setAttribute('aria-hidden', 'false');

    current.dataset.active = 'false';
    next.dataset.active = 'true';

    this.index = index;

    this.element.dispatchEvent(
      new CustomEvent('textrotator:change', {
        detail: {
          index,
          item: next,
        },
      }),
    );
  }

  next() {
    const nextIndex = (this.index + 1) % this.items.length;

    this.goTo(nextIndex);
  }

  play() {
    if (this.timer || this.items.length < 2) return;

    this.timer = window.setInterval(() => this.next(), this.interval);
  }

  pause() {
    if (!this.timer) return;

    window.clearInterval(this.timer);
    this.timer = null;
  }

  static initAll(selector = '.text-rotator') {
    return [...document.querySelectorAll(selector)].map((element) => {
      if (element.textRotator) {
        return element.textRotator;
      }

      const instance = new TextRotator(element);

      element.textRotator = instance;

      return instance;
    });
  }
}

TextRotator.initAll();
