const form = document.querySelector('[data-project-form]');

if (form) {
  form.querySelector('[type="submit"]').disabled = false;
  const services = [...form.querySelectorAll('[name="services"]')];
  const serviceError = document.getElementById('services-error');
  const status = form.querySelector('[data-project-status]');
  const emailLink = form.querySelector('[data-project-email]');

  function validateServices() {
    const valid = services.some((service) => service.checked);
    services[0].setCustomValidity(valid ? '' : 'Select a service.');
    serviceError.hidden = valid;
    return valid;
  }

  function clearPreparedEmail() {
    status.hidden = true;
    emailLink.hidden = true;
    emailLink.removeAttribute('href');
  }

  form.addEventListener('input', (event) => {
    clearPreparedEmail();
    if (event.target.name === 'services') validateServices();
    else event.target.setCustomValidity('');
  });

  form.addEventListener('reset', () => {
    clearPreparedEmail();
    serviceError.hidden = true;
    for (const field of form.elements) {
      if (typeof field.setCustomValidity === 'function') field.setCustomValidity('');
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearPreparedEmail();
    for (const name of ['name', 'email', 'description']) {
      const field = form.elements.namedItem(name);
      field.value = field.value.trim();
      field.setCustomValidity(field.value ? '' : 'Please fill out this field.');
    }
    validateServices();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const body = [
      `Name: ${data.get('name')}`,
      `Work email: ${data.get('email')}`,
      `Company: ${data.get('company') || 'Not specified'}`,
      `Phone: ${data.get('phone') ? `${data.get('countryCode')} ${data.get('phone')}` : 'Not specified'}`,
      `Service: ${data.get('services')}`,
      `Budget: ${data.get('budget') || 'To be discussed'}`,
      `Expected start: ${data.get('timeline') || 'To be discussed'}`,
      '',
      'Project details:',
      data.get('description'),
    ].join('\n');
    emailLink.href = `mailto:info@kkeydos.com?subject=${encodeURIComponent('New project inquiry')}&body=${encodeURIComponent(body)}`;
    emailLink.hidden = false;
    status.textContent =
      'Your project brief is ready. Open the email below and send it to our team to complete your inquiry.';
    status.hidden = false;
    emailLink.focus();
  });
}
