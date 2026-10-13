# ESW Beauty theme

Dawn v16.0.0 base with the ESW rebuild from `SPEC.md`. Build status: setup, foundations and templates (SPEC 12, steps 1–3).

## Run it

```sh
shopify theme check                                   # no errors expected
shopify theme dev --store eswbeauty.myshopify.com     # local preview (needs collaborator access)
shopify theme push --unpublished                      # creates the preview theme. Never --publish.
```

## Store setup the theme expects

The theme reads these values but cannot create them. Set them up in Shopify admin before testing.

**Theme files**
- Upload `gelica-regular.woff2` and `gelica-medium.woff2` to `assets/`, then turn on *Theme settings › ESW Beauty › Use Gelica for headings*. Until then, Lora stands in.

**Metafield definitions** (Settings › Custom data), namespace `esw`
| Owner | Key | Type |
| --- | --- | --- |
| Product | `best_for` | Single line text |
| Product | `attributes` | List of single line text |
| Product | `key_ingredients` | JSON: `[{"name": "", "benefit": ""}]` |
| Product | `how_to_use` | List of single line text |
| Product | `faq` | JSON: `[{"q": "", "a": ""}]` |
| Product | `routine_pair` | Product reference |
| Product | `seo_description` | Single line text (used in step 5) |
| Shop | `store_rating`, `review_count` | Single line text (trust strip; falls back to section settings) |

Ratings come from the standard `reviews.rating` / `reviews.rating_count` metafields. Turn on Yotpo's metafield sync.

**Product tags:** `badge:new`, `badge:bestseller` and `badge:set` drive the card badges. `default:subscribe` preselects subscribe-and-save.

**Navigation:** `main-menu` (five menus, SPEC 4.1), `footer` (Help + policies) and `esw-company` (Our story, Press, Wholesale, Careers, Our partners).

**Pages linked from the homepage** (step 6 builds these): `/pages/quiz`, `/pages/our-story`, concern hubs (`/pages/dry-skin`, `/pages/breakouts-oil`, `/pages/sensitive-red`, `/pages/dull-uneven`, `/pages/tired-eyes`, `/pages/dry-lips`) and ingredient hubs (`/pages/pdrn`, `/pages/centella`, `/pages/niacinamide`, `/pages/hyaluronic-acid`, `/pages/vitamin-c`, `/pages/heartleaf`). Change the URLs in the theme editor if the handles differ.

**In the theme editor:** add the Yotpo Reviews and Tolstoy app blocks to the "ESW: app slot" sections (PDP reviews, PDP creator videos, homepage "As seen on TikTok"). Pick the hero image and the three bundles.

## What's where

| Area | Files |
| --- | --- |
| Tokens, type, buttons, card, drawer | `assets/base.css` (ESW layer at the end) |
| Section styles | `assets/esw-sections.css` |
| Web components | `assets/esw.js`: `free-shipping-bar`, `sticky-atc`, `add-items-button`, `variant-refresh`, `purchase-options` |
| Homepage | `templates/index.json`; `sections/esw-hero`, `esw-trust-strip`, `esw-concern-tiles`, `esw-product-grid`, `esw-bundles`, `esw-app-slot`, `esw-ingredient-pills`, `esw-founder-note` |
| PDP | `templates/product.json`; `sections/esw-breadcrumb`, `esw-product-details`; ESW blocks added to `sections/main-product.liquid` |
| Cart drawer | `snippets/cart-drawer.liquid` + `esw-free-shipping-bar`, `esw-cart-upsell` |

Edits to Dawn files are marked with `ESW:` comments.

## Not done yet (SPEC 12, steps 4–8)

App wiring beyond the app-block slots, the SEO layer (title/meta templates, consolidated JSON-LD, noindex), the Learn templates, the performance pass and QA. Founder-note and hero copy are drafts for ESW to approve.
