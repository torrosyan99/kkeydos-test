import { search, blogNav, menuToggle, desktop, setMenu, setSearch } from './blog-nav.js';

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
    const title = article.querySelector('[data-blog-title]');
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
    const content = document.createElement('div');
    content.className = 'p-6 group-hover:text-brand-teal';
    const title = document.createElement('h5');
    title.textContent = post.title;
    content.append(title);
    link.append(img, content);
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
