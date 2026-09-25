# KKEYDOS static site

## Commands

- `npm run build:css` builds the independent main-site and AI-page CSS bundles.
- `npm run build` is the deployment build command. Publish the `app/` directory.
- `npm run dev:css` watches the main-site CSS sources while developing.
- `npm run format` formats maintained source files.
- `npm run check` checks formatting, rebuilds CSS, and validates local assets,
  duplicate IDs, label relationships, and the project ARIA policy.

Generated CSS lives in `app/assets/styles/main.css` and
`app/ai-page/assets/styles/ai.css`. Edit the files under `src/` and `app/ai-page/src/`
instead.

## CSS structure

- `settings/` contains design tokens.
- `base/` contains global reset and semantic typography.
- `layout/` contains containers and section-level layout helpers.
- `components/` contains reusable UI components.
- `pages/` contains styles that belong to one page only.

Use classes for presentation, `data-*` attributes for JavaScript hooks and
state, and IDs only for document anchors and form labels.

The main page uses `--page-content-width: min(100% - 3rem, 95rem)` for its
header, hero, sections, sticky navigation, and footer: a 1520px maximum with
24px minimum side gutters. Keep this shared width fluid instead of adding
smaller container caps at desktop breakpoints.

`details[data-card-selector]` is the shared responsive card contract. Its
`summary[data-card-selector-summary]` behaves like a static card heading from
834px upward and like a native disclosure on smaller screens. Add
`data-card-selector-group` to the parent grid when the mobile layout should
collapse to one column. The initial `open` attribute is preserved as the
mobile starting state.

## Images

Shared site images are grouped by purpose under `app/assets/images/`. AI-page
assets remain page-scoped under `app/ai-page/assets/images/ai/` and are grouped as
`content`, `logos`, `people`, `icons`, and `flags`.

## Reusing the service hero

The hero in `app/index.html` uses `src/styles/components/service-hero.css`.
Change its heading, description, links, and benefit labels directly in HTML.
Its copy column stays 512px wide from 900px upward; the illustration and form
share the remaining space. Below 1200px the form opens beneath the hero through
the project buttons. Below 900px both visible columns can shrink, and below
640px the hero stacks vertically.
The visual is independent of JavaScript and supports any service content:

- `.service-hero-artwork` accepts an image or a responsive `<picture>`. The
  current picture uses `chip.svg` from 640px upward and `assistant-v2.png` on
  mobile. Change its `<source srcset>` and `<img src>` to use other artwork,
  updating the alternative text and dimensions. A single `<img>` with the same
  class can be used when both layouts should share one image.
- Each `.service-hero-icon` accepts either an inline SVG (including an external
  `<use>`) or `<img src="…" alt="" />`. Edit the adjacent heading and description
  to match. Card colors and positions do not depend on the icon or text.
- For an icon grid without the central illustration, add
  `service-hero-visual--icons` to `.service-hero-visual`. This supports any number
  of cards in two columns. The default illustration layout uses four cards.
- Keep `data-ai-contact`, `data-ai-project-link`, and the `ai-project` anchor if
  reusing the contact reveal behavior on mobile. These hooks do not depend on
  the page's wording or icons.

The overview Google Reviews badge uses the figures published on
https://staging.kkeydos.com/ on September 24, 2026: 4.9/5 and 60+ reviews.
It is a static badge; review figures should be updated alongside the site's
existing Google Reviews card.

The mobile robot at `app/assets/images/ai/assistant-v2.png` was generated with
the built-in image generation tool from the supplied mobile screenshot.
See [hero asset notes](docs/hero-assets.md) for the saved paths and full prompt.
