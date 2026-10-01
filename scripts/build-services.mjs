import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as prettier from 'prettier';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'src/services');
const output = path.join(root, 'app/services');
const read = (file) => fs.readFile(path.join(source, file), 'utf8');
const escape = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

function fill(template, values) {
  return template.replace(/{{(\w+)}}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Missing template value: ${key}`);
    return values[key];
  });
}

// Keep the existing site shell and inquiry form as the source of truth.
// They are composed at build time; the delivered page has no runtime includes.
const technology = await fs.readFile(path.join(root, 'app/technologies/technology.html'), 'utf8');
const header = technology
  .match(/<header\b[\s\S]*?<\/header>/)?.[0]
  .replaceAll('href="assets/', 'href="../assets/');
const footer = technology
  .match(/<footer\b[\s\S]*?<\/footer>/)?.[0]
  .replaceAll('href="assets/', 'href="../assets/');
const inquiry = technology.slice(technology.indexOf('<main')).match(/<form\b[\s\S]*?<\/form>/)?.[0];
if (!header || !footer || !inquiry)
  throw new Error('Technology page shell or inquiry form is missing.');

function form(hero) {
  const action = hero.formAction || 'mailto:info@keydos.com';
  const enctype = action.startsWith('mailto:') ? 'text/plain' : 'application/x-www-form-urlencoded';
  let html = inquiry.replace(
    /<form\b[^>]*>/,
    `<form class="mt-5 flex flex-col gap-2.5" data-service-form aria-labelledby="service-form-title" action="${escape(action)}" method="post" enctype="${enctype}">`,
  );
  const fields = [
    ['Your name', 'name', 'text', 'name', true],
    ['Your email', 'email', 'email', 'email', true],
    ['Company name', 'company', 'text', 'organization', false],
    ['Mobile number', 'phone', 'tel', 'tel-national', false],
  ];
  for (const [placeholder, name, type, autocomplete, required] of fields) {
    const match = new RegExp(`<input\\b[^>]*placeholder="${placeholder}"[^>]*>`);
    if (!match.test(html)) throw new Error(`Shared form field is missing: ${placeholder}`);
    const input = `<label class="sr-only" for="service-${name}">${placeholder}${required ? ' (required)' : ''}</label><input class="input min-w-0" id="service-${name}" name="${name}" type="${type}" placeholder="${placeholder}${required ? ' *' : ''}" autocomplete="${autocomplete}" maxlength="${name === 'phone' ? 40 : 140}" ${required ? 'required' : ''}>`;
    html = html.replace(match, input);
  }
  html = html
    .replace(
      /<input type="hidden"\s*\/?\s*>/,
      '<input type="hidden" name="countryCode" value="IN +91">',
    )
    .replace(
      'class="select__button min-w-27"',
      'class="select__button min-w-27" aria-label="Country calling code" aria-controls="service-country-options" aria-haspopup="listbox"',
    )
    .replace(
      'role="listbox"',
      'role="listbox" id="service-country-options" aria-label="Country calling code"',
    )
    .replace(
      /<textarea\b[\s\S]*?<\/textarea>/,
      `<label class="sr-only" for="service-description">Project details (required)</label><textarea class="textarea" id="service-description" name="description" placeholder="${escape(hero.formPlaceholder || 'Tell us about your project.')}" rows="3" maxlength="5000" required></textarea>`,
    )
    .replace(
      /<button class="btn">[^<]*<\/button>/,
      `<button class="btn" type="submit">${escape(hero.formButton || 'Start Your Project')}</button>`,
    )
    .replace(/<div>\s*(<label class="sr-only"[\s\S]*?)\s*<\/div>/g, '$1')
    .replace(
      '</form>',
      '<p class="text-brand-gray mt-2 text-sm" role="status" data-inquiry-status hidden></p><a class="text-brand-teal text-sm font-medium underline" data-inquiry-email hidden>Open your project email</a></form>',
    );
  return html;
}

function navigation(content) {
  const sections = [...content.matchAll(/<section\b[^>]*>/g)].flatMap(([tag]) => {
    const label = tag.match(/data-service-section="([^"]+)"/)?.[1];
    if (!label) return [];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    if (!id) throw new Error(`Navigation section "${label}" needs an id.`);
    return [{ id, label }];
  });
  const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate section or element id.');
  if (!sections.length) return '';
  return `<div data-fixed><nav class="border-brand-border inset-x-0 top-20 z-30 border-b bg-white py-3 data-[fixed=true]:fixed data-[fixed=true]:shadow-default" data-fixed-content aria-label="Service sections"><div class="page-container flex items-center gap-6"><div class="flex min-w-0 flex-1 gap-1 overflow-x-auto" data-service-links>${sections.map(({ id, label }) => `<a class="service-nav-link" href="#${escape(id)}">${escape(label)}</a>`).join('')}</div><a class="arrow-btn shrink-0 text-brand-teal max-xl:hidden" href="#service-inquiry">Let’s talk<svg aria-hidden="true"><use href="../assets/images/icons.svg#arrow-right"></use></svg></a></div></nav></div>`;
}

await fs.mkdir(output, { recursive: true });
const options = await prettier.resolveConfig(path.join(root, '.prettierrc'));
const [layout, heroTemplate, files] = await Promise.all([
  read('layout.html'),
  read('hero.html'),
  fs.readdir(source),
]);
for (const file of files.filter((file) => file.endsWith('.mjs'))) {
  const slug = file.replace('.mjs', '');
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid service slug: ${slug}`);
  const { default: page } = await import(pathToFileURL(path.join(source, file)).href);
  const content = await read(`${slug}.html`);
  const hero = page.hero;
  const background = hero.backgroundImage
    ? `<img class="pointer-events-none absolute inset-0 -z-10 size-full object-cover ${escape(hero.backgroundClass || '')}" src="${escape(hero.backgroundImage)}" alt="" fetchpriority="high">`
    : '';
  const visual = hero.visual ? await read(hero.visual) : '';
  const html = fill(layout, {
    title: escape(page.title),
    description: escape(page.description),
    slug,
    name: escape(page.name),
    header,
    footer,
    content,
    navigation: navigation(content),
    hero: fill(heroTemplate, {
      name: escape(page.name),
      surface: escape(hero.surface || 'bg-brand-light'),
      eyebrow: escape(hero.eyebrow || page.name),
      heading: hero.heading,
      description: escape(hero.description),
      background,
      visual,
      icon: escape(hero.icon || 'code'),
      formTitle: escape(hero.formTitle || 'Tell Us About Your Project'),
      formDescription: escape(hero.formDescription || 'Share your goals with our team.'),
      form: form(hero),
    }),
  });
  await fs.writeFile(
    path.join(output, `${slug}.html`),
    await prettier.format(html, { ...options, parser: 'html' }),
  );
  console.log(`Built app/services/${slug}.html`);
}
