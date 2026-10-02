const page = document.getElementById('about-main');

if (page) {
  const storyTrack = page.querySelector('[data-story-track]');
  const line = page.querySelector('[data-story-line]');
  const ball = page.querySelector('[data-story-ball]');
  const steps = [...page.querySelectorAll('[data-story-step]')];
  const reveals = [...page.querySelectorAll('[data-about-reveal]')];
  const mapReveal = page.querySelector('[data-map-reveal]');
  const mapCard = mapReveal.querySelector('[data-map-card]');
  const mapPin = page.querySelector('[data-map-pin]');
  const mapExitGap = page.querySelector('[data-map-exit-gap]');
  const desktopMap = window.matchMedia('(min-width: 1024px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
  const givebackTitle = giveback.querySelector('h2');
  const wash = page.querySelector('[data-giveback-wash]');
  let curveLength = 0;
  let introProgress = 0;
  let storyProgress = 0;
  let givebackProgress = 0;
  let lastFrameTime = null;
  let introBallProgress = location.hash || window.scrollY > 0 ? 1 : 0;
  let introBallStarted = null;
  let introStart = 0;
  let introEnd = 0;
  let firstRevealed = false;
  let mapProgress = null;
  let mapTravel = 0;
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
    .filter((element) => !steps[0].contains(element) && !mapReveal.contains(element))
    .forEach((element) => revealObserver.observe(element));

  const measure = () => {
    mapExitGap.style.height = desktopMap.matches ? '120px' : '64px';
    // Align the endpoint with the heading's first line, not the taller image row.
    // Layout offsets exclude the text's entrance transform.
    let titleTop = 0;
    for (let element = givebackTitle; element && element !== givebackStop.offsetParent; element = element.offsetParent) {
      titleTop += element.offsetTop;
    }
    const titleStyle = getComputedStyle(givebackTitle);
    const titleLineHeight = parseFloat(titleStyle.lineHeight) || parseFloat(titleStyle.fontSize) * 1.2;
    givebackStop.style.top = `${titleTop + titleLineHeight / 2 - givebackStop.offsetHeight / 2}px`;
    // Start above the viewport; opacity reveals the card later in its descent.
    mapTravel = window.innerHeight * 0.9 + mapCard.offsetHeight + 48;
    const rect = intro.getBoundingClientRect();
    const marker = steps[0].querySelector('[data-story-stop]').getBoundingClientRect();
    const endX = marker.left + marker.width / 2 - rect.left;
    const endY = marker.top + marker.height / 2 - rect.top;
    const width = rect.width;
    const text = document.createRange();
    text.selectNodeContents(introTitle);
    const lastLine = [...text.getClientRects()].filter((line) => line.width > 0).at(-1);
    // The text reserves a right gutter so the circle and bend never overlap its last line.
    const startX = (lastLine?.right || rect.left) - rect.left + 24;
    const startY = lastLine ? lastLine.bottom - rect.top - lastLine.height * 0.3 : 0;
    const rightX = Math.min(width - 16, startX + 48);
    const turnY = endY * 0.48;
    const radius = Math.min(32, (rightX - startX) / 2, (rightX - endX) / 2);
    curve.setAttribute(
      'd',
      `M ${startX} ${startY} H ${rightX - radius} Q ${rightX} ${startY} ${rightX} ${startY + radius} V ${turnY - radius} Q ${rightX} ${turnY} ${rightX - radius} ${turnY} H ${endX + radius} Q ${endX} ${turnY} ${endX} ${turnY + radius} V ${endY}`,
    );
    curveLength = curve.getTotalLength();
    curve.style.strokeDasharray = String(curveLength);
    // The line follows scroll independently of the circle's entrance animation.
    introStart = Math.max(0, rect.top + window.scrollY + startY - window.innerHeight * 0.72);
    introEnd = Math.max(
      introStart + 160,
      marker.top + window.scrollY + marker.height / 2 - window.innerHeight * 0.52,
    );

    const pageRect = page.getBoundingClientRect();
    const trackTop = marker.top + marker.height / 2;
    storyTrack.style.top = `${trackTop - pageRect.top}px`;
    storyTrack.style.left = `${marker.left + marker.width / 2 - pageRect.left - 6}px`;
    storyTrack.style.height = `${Math.max(0, givebackTrack.getBoundingClientRect().top - trackTop)}px`;

    schedule();
  };

  const drawIntro = () => {
    // Keep the circle at its destination while the line retracts on upward scroll.
    const ballProgress = firstRevealed
      ? 1
      : Math.max(introBallProgress, introProgress);
    const lineProgress = introProgress;
    curve.style.strokeDashoffset = String(curveLength * (1 - lineProgress));
    curve.style.opacity = lineProgress > 0 ? '1' : '0';
    const point = curve.getPointAtLength(curveLength * ballProgress);
    introBall.style.transform = `translate(${point.x - 16}px, ${point.y - 16}px)`;
    introBall.hidden = introProgress === 1;
    introTrail.forEach((trail, index) => {
      const previous = curve.getPointAtLength(
        curveLength * Math.max(0, ballProgress - (index + 1) * 0.012),
      );
      trail.style.transform = `translate(${previous.x - 16}px, ${previous.y - 16}px)`;
      trail.hidden = ballProgress === 0 || ballProgress === 1;
    });
  };

  const update = (time) => {
    frame = 0;
    const viewport = window.innerHeight;
    const elapsed = lastFrameTime === null ? 16 : Math.min(64, time - lastFrameTime);
    lastFrameTime = time;
    const easing = 1 - Math.exp(-elapsed / 90);
    const approach = (current, target, tolerance) => {
      if (Math.abs(target - current) <= tolerance) return target;
      schedule();
      return current + (target - current) * easing;
    };
    if (introBallProgress < 1) {
      introBallStarted ??= time;
      const progress = clamp((time - introBallStarted - 250) / 1800);
      introBallProgress =
        progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      if (introBallProgress < 1) schedule();
    }
    const introTarget = clamp((window.scrollY - introStart) / (introEnd - introStart));
    // Finish retracting the straight segment before retracting the upper curve.
    const returningToIntro = introTarget < 1 && storyProgress > 0;
    if (returningToIntro) schedule();
    introProgress = approach(introProgress, returningToIntro ? 1 : introTarget, 0.0001);
    const storyActive = introProgress === 1;
    firstRevealed ||= storyActive;
    steps[0].toggleAttribute('data-reached', storyActive);
    steps[0].dataset.visible = String(firstRevealed);
    steps[0].querySelectorAll('[data-about-reveal]').forEach((element) => {
      element.dataset.visible = String(firstRevealed);
    });
    const track = storyTrack.getBoundingClientRect();
    const trackLength = track.height;
    const lineHead = viewport * 0.52;
    const storyTarget = storyActive && introTarget === 1
      ? Math.min(trackLength, Math.max(0, lineHead - track.top))
      : 0;
    const progress = storyProgress = approach(storyProgress, storyTarget, 0.1);
    line.style.height = `${progress}px`;
    ball.style.transform = `translateY(${progress - 16}px)`;
    ball.hidden = progress === 0 || progress === trackLength;
    steps.slice(1).forEach((step) => {
      const marker = step.querySelector('[data-story-stop]').getBoundingClientRect();
      step.toggleAttribute('data-reached', storyActive && marker.top + marker.height / 2 <= track.top + progress);
    });

    const givebackTop = givebackTrack.getBoundingClientRect().top;
    const stopRect = givebackStop.getBoundingClientRect();
    const givebackLength = stopRect.top + stopRect.height / 2 - givebackTop;
    // Start the white segment only after the orange head reaches this section.
    // Clear it immediately on exit so smoothing cannot leave a white flash behind.
    const givebackActive = storyActive && introTarget === 1
      && progress === trackLength && lineHead > givebackTop;
    const givebackTarget = givebackActive
      ? Math.min(givebackLength, Math.max(0, lineHead - givebackTop))
      : 0;
    givebackProgress = givebackActive ? approach(givebackProgress, givebackTarget, 0.1) : 0;
    givebackLine.style.height = `${givebackProgress}px`;
    givebackBall.style.transform = `translateY(${givebackProgress - 16}px)`;
    givebackBall.hidden = givebackProgress === 0 || givebackProgress === givebackLength;
    givebackStop.dataset.reached = String(givebackActive && givebackProgress === givebackLength);

    drawIntro();

    // Track the untransformed slot so the card's movement cannot affect progress.
    const mapRect = mapReveal.getBoundingClientRect();
    const mapTarget = reducedMotion.matches
      ? 1
      : clamp((viewport * 0.82 - mapRect.top) / (viewport * (desktopMap.matches ? 0.45 : 0.35)));
    mapProgress = mapProgress === null || reducedMotion.matches
      ? mapTarget
      : approach(mapProgress, mapTarget, 0.0001);
    const mapRemaining = (1 - mapProgress) ** 2;
    if (desktopMap.matches) {
      mapCard.style.transform = `translate3d(0, ${-mapTravel * mapRemaining}px, 0)`;
    } else {
      const entryDistance = window.innerWidth - mapRect.left + 24;
      mapCard.style.transform = `translate3d(${entryDistance * mapRemaining}px, 0, 0)`;
    }
    const mapOpacity = clamp((mapProgress - 0.4) / 0.5);
    mapCard.style.opacity = String(mapOpacity * mapOpacity * (3 - 2 * mapOpacity));

    const photoRect = projectsPhoto.getBoundingClientRect();
    const photoTravel = Math.max(0, projectsImage.offsetWidth - projectsPhoto.clientWidth);
    if (photoRect.bottom >= 0 && photoRect.top <= viewport) {
      const photoProgress = clamp((viewport - photoRect.top) / (viewport + photoRect.height));
      projectsImage.style.transform = `translateX(${-photoProgress * photoTravel}px)`;
    }

    const sinceProgress = clamp((viewport - since.getBoundingClientRect().top) / viewport);
    since.style.transform = `translateX(${(1 - sinceProgress) * Math.min(280, window.innerWidth * 0.25)}px)`;
    const givebackPosition = giveback.getBoundingClientRect().top;
    if (!desktopMap.matches) {
      const reveal = clamp((viewport * 0.94 - givebackPosition) / (viewport * 0.55));
      wash.style.clipPath = `inset(0 0 0 ${(1 - reveal) ** 2 * 100}%)`;
    } else {
      const reveal = clamp((viewport - givebackPosition) / (viewport * 1.3));
      wash.style.clipPath = `circle(${reveal * 150}% at 10% 0%)`;
    }
  };

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  desktopMap.addEventListener('change', measure);
  reducedMotion.addEventListener('change', schedule);
  projectsImage.addEventListener('load', schedule);
  new ResizeObserver(measure).observe(page);
  new ResizeObserver(measure).observe(mapPin);
  document.fonts.ready.then(measure);
  measure();
}
