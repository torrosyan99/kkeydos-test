document.querySelectorAll('[data-case-request]').forEach((form) => {
  const link = form.parentElement.querySelector('[data-case-email]');
  const status = form.querySelector('[data-case-status]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const email = new FormData(form).get('email').trim();
    const subject = 'Abra case study PDF request';
    const body = `Hello KKEYDOS,\n\nPlease send me the Abra case study PDF.\nMy email: ${email}\n\nThank you.`;
    link.href = `mailto:info@keydos.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.hidden = false;
    status.textContent =
      'Your email request is ready. Open the link to send it from your email app.';
    link.focus();
  });

  form.addEventListener('input', () => {
    link.hidden = true;
    link.removeAttribute('href');
    status.textContent = '';
  });
});
