import { fixedBlock } from '../../libs/fixedBlock/fixedBlock.js';

const navigation = document.querySelector('[data-service-links]');

if (navigation) {
  fixedBlock('[data-fixed]', '[data-fixed-content]');
  const links = [...navigation.querySelectorAll('a')];
  const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active;
  let scheduled = false;

  function updateNavigation() {
    scheduled = false;
    const top =
      document.querySelector('#header').offsetHeight + navigation.closest('nav').offsetHeight + 24;
    const current = sections.findLastIndex((section) => section.getBoundingClientRect().top <= top);
    const next = Math.max(0, current);
    if (next === active) return;
    active = next;
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const link = links[active];
    const left = link.offsetLeft - navigation.offsetLeft;
    if (
      left < navigation.scrollLeft ||
      left + link.offsetWidth > navigation.scrollLeft + navigation.clientWidth
    ) {
      navigation.scrollTo({
        left: left - (navigation.clientWidth - link.offsetWidth) / 2,
        behavior: reducedMotion.matches ? 'instant' : 'smooth',
      });
    }
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateNavigation);
  }

  document.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', () => {
    active = undefined;
    scheduleUpdate();
  });
  window.addEventListener('pageshow', scheduleUpdate);
  updateNavigation();
}

const form = document.querySelector('[data-service-form]');

if (form) {
  const status = form.querySelector('[data-inquiry-status]');
  const emailLink = form.querySelector('[data-inquiry-email]');
  const select = form.querySelector('.select');
  const selectButton = select.querySelector('.select__button');
  const dropdown = select.querySelector('.select__dropdown');
  const options = [...dropdown.querySelectorAll('[data-select]')];

  function resetInquiry() {
    status.hidden = true;
    emailLink.hidden = true;
    emailLink.removeAttribute('href');
  }

  form.addEventListener('input', (event) => {
    event.target.setCustomValidity?.('');
    resetInquiry();
  });
  options.forEach((option) => {
    option.addEventListener('click', () => {
      resetInquiry();
      selectButton.focus();
    });
  });

  // The shared select already handles pointer input in main.js.
  // Add keyboard operation here without changing the existing pages.
  select.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (selectButton.getAttribute('aria-expanded') === 'true') selectButton.click();
      selectButton.focus();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (selectButton.getAttribute('aria-expanded') !== 'true') selectButton.click();
    const current = options.indexOf(document.activeElement);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? options.length - 1
          : event.key === 'ArrowDown'
            ? (current + 1) % options.length
            : (current <= 0 ? options.length : current) - 1;
    options[next].focus();
  });
  select.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (
        !select.contains(document.activeElement) &&
        selectButton.getAttribute('aria-expanded') === 'true'
      )
        selectButton.click();
    });
  });

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
