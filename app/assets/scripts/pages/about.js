const page = document.querySelector('.about-page');

if (page) {
  const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const story = page.querySelector('[data-about-story]');
  const line = page.querySelector('[data-story-line]');
  const ball = page.querySelector('[data-story-ball]');
  const steps = [...page.querySelectorAll('[data-story-step]')];
  const reveals = [...page.querySelectorAll('[data-about-reveal]')];
  const projectsPhoto = page.querySelector('[data-projects-photo]');
  const projectsImage = projectsPhoto.querySelector('img');
  const intro = page.querySelector('[data-intro-path]');
  const curve = page.querySelector('[data-intro-curve]');
  const introBall = page.querySelector('[data-intro-ball]');
  const introTrail = [...page.querySelectorAll('[data-intro-trail]')];
  const introTitle = page.querySelector('[data-about-intro]');
  const since = page.querySelector('[data-about-since]');
  const giveback = page.querySelector('[data-about-giveback]');
  const givebackTrack = page.querySelector('[data-giveback-track]');
  const givebackLine = page.querySelector('[data-giveback-line]');
  const givebackBall = page.querySelector('[data-giveback-ball]');
  const givebackStop = page.querySelector('[data-giveback-stop]');
  const wash = page.querySelector('[data-giveback-wash]');
  let curveLength = 0;
  let introProgress = motion.matches && !location.hash && window.scrollY < 1 ? 0 : 1;
  let introLineProgress = introProgress;
  let introComplete = introProgress === 1;
  let firstRevealed = introComplete;
  let introFrame = 0;
  let introTimeout = 0;
  let frame = 0;
  const clamp = (value) => Math.min(1, Math.max(0, value));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        if (target.hasAttribute('data-about-reveal')) target.dataset.visible = 'true';
        else
          target.querySelectorAll('[data-about-reveal]').forEach((element) => {
            element.dataset.visible = 'true';
          });
        revealObserver.unobserve(target);
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
  );

  reveals
    .filter((element) => !steps[0].contains(element))
    .forEach((element) => revealObserver.observe(element));

  const measure = () => {
    const rect = intro.getBoundingClientRect();
    const marker = steps[0].querySelector('.about-stop').getBoundingClientRect();
    const endX = marker.left + marker.width / 2 - rect.left;
    const endY = marker.top + marker.height / 2 - rect.top;
    const width = rect.width;
    const text = document.createRange();
    text.selectNodeContents(introTitle);
    const lastLine = [...text.getClientRects()].filter((line) => line.width > 0).at(-1);
    const startX = Math.min(width - 88, (lastLine?.right || rect.left) - rect.left + 16);
    const startY = lastLine ? lastLine.bottom - rect.top - lastLine.height * 0.3 : 0;
    const rightX = Math.min(width - 16, startX + 72);
    const turnY = endY * 0.48;
    const radius = Math.min(32, (rightX - startX) / 2, (rightX - endX) / 2);
    curve.setAttribute(
      'd',
      `M ${startX} ${startY} H ${rightX - radius} Q ${rightX} ${startY} ${rightX} ${startY + radius} V ${turnY - radius} Q ${rightX} ${turnY} ${rightX - radius} ${turnY} H ${endX + radius} Q ${endX} ${turnY} ${endX} ${turnY + radius} V ${endY}`,
    );
    curveLength = curve.getTotalLength();
    curve.style.strokeDasharray = String(curveLength);

    schedule();
  };

  const drawIntro = () => {
    curve.style.strokeDashoffset = String(curveLength * (1 - introLineProgress));
    curve.style.opacity = introLineProgress > 0 ? '1' : '0';
    const point = curve.getPointAtLength(curveLength * introProgress);
    introBall.style.transform = `translate(${point.x - 16}px, ${point.y - 16}px)`;
    introBall.hidden = introComplete && firstRevealed;
    introTrail.forEach((trail, index) => {
      const previous = curve.getPointAtLength(
        curveLength * Math.max(0, introProgress - (index + 1) * 0.012),
      );
      trail.style.transform = `translate(${previous.x - 16}px, ${previous.y - 16}px)`;
      trail.hidden = introProgress === 0 || introProgress >= 1;
    });
  };

  const preventIntroScroll = (event) => {
    if (event.type === 'keydown') {
      if (event.target.closest('input, textarea, select, button, a, [contenteditable]')) return;
      if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key))
        return;
    }
    event.preventDefault();
  };

  const finishIntro = () => {
    introProgress = 1;
    introLineProgress = 1;
    introComplete = true;
    cancelAnimationFrame(introFrame);
    clearTimeout(introTimeout);
    document.documentElement.classList.remove('about-intro-lock');
    document.removeEventListener('wheel', preventIntroScroll);
    document.removeEventListener('touchmove', preventIntroScroll);
    document.removeEventListener('keydown', preventIntroScroll);
    drawIntro();
    schedule();
  };

  const startIntro = () => {
    if (introComplete) return;
    document.documentElement.classList.add('about-intro-lock');
    document.addEventListener('wheel', preventIntroScroll, { passive: false });
    document.addEventListener('touchmove', preventIntroScroll, { passive: false });
    document.addEventListener('keydown', preventIntroScroll);
    // Always release the page, even if font loading or animation frames are interrupted.
    introTimeout = setTimeout(finishIntro, 5000);
    document.fonts.ready.then(() => {
      if (introComplete) return;
      measure();
      let started;
      const animate = (time) => {
        started ??= time;
        const elapsed = time - started - 250;
        const progress = clamp(elapsed / 1800);
        introProgress =
          progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        introLineProgress = 1 - Math.pow(1 - clamp((elapsed - 1800) / 900), 3);
        drawIntro();
        if (introLineProgress === 1) finishIntro();
        else introFrame = requestAnimationFrame(animate);
      };
      introFrame = requestAnimationFrame(animate);
    });
  };

  const update = () => {
    frame = 0;
    const viewport = window.innerHeight;
    const storyRect = story.getBoundingClientRect();
    if (!firstRevealed && introComplete && window.scrollY > 4 && storyRect.top < viewport * 0.94) {
      firstRevealed = true;
    }
    steps[0].toggleAttribute('data-reached', firstRevealed);
    steps[0].querySelectorAll('[data-about-reveal]').forEach((element) => {
      element.dataset.visible = String(firstRevealed);
    });
    const track = line.parentElement.getBoundingClientRect();
    const lineHead = viewport * 0.52;
    const progress = firstRevealed ? Math.min(track.height, Math.max(0, lineHead - track.top)) : 0;
    line.style.height = `${motion.matches ? progress : track.height}px`;
    ball.style.transform = `translateY(${progress - 16}px)`;
    ball.hidden = !motion.matches || progress === 0 || progress === track.height;
    steps
      .slice(1)
      .forEach((step) =>
        step.toggleAttribute(
          'data-reached',
          !motion.matches || step.getBoundingClientRect().top <= lineHead,
        ),
      );

    const givebackTop = givebackTrack.getBoundingClientRect().top;
    const stopRect = givebackStop.getBoundingClientRect();
    const givebackLength = stopRect.top + stopRect.height / 2 - givebackTop;
    const givebackProgress = !motion.matches
      ? givebackLength
      : firstRevealed
        ? Math.min(givebackLength, Math.max(0, lineHead - givebackTop))
        : 0;
    givebackLine.style.height = `${givebackProgress}px`;
    givebackBall.style.transform = `translateY(${givebackProgress - 16}px)`;
    givebackBall.hidden =
      !motion.matches || givebackProgress === 0 || givebackProgress === givebackLength;
    givebackStop.dataset.reached = String(givebackProgress === givebackLength);

    drawIntro();

    const photoRect = projectsPhoto.getBoundingClientRect();
    const photoTravel = Math.max(0, projectsImage.offsetWidth - projectsPhoto.clientWidth);
    if (!motion.matches) projectsImage.style.transform = `translateX(${-photoTravel / 2}px)`;
    else if (photoRect.bottom >= 0 && photoRect.top <= viewport) {
      const photoProgress = clamp((viewport - photoRect.top) / (viewport + photoRect.height));
      const photoOffset = (photoProgress - 0.5) * photoTravel * 0.25;
      projectsImage.style.transform = `translateX(${-photoTravel / 2 + photoOffset}px)`;
    }

    if (motion.matches) {
      const sinceProgress = clamp((viewport - since.getBoundingClientRect().top) / viewport);
      since.style.transform = `translateX(${(1 - sinceProgress) * Math.min(280, window.innerWidth * 0.25)}px)`;
      const reveal = clamp((viewport - giveback.getBoundingClientRect().top) / (viewport * 1.3));
      wash.style.clipPath = `circle(${reveal * 150}% at 10% 0%)`;
    } else {
      since.style.transform = '';
      wash.style.clipPath = 'none';
    }
  };

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  const setMotion = () => {
    page.dataset.motion = String(motion.matches);
    measure();
    if (!motion.matches) {
      firstRevealed = true;
      finishIntro();
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  motion.addEventListener('change', setMotion);
  new ResizeObserver(measure).observe(page);
  document.fonts.ready.then(measure);
  setMotion();
  startIntro();
  window.addEventListener('pagehide', finishIntro);
}
