import { Swiper } from '../../libs/swiper/swiper.min.js';

document.querySelectorAll('[data-service-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slider = new Swiper(track, {
    speed: reducedMotion.matches ? 0 : 450,
    slidesPerView: 1,
    spaceBetween: 20,
    grabCursor: true,
    watchOverflow: true,
    navigation: {
      prevEl: carousel.querySelector('[data-carousel-prev]'),
      nextEl: carousel.querySelector('[data-carousel-next]'),
    },
    pagination: {
      el: carousel.querySelector('[data-carousel-pagination]'),
      clickable: true,
    },
    a11y: {
      containerRoleDescriptionMessage: 'carousel',
      itemRoleDescriptionMessage: 'slide',
      slideLabelMessage: '{{index}} of {{slidesLength}}',
    },
    breakpoints: {
      768: { slidesPerView: 2, spaceBetween: 24 },
      1024: { slidesPerView: 3, spaceBetween: 32 },
    },
  });

  reducedMotion.addEventListener('change', (event) => {
    slider.params.speed = event.matches ? 0 : 450;
  });

  // Keep arrow keys local to the focused carousel so they don't hijack page scrolling.
  track.addEventListener('keydown', (event) => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      if (event.key === 'ArrowLeft') slider.slidePrev();
      else slider.slideNext();
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      slider.slideTo(event.key === 'Home' ? 0 : slider.slides.length - 1);
    }
  });
});

const form = document.querySelector('[data-service-form]');

if (form) {
  const status = form.querySelector('[data-inquiry-status]');
  const emailLink = form.querySelector('[data-inquiry-email]');

  function resetInquiry() {
    status.hidden = true;
    emailLink.hidden = true;
    emailLink.removeAttribute('href');
  }

  form.addEventListener('input', (event) => {
    event.target.setCustomValidity?.('');
    resetInquiry();
  });

  form.addEventListener('reset', resetInquiry);

  form.addEventListener('submit', (event) => {
    for (const name of ['name', 'description']) {
      const field = form.elements.namedItem(name);
      field.value = field.value.trim();
      field.setCustomValidity(field.value ? '' : 'Please fill out this field.');
    }
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }
    // A configured backend action uses the native form POST.
    if (!form.action.startsWith('mailto:')) return;
    event.preventDefault();
    const data = new FormData(form);
    const service = document.querySelector('[data-service]').dataset.service;
    const body = [
      `Service: ${service}`,
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Company: ${data.get('company') || 'Not specified'}`,
      `Phone: ${data.get('phone') ? `${data.get('countryCode')} ${data.get('phone')}` : 'Not specified'}`,
      '',
      'Project details:',
      data.get('description'),
    ].join('\n');
    emailLink.href = `${form.action}?subject=${encodeURIComponent(`${service} project inquiry`)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Your brief is ready. Open the email below to send it to our team.';
    status.hidden = false;
    emailLink.hidden = false;
    emailLink.focus();
  });
}
