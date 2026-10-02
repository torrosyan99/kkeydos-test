const search = document.querySelector('[data-blog-search]');
const blogNav = document.querySelector('[data-blog-nav]');
const searchToggle = document.querySelector('[data-blog-search-toggle]');
const controls = document.querySelector('[data-blog-controls]');
const menuToggle = document.querySelector('[data-blog-menu-toggle]');
const links = document.querySelector('[data-blog-links]');
const desktop = window.matchMedia('(min-width: 834px)');

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

if (search) {
  const input = search.querySelector('input');
  const featured = document.querySelector('[data-blog-featured]');
  const categories = [...document.querySelectorAll('[data-blog-category]')];
  const filters = [...document.querySelectorAll('[data-blog-filter]')];
  const results = document.querySelector('[data-blog-results]');
  const resultList = document.querySelector('[data-blog-result-list]');
  const status = document.querySelector('[data-blog-status]');
  const articles = [
    featured.querySelector('article'),
    ...featured.querySelectorAll('li'),
    ...document.querySelectorAll('[data-blog-card]'),
  ].map((article) => {
    const title = article.querySelector('h2, h3');
    const link = title.querySelector('a') || title.closest('a');
    return {
      title: title.textContent.trim(),
      href: link.getAttribute('href'),
      external: link.target === '_blank',
      image: article.querySelector('img'),
      category:
        article.closest('[data-blog-category]')?.dataset.blogCategory || 'software-development',
    };
  });
  const posts = [...new Map(articles.map((post) => [post.href, post])).values()];
  let activeCategory = 'all';

  function saveLocation() {
    const url = new URL(window.location.href);
    url.hash = activeCategory === 'all' ? '' : activeCategory;
    const query = input.value.trim();
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }

  function renderResult(post) {
    const article = document.createElement('article');
    article.className = 'overflow-hidden rounded-xl bg-white';
    const link = document.createElement('a');
    link.className = 'group block';
    link.href = post.href;
    if (post.external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    const img = post.image.cloneNode();
    img.className = 'aspect-video w-full object-cover';
    img.loading = 'lazy';
    const title = document.createElement('h3');
    title.className = 'p-6 text-2xl group-hover:text-brand-teal max-md:text-xl';
    title.textContent = post.title;
    link.append(img, title);
    article.append(link);
    return article;
  }

  function update() {
    const query = input.value.trim().toLocaleLowerCase();
    filters.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.blogFilter === activeCategory));
    });
    featured.hidden = Boolean(query) || activeCategory !== 'all';
    categories.forEach((section) => {
      section.hidden =
        Boolean(query) ||
        (activeCategory !== 'all' && section.dataset.blogCategory !== activeCategory);
    });
    results.hidden = !query;
    if (!query) return;
    const matches = posts.filter((post) => {
      const inCategory = activeCategory === 'all' || activeCategory === post.category;
      return (
        inCategory &&
        `${post.title} ${post.category.replaceAll('-', ' ')}`.toLocaleLowerCase().includes(query)
      );
    });
    resultList.replaceChildren(...matches.map(renderResult));
    status.textContent = matches.length
      ? `${matches.length} ${matches.length === 1 ? 'article' : 'articles'} found for “${input.value.trim()}”.`
      : 'No articles found. Try another keyword or choose a different category.';
  }

  function selectCategory(category) {
    blogNav.dataset.scrollHidden = 'false';
    blogNav.inert = false;
    setSearch(false, false);
    setMenu(false);
    activeCategory = category;
    input.value = '';
    saveLocation();
    update();
  }

  filters.forEach((button) =>
    button.addEventListener('click', () => {
      selectCategory(button.dataset.blogFilter);
      if (!desktop.matches) menuToggle.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }),
  );
  document.querySelectorAll('[data-blog-reset]').forEach((button) =>
    button.addEventListener('click', () => {
      selectCategory('all');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }),
  );
  search.addEventListener('submit', (event) => {
    event.preventDefault();
    update();
    saveLocation();
    setSearch(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  input.addEventListener('input', () => {
    update();
    saveLocation();
  });
  function readLocation() {
    const category = window.location.hash.slice(1);
    activeCategory = categories.some((section) => section.dataset.blogCategory === category)
      ? category
      : 'all';
    input.value = new URLSearchParams(window.location.search).get('q') || '';
    update();
    setSearch(Boolean(input.value), false);
  }
  window.addEventListener('hashchange', readLocation);
  window.addEventListener('popstate', readLocation);
  readLocation();
}
