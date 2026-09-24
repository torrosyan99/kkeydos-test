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
