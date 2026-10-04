import { search, setSearch } from './blog-nav.js';

const input = search.querySelector('input');
const cards = [...document.querySelectorAll('[data-category-card]')];
const count = document.querySelector('[data-category-count]');
const status = document.querySelector('[data-category-status]');
const empty = document.querySelector('[data-category-empty]');
const pagination = document.querySelector('[data-category-pagination]');
const pages = document.querySelector('[data-category-pages]');
const previous = document.querySelector('[data-category-step="-1"]');
const next = document.querySelector('[data-category-step="1"]');
const pageSize = 15;
let currentPage = 1;

function pageUrl(page) {
  const url = new URL(window.location.href);
  const query = input.value.trim();
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  if (page > 1) url.searchParams.set('page', page);
  else url.searchParams.delete('page');
  return url;
}

function render() {
  const query = input.value.trim().toLowerCase();
  const matches = cards.filter((card) => card.textContent.toLowerCase().includes(query));
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  currentPage = Math.max(1, Math.min(currentPage, pageCount));
  const start = (currentPage - 1) * pageSize;
  const visible = new Set(matches.slice(start, start + pageSize));
  cards.forEach((card) => {
    card.hidden = !visible.has(card);
  });
  count.textContent = matches.length;
  empty.hidden = matches.length > 0;
  pagination.hidden = pageCount < 2;
  previous.disabled = currentPage === 1;
  next.disabled = currentPage === pageCount;
  status.textContent = matches.length
    ? `Showing ${start + 1}–${Math.min(start + pageSize, matches.length)} of ${matches.length} Technology articles.`
    : 'No articles found.';
  pages.replaceChildren(
    ...Array.from({ length: pageCount }, (_, index) => {
      const page = index + 1;
      const link = document.createElement('a');
      link.className =
        'btn-outline size-10 p-0 aria-[current=page]:bg-primary aria-[current=page]:text-white';
      link.href = pageUrl(page).href;
      link.textContent = page;
      link.setAttribute('aria-label', `Page ${page}`);
      if (page === currentPage) link.setAttribute('aria-current', 'page');
      return link;
    }),
  );
}

function navigate(page) {
  currentPage = page;
  render();
  history.pushState(null, '', pageUrl(currentPage));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

pages.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(Number(new URL(link.href).searchParams.get('page')) || 1);
});
previous.addEventListener('click', () => navigate(currentPage - 1));
next.addEventListener('click', () => navigate(currentPage + 1));

input.addEventListener('input', () => {
  currentPage = 1;
  render();
  history.replaceState(null, '', pageUrl(currentPage));
});
search.addEventListener('submit', (event) => {
  event.preventDefault();
  setSearch(false);
  window.scrollTo({ top: 0, behavior: 'instant' });
});
document.querySelector('[data-category-reset]').addEventListener('click', () => {
  input.value = '';
  setSearch(false);
  navigate(1);
});

function readLocation() {
  const params = new URLSearchParams(window.location.search);
  input.value = params.get('q') || '';
  currentPage = Math.floor(Number(params.get('page'))) || 1;
  render();
  setSearch(Boolean(input.value), false);
}

window.addEventListener('popstate', readLocation);
readLocation();
