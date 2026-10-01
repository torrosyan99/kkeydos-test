# Service pages

This project uses static HTML, Tailwind, and ES modules. Service pages keep that architecture. There is no browser-side page builder or framework.

## Working example

- `app/services/ai-development.html` — generated, complete page.
- `src/services/ai-development.html` — the actual section markup, in reading order.
- `src/services/ai-development.mjs` — page metadata and Hero settings.
- `src/services/ai-development.hero.html` — optional service-specific Hero visual.
- `src/services/ai-development.intro.html` — service highlights, technologies, and reviews below the Hero, before navigation. Set the optional `intro` filename in the service metadata to add this area to another service.
- `src/services/hero.html` and `layout.html` — shared Hero and document layout.

Run `npm run build` after editing a service. It builds the HTML first, then Tailwind CSS. `npm run build:services` rebuilds only service HTML. Commit the generated HTML and CSS with the source changes, as with the rest of this static site.

## Add a service

1. Create `src/services/cloud-development.mjs` using the example's metadata shape.
2. Create `src/services/cloud-development.html` with that service's own sections. Use `section > .page-container`, existing heading styles, buttons, and breakpoints.
3. Add `id="architecture" data-service-section="Architecture"` to sections that belong in the navigation. Links are generated from these sections in document order. Unmarked sections remain outside the navigation.
4. Optionally create `cloud-development.hero.html` and set `hero.visual` to its filename. This is ordinary HTML: it can contain an illustration, product visual, or other service-specific content.
5. Run `npm run build`. The result is `app/services/cloud-development.html`.

The section body is not an array or schema. Each service owns its full composition and final CTA. Sections may be added, reordered, or completely replaced without changing the shared layout. The example's bottom CTA is intentionally part of its own HTML, not a second rendering of the Hero.

## Hero options

`heading` accepts trusted project-authored HTML, such as a highlighted phrase or line break. `description`, `eyebrow`, and other copy are escaped as text.

- `surface`: existing Tailwind classes or a scoped service background class.
- `backgroundImage`: optional local asset path relative to the output page, such as `../assets/images/backgrounds/fintech-hero.webp`.
- `backgroundClass`: optional image treatment classes, such as `opacity-20 object-right`.
- `visual`: optional HTML fragment inside the text column.
- `icon`, `formTitle`, `formDescription`, `formPlaceholder`, `formButton`: form context for the current service.

Do not add another global breakpoint or typography scale for a service. Its scoped styles belong in `src/styles/pages/service.css`. The example reuses the project's teal/orange palette, `green-block`, icons, and existing AI product assets.

## Existing components

`scripts/build-services.mjs` reads the site header, footer, and first inquiry form directly from `app/technologies/technology.html`. Service pages therefore reuse the existing form and country selector rather than introducing a different form. The build adds unique field names, labels, input types, and validation to the service copy; it does not edit Technology or Industry.

Section navigation uses `navigation.html` and the existing `fixedBlock`, positioned beneath the 80px site header. Its compact trigger shows the current section, its number, and progress through the section list. The numbered panel works on desktop and mobile, closes on selection, Escape, outside click, or focus leaving the control, and scrolls internally on short screens. Arrow Down opens the panel and focuses the current section; Tab follows normal link order. Section selection preserves native anchor/history behavior and moves focus to the destination.

`service.js` retains the existing requestAnimationFrame-throttled scroll tracking, with a ResizeObserver to account for content height changes. It handles manual scrolling, anchor navigation, viewport changes, and restored pages. Reduced-motion preferences disable the panel animation and smooth anchor scrolling. Use `scroll-mt-40` on section destinations to leave room for the header and compact navigation.

The FAQ and country selector use the shared handlers in `main.js`, including keyboard operation and input/change events for selects. `service.js` adds inquiry handling.

## Example composition

The AI example uses a dark teal Hero with a connected-workflow graphic, asymmetric capability rows, a wide product illustration with an offset explanation, an engineering diagram, a vertical delivery process, the shared FAQ, and a closing `black-section` with text and CTA on the left and a team photo on the right. Product illustrations are explicitly labeled as concepts, not client case studies or measured results. Other services can replace all these sections and use their own Hero surface and visual.

## Form delivery

The project has no configured submission API. The example follows contact-us: it validates the brief and prepares a `mailto:` link for the visitor to send. It does not claim that a request was delivered.

To connect a real form backend, set `hero.formAction` to its URL. The form then uses a native URL-encoded POST; the mailto handler does not intercept it. The endpoint must accept `name`, `email`, `company`, `countryCode`, `phone`, and `description` and provide its own success/error response.

## Routes

The output follows the existing `.html` convention. Clean `/services/service-name` URLs require the same static-host rewrite configuration used for the other pages. No server or router is introduced here.
