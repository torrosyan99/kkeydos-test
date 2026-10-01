const form = document.querySelector('[data-project-form]');

if (form) {
  const services = [...form.querySelectorAll('[name="services"]')];
  const serviceError = document.getElementById('services-error');
  const status = form.querySelector('[data-project-status]');
  const emailLink = form.querySelector('[data-project-email]');

  function validateServices() {
    const valid = services.some((service) => service.checked);
    services[0].setCustomValidity(valid ? '' : 'Select at least one service.');
    serviceError.hidden = valid;
    return valid;
  }

  form.addEventListener('input', (event) => {
    status.hidden = true;
    emailLink.hidden = true;
    if (event.target.name === 'services') validateServices();
    else event.target.setCustomValidity('');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    for (const name of ['name', 'description']) {
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
      `Services: ${data.getAll('services').join(', ')}`,
      `Budget: ${data.get('budget') || 'To be discussed'}`,
      `Expected start: ${data.get('timeline') || 'To be discussed'}`,
      '',
      'Project details:',
      data.get('description'),
    ].join('\n');
    emailLink.href = `mailto:info@keydos.com?subject=${encodeURIComponent('New project inquiry')}&body=${encodeURIComponent(body)}`;
    emailLink.hidden = false;
    status.textContent =
      'Your project brief is ready. Open the email below and send it to our team to complete your inquiry.';
    status.hidden = false;
    emailLink.focus();
  });
}
