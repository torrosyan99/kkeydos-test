const page = document.querySelector('[data-about-page]');

if (page) {
  const storyTrack = page.querySelector('[data-story-track]');
  const line = page.querySelector('[data-story-line]');
  const ball = page.querySelector('[data-story-ball]');
  const steps = [...page.querySelectorAll('[data-story-step]')];
  const reveals = [...page.querySelectorAll('[data-about-reveal]')];
  const mapReveal = page.querySelector('[data-map-reveal]');
  const mapCard = mapReveal.querySelector('[data-map-card]');
  const mapScene = page.querySelector('[data-map-scene]');
  const mapPin = mapScene.querySelector('[data-map-pin]');
  const mapTimeline = mapPin.querySelector('[data-map-timeline]');
  const mapExitGap = page.querySelector('[data-map-exit-gap]');
  const mapFollowing = page.querySelector('[data-map-following]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopMap = window.matchMedia('(min-width: 1024px)');
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
  let introProgress = 0;
  let introStart = 0;
  let introEnd = 0;
  let firstRevealed = false;
  let mapStart = 0;
  let mapDistance = 1;
  let mapPinEnd = 0;
  let mapTravel = 0;
  let mapAnimated = false;
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
    mapAnimated = desktopMap.matches && !reducedMotion.matches;
    const pinHeight = mapPin.offsetHeight;
    // Short screens can scroll past the copy before pinning the map in view.
    const pinTop = Math.min(128, window.innerHeight - pinHeight - 32);
    mapDistance = mapAnimated ? Math.max(560, window.innerHeight * 0.9) : 0;
    const settleDistance = mapAnimated ? Math.max(120, window.innerHeight * 0.18) : 0;
    mapPin.style.position = mapAnimated ? 'sticky' : 'relative';
    mapPin.style.top = mapAnimated ? `${pinTop}px` : '0px';
    mapScene.style.height = mapAnimated ? `${pinHeight + mapDistance + settleDistance}px` : 'auto';
    mapStart = mapScene.getBoundingClientRect().top + window.scrollY - pinTop;
    mapPinEnd = mapStart + mapDistance + settleDistance;
    // Let the settled card remain in view, then bring the next block in from
    // below the viewport rather than revealing its background under the pin.
    const sceneMargin = parseFloat(getComputedStyle(mapScene).marginBottom);
    mapExitGap.style.height = mapAnimated
      ? `${Math.max(0, window.innerHeight - pinTop - pinHeight - sceneMargin + 48)}px`
      : '0px';
    // This rail belongs to the native sticky layer. No scroll compensation or
    // per-frame transforms are needed while the map is descending.
    mapTimeline.style.left = `${mapPin.querySelector('[data-story-stop]').offsetLeft + 10}px`;
    mapTimeline.style.top = `${-window.innerHeight * 2}px`;
    mapTimeline.style.height = `${window.innerHeight * 2.52 - pinTop}px`;
    const mapOffset = mapReveal.getBoundingClientRect().top - mapPin.getBoundingClientRect().top;
    mapTravel = Math.max(
      window.innerHeight * 0.75,
      pinTop + mapOffset + mapCard.offsetHeight + 100,
    );

    const rect = intro.getBoundingClientRect();
    const marker = steps[0].querySelector('[data-story-stop]').getBoundingClientRect();
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
    introStart = Math.max(0, rect.top + window.scrollY + startY - window.innerHeight * 0.52);
    introEnd = marker.top + window.scrollY + marker.height / 2 - window.innerHeight * 0.52;

    const pageRect = page.getBoundingClientRect();
    const trackTop = marker.top + marker.height / 2;
    storyTrack.style.top = `${trackTop - pageRect.top}px`;
    storyTrack.style.left = `${marker.left + marker.width / 2 - pageRect.left - 6}px`;
    storyTrack.style.height = `${Math.max(0, givebackTrack.getBoundingClientRect().top - trackTop)}px`;

    schedule();
  };

  const drawIntro = () => {
    curve.style.strokeDashoffset = String(curveLength * (1 - introProgress));
    curve.style.opacity = introProgress > 0 ? '1' : '0';
    const point = curve.getPointAtLength(curveLength * introProgress);
    introBall.style.transform = `translate(${point.x - 16}px, ${point.y - 16}px)`;
    introBall.hidden = introProgress === 1;
    introTrail.forEach((trail, index) => {
      const previous = curve.getPointAtLength(
        curveLength * Math.max(0, introProgress - (index + 1) * 0.012),
      );
      trail.style.transform = `translate(${previous.x - 16}px, ${previous.y - 16}px)`;
      trail.hidden = introProgress === 0 || introProgress >= 1;
    });
  };

  const update = () => {
    frame = 0;
    const viewport = window.innerHeight;
    introProgress = clamp((window.scrollY - introStart) / Math.max(1, introEnd - introStart));
    firstRevealed ||= introProgress === 1;
    steps[0].toggleAttribute('data-reached', introProgress === 1);
    steps[0].dataset.visible = String(firstRevealed);
    steps[0].querySelectorAll('[data-about-reveal]').forEach((element) => {
      element.dataset.visible = String(firstRevealed);
    });
    const mapPinned = mapAnimated && window.scrollY >= mapStart && window.scrollY <= mapPinEnd;
    storyTrack.style.visibility = mapPinned ? 'hidden' : 'visible';
    mapTimeline.hidden = !mapPinned;
    const track = storyTrack.getBoundingClientRect();
    const trackLength = track.height;
    const lineHead = viewport * 0.52;
    const progress = firstRevealed ? Math.min(trackLength, Math.max(0, lineHead - track.top)) : 0;
    line.style.height = `${progress}px`;
    ball.style.transform = `translateY(${progress - 16}px)`;
    ball.hidden = progress === 0 || progress === trackLength;
    steps.slice(1).forEach((step) => {
      const marker = step.querySelector('[data-story-stop]').getBoundingClientRect();
      step.toggleAttribute('data-reached', marker.top + marker.height / 2 <= lineHead);
    });

    const givebackTop = givebackTrack.getBoundingClientRect().top;
    const stopRect = givebackStop.getBoundingClientRect();
    const givebackLength = stopRect.top + stopRect.height / 2 - givebackTop;
    const givebackProgress = firstRevealed
      ? Math.min(givebackLength, Math.max(0, lineHead - givebackTop))
      : 0;
    givebackLine.style.height = `${givebackProgress}px`;
    givebackBall.style.transform = `translateY(${givebackProgress - 16}px)`;
    givebackBall.hidden = givebackProgress === 0 || givebackProgress === givebackLength;
    givebackStop.dataset.reached = String(givebackProgress === givebackLength);

    drawIntro();

    // Sticky holds the block while this scroll interval lowers and straightens the map.
    // Deriving progress directly from scroll position makes the entire scene reversible.
    const mapProgress = clamp((window.scrollY - mapStart) / Math.max(1, mapDistance));
    const mobileProgress = clamp(
      (viewport * 0.94 - mapReveal.getBoundingClientRect().top) / (viewport * 0.35),
    );
    const mapRemaining = 1 - mapProgress;
    mapFollowing.style.visibility =
      !mapAnimated || window.scrollY > mapPinEnd ? 'visible' : 'hidden';
    if (reducedMotion.matches) {
      mapCard.style.transform = 'none';
      mapCard.style.opacity = '1';
    } else if (mapAnimated) {
      mapCard.style.transform = `translateY(${-mapTravel * mapRemaining}px) rotate(${7 * mapRemaining}deg)`;
      mapCard.style.opacity = String(clamp(mapProgress / 0.2));
    } else {
      const remaining = (1 - mobileProgress) ** 3;
      mapCard.style.transform = `translateX(${Math.min(220, mapReveal.clientWidth * 0.6) * remaining}px)`;
      mapCard.style.opacity = String(clamp(mobileProgress / 0.35));
    }

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
      const reveal = reducedMotion.matches
        ? 1
        : clamp((viewport * 0.94 - givebackPosition) / (viewport * 0.55));
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
  reducedMotion.addEventListener('change', measure);
  desktopMap.addEventListener('change', measure);
  projectsImage.addEventListener('load', schedule);
  new ResizeObserver(measure).observe(page);
  new ResizeObserver(measure).observe(mapPin);
  document.fonts.ready.then(measure);
  page.dataset.ready = 'true';
  measure();
}
