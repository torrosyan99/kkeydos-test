const search = document.querySelector('[data-blog-search]');
const blogNav = document.querySelector('[data-blog-nav]');
const searchToggle = document.querySelector('[data-blog-search-toggle]');
const controls = document.querySelector('[data-blog-controls]');
const menuToggle = document.querySelector('[data-blog-menu-toggle]');
const links = document.querySelector('[data-blog-links]');
const desktop = window.matchMedia('(min-width: 48rem)');

function setMenu(open) {
  open = !desktop.matches && open;
  menuToggle.setAttribute('aria-expanded', String(open));
  links.hidden = !desktop.matches && !open;
  if (open) {
    blogNav.dataset.scrollHidden = 'false';
    blogNav.inert = false;
  }
}

function setSearch(open, restoreFocus = true) {
  if (open) setMenu(false);
  search.hidden = !open;
  controls.inert = open;
  controls.setAttribute('aria-hidden', String(open));
  searchToggle.setAttribute('aria-expanded', String(open));
  blogNav.dataset.scrollHidden = 'false';
  blogNav.inert = false;
  if (open) search.querySelector('input').focus({ preventScroll: true });
  else if (restoreFocus) searchToggle.focus({ preventScroll: true });
}

if (search && blogNav) {
  setMenu(false);
  desktop.addEventListener('change', () => {
    setMenu(false);
    setSearch(false, false);
  });
  menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  searchToggle.addEventListener('click', () => setSearch(true));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!search.hidden) setSearch(false);
    else if (menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuToggle.focus({ preventScroll: true });
    }
  });
  document.addEventListener('click', (event) => {
    if (blogNav.contains(event.target) || menuToggle.contains(event.target)) return;
    if (!search.hidden) setSearch(false, false);
    setMenu(false);
  });
}

if (blogNav) {
  blogNav.dataset.stuck = String(window.scrollY > 16);
  let previousScrollY = window.scrollY;
  let scheduled = false;

  window.addEventListener(
    'scroll',
    () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const change = currentScrollY - previousScrollY;
        blogNav.dataset.stuck = String(currentScrollY > 16);
        const interacting = !search.hidden || menuToggle.getAttribute('aria-expanded') === 'true';
        if (currentScrollY < 120 || interacting || change < -6) {
          blogNav.dataset.scrollHidden = 'false';
          blogNav.inert = false;
        } else if (change > 6) {
          blogNav.dataset.scrollHidden = 'true';
          blogNav.inert = true;
          setMenu(false);
        }
        if (Math.abs(change) > 6 || currentScrollY < 120) previousScrollY = currentScrollY;
        scheduled = false;
      });
    },
    { passive: true },
  );
}

export { search, blogNav, menuToggle, desktop, setMenu, setSearch };
