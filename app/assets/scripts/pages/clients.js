const filter = document.querySelector('[data-client-filter]');

if (filter) {
  const cards = [...document.querySelectorAll('[data-client-industry]')];
  const status = document.querySelector('[data-client-status]');

  function update() {
    let count = 0;
    cards.forEach((card) => {
      card.hidden = filter.value !== 'all' && card.dataset.clientIndustry !== filter.value;
      if (!card.hidden) count++;
    });
    status.textContent = `${count} clients${filter.value === 'all' ? '' : ` in ${filter.value}`}`;
    const url = new URL(location.href);
    if (filter.value === 'all') url.searchParams.delete('industry');
    else url.searchParams.set('industry', filter.value);
    history.replaceState(null, '', url);
  }

  const initial = new URLSearchParams(location.search).get('industry');
  if ([...filter.options].some((option) => option.value === initial)) filter.value = initial;
  filter.addEventListener('change', update);
  update();
}
