import { fixedBlock } from '../../libs/fixedBlock/fixedBlock.js';

const navigation = document.querySelector('[data-service-navigation]');

if (navigation) {
  fixedBlock('[data-fixed]', '[data-fixed-content]');
  const trigger = navigation.querySelector('[data-service-nav-trigger]');
  const panel = navigation.querySelector('#service-navigation-panel');
  const links = [...navigation.querySelectorAll('[data-service-links] a')];
  const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
  const currentNumber = navigation.querySelector('[data-service-current-number]');
  const currentLabel = navigation.querySelector('[data-service-current-label]');
  const progress = navigation.querySelector('[data-service-progress]');
  let active;
  let scheduled = false;

  function setOpen(open, restoreFocus = false) {
    trigger.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }

  trigger.addEventListener('click', () => setOpen(panel.hidden));
  navigation.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      setOpen(false, true);
    }
    if (event.key === 'ArrowDown' && event.target === trigger) {
      event.preventDefault();
      setOpen(true);
      links[active ?? 0].focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!navigation.contains(event.target)) setOpen(false);
  });
  navigation.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!navigation.contains(document.activeElement)) setOpen(false);
    });
  });
  panel.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    setOpen(false);
    // Preserve native anchor/history behavior and move keyboard focus out of the closed panel.
    const target = document.getElementById(link.hash.slice(1));
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

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
    currentNumber.textContent = String(active + 1).padStart(2, '0');
    currentLabel.textContent = sections[active].dataset.serviceSection;
    progress.style.transform = `scaleX(${(active + 1) / links.length})`;
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
  new ResizeObserver(scheduleUpdate).observe(document.querySelector('main'));
  updateNavigation();
}

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
