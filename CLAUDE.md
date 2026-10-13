# ESW Beauty theme

Shopify Online Store 2.0 theme for eswbeauty.com, built on Dawn v16.0.0.
**SPEC.md is the source of truth.** Read it before changing anything.

## Rules

- Never publish from the CLI. Push only to the unpublished preview theme (`shopify theme push --unpublished` or `--theme <id>`).
- No page builder, no jQuery, no front-end framework. Use vanilla JS and web components the way Dawn does them.
- Colors come only from the tokens in `assets/base.css` (ESW layer at the end of the file) and the matching color schemes in `config/settings_data.json`. Never use `#FF4F8B`.
- Two font families: Gelica (headings) and Lato (everything else).
- Exactly one H1 per page. Sections never output H1s, except the homepage hero (`esw-hero`) and Dawn's main templates (product title, collection banner).
- The free-shipping threshold is `settings.free_shipping_threshold`. Never hard-code it.
- Keep Dawn files as close to upstream as possible. Put ESW work in `esw-*` sections and snippets, and mark edits to Dawn files with an `ESW:` comment.

## Checks

```sh
shopify theme check            # must report no errors
```

## Layout

- `sections/esw-*.liquid`: ESW sections (homepage, PDP extras, app slots)
- `snippets/esw-*.liquid`: ESW snippets (rating, badges, free-shipping bar, purchase options)
- `snippets/card-product.liquid`: the ESW product card (replaces Dawn's card everywhere)
- `assets/esw.js`: web components (free-shipping-bar, sticky-atc, add-items-button)
- `assets/esw-sections.css`: styles for ESW sections, loaded only by those sections
