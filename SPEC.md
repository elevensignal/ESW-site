# ESW Beauty — Shopify Theme Rebuild Spec

Build spec for a new eswbeauty.com theme, based on the October 12, 2026 site audit. Drop this file into the root of the theme repo (rename to `CLAUDE.md` or keep as `SPEC.md` and point `CLAUDE.md` at it) so every build session works from the same requirements.

- **Store:** eswbeauty.com (Shopify, store ID 16657973302)
- **Prepared by:** Eleven Signal, with SyncPoint Creative as build partner
- **Reference material:** the audit doc, the homepage + PDP mockups (Design canvas "ESW Beauty Homepage + PDP Redesign"), and the client deck. Links are in Section 14.

---

## 1. Goal

Ship an **unpublished theme on ESW's live Shopify store** that ESW can test through a preview link with real products, prices, apps and checkout. Nothing changes for shoppers until ESW publishes it.

The theme must fix what the audit found:

1. **Speed:** the mobile homepage is 12.8MB, loads 421 requests and takes ~4.7s to show its main content.
2. **AOV:** the free-shipping bar ($20) sits below a single serum ($22.99), and bundles are buried.
3. **Search and AI visibility:** no content layer, duplicate schema, reviews hidden from search.
4. **Design consistency:** 4 font families, no color system, failing button contrast, a 17.5-screen mobile homepage.

Success = ESW signs off on the preview and publishes it.

---

## 2. Decisions and constraints

| Decision | Choice | Notes |
| --- | --- | --- |
| Base theme | **Dawn** (latest), not the current theme | Confirm with the team before starting. The current theme carries leftover code from removed apps. |
| Where it lives | Unpublished theme on ESW's production store | Needs collaborator access with Themes permission. Never publish from the CLI. |
| Version control | GitHub repo, Shopify GitHub integration optional | Branch per section; PRs reviewed before pushing to the preview theme. |
| Page builder | **None.** Native Online Store 2.0 sections and blocks only | Removes Shogun (currently used on the mask PDPs). |
| Frameworks | No jQuery, no front-end framework | Vanilla JS, web components the way Dawn does them. |
| Fonts | Gelica (headlines) + Lato (everything else) | Gelica is a licensed font: get the web font files and license from ESW. Lato is on Shopify's font library. |

**Apps — keep and wire into the new theme (confirm each with ESW):**

| App | Purpose | Theme integration |
| --- | --- | --- |
| Yotpo | Reviews | App block on PDP and product cards; stars in Product schema |
| Klaviyo | Email + popup forms | Embed; popup set to exit intent / 45s, not on load |
| Tolstoy | Shoppable creator video | App block on homepage "As seen on TikTok" and PDP |
| TYB | Rewards | Footer link + account page block |
| Subscription app (unconfirmed) | Powers `/pages/manage-my-subscriptions` | Need to identify the app; subscribe-and-save widget on PDP |

**Remove all code from these (uninstalled apps or duplicates):** Okendo, Loox, Stamped, Privy, Shogun, jQuery from ajax.googleapis.com. Confirm what Aisle (`cdn.gotoaisle.com`, 7 scripts per page) does before removing it.

---

## 3. Design system

### 3.1 Color tokens

Define once as CSS custom properties in `assets/base.css` (or theme settings), then use only the tokens.

| Token | Name | Hex | Use — and only this |
| --- | --- | --- | --- |
| `--color-bg` | Oat Milk | `#FFF8F0` | Page and card backgrounds |
| `--color-text` | Black Cherry | `#3B1A24` | Headlines, body, footer background |
| `--color-text-muted` | Cherry Grey | `#6B5560` | Secondary text (6.4:1 on Oat Milk) |
| `--color-action` | Dragonfruit | `#C72C66` | Add to cart and primary buttons **only** |
| `--color-highlight` | Matcha | `#C9E36B` | Free-shipping bar, progress, New / Best value badges |
| `--color-masks` | Peach | `#FFB38A` | Mask category tiles and headers |
| `--color-skincare` | Aqua | `#8FD3D1` | Mist, serum and moisturizer tiles |
| `--color-border` | Oat Line | `#EADCCF` | Dividers, input borders |

Contrast checks (must hold):

- White on Dragonfruit: 5.3:1 (passes AA). The current `#FF4F8B` pink fails at 3.1:1; do not use it.
- Black Cherry on Matcha: 10.8:1. Black Cherry on Peach: 8.9:1. Black Cherry on Aqua: 9.1:1.
- No white text on Matcha, Peach or Aqua.

### 3.2 Typography

- **Two families only:** Gelica for display headings, Lato for body, prices, buttons and UI.
- Scale (px): 40 / 32 / 24 / 18 for headings, 16 body, 14 meta. Mobile H1 can drop to 34.
- **Sentence case** for every heading. No all-lowercase headings, no Title Case.
- Load Gelica with `font-display: swap`, preload only the one weight used above the fold.

### 3.3 Components

- **Buttons:** pill shape, 48px minimum height. Primary = Dragonfruit with white text; secondary = 2px Black Cherry outline. One primary button per card.
- **Product card:** image (1:1), rating stars + count from Yotpo, title, one-line "Best for …", price, **one** add-to-cart button. No "Buy Now" on cards.
- **Badges:** exactly three types: `New`, `Bestseller`, `Set`. Driven by product tags. Remove "#1 mask", "#1 lip", "juicy tint" and similar.
- **Touch targets:** 44×44px minimum.
- **Focus states:** visible 2px outline in Black Cherry on every interactive element.
- **Icons:** inline SVG, stroke style, no icon font.

---

## 4. Information architecture

### 4.1 Main navigation (five menus)

| Menu | Items (link target) |
| --- | --- |
| Shop | Bestsellers (`/collections/bestsellers`), Bundles + sets (`/collections/value-sets`), Face masks (`/collections/our-face-masks`), Lip treatments (`/collections/smoothie-lip-treatments`), Eye patches (`/collections/latte-eye-patches`), Serums + creams (`/collections/skincare`), Facial mists (`/collections/facial-mists`), New in (`/collections/new-in`) |
| Shop by concern | Dry skin, Breakouts + oil, Sensitive + red, Dull + uneven, Tired eyes, Dry lips → each a **concern hub page** (Section 5.5) |
| Ingredients | PDRN, Centella (cica), Niacinamide, Hyaluronic acid, Vitamin C, Heartleaf → each an **ingredient hub page** |
| Learn (new) | Skin quiz (`/pages/quiz`), Routines, Journal (`/blogs/journal`), Glossary, FAQ (`/pages/faq`) |
| About + rewards | Our story, Press, Where to buy (store locator), TYB rewards, Creator program (affiliate) |

Rules:

- Every menu heading is a real link or a disclosure button. No `href="#"` sub-headers like today's "SHOP BY CATEGORY".
- Bestsellers and Bundles + sets come first under Shop.

### 4.2 Footer

Policies (terms, refund, privacy), Contact, Wholesale, Careers, Our partners, social links, **one** email signup.

### 4.3 URL cleanup and redirects

Set these in **Online Store → Navigation → URL Redirects** (admin, not theme code):

- Merge `/collections/lip-care` into `/collections/smoothie-lip-treatments` (301).
- Products with duplicate handles ending in `-1` / `-2` (for example `guava-mango-smoothie-lip-treatment-2`): pick the canonical handle and 301 the others. Pull the full list from `/products.json`.
- `/blogs/news` → `/blogs/journal` once the new blog exists.

### 4.4 Noindex

Add `<meta name="robots" content="noindex">` via template logic for:

- All `/pages/tolstoy-tv-channel*` pages (10 pages)
- `/pages/wishlist`
- `/pages/klaviyo-esw-beauty-subscription-page`
- `/pages/offers-page` (confirm with ESW)

---

## 5. Page specs

### 5.1 Announcement bar

- Text: "Free shipping + a free mask on orders over $35".
- Matcha background, Black Cherry text. One message, no rotating slider.

### 5.2 Homepage (`templates/index.json`)

Target: **under 8 phone screens** (~6,700px at 390px wide), down from 14,825px. Sections in this order:

1. **Header:** hamburger, logo, search, cart. Same colors on mobile and desktop.
2. **Hero (static, no carousel):** one image (the routine bundle), headline, subhead, two buttons: "Shop routine bundles" (primary) and "Take the 60-second skin quiz" (secondary). The hero headline is the page's **only H1**.
3. **Trust strip:** ★ rating + review count (live from Yotpo; 1,934 at audit time) · Made in Korea · Vegan + cruelty-free · Also at Target.
4. **Shop by concern:** six color tiles linking to the concern hubs, each with a one-line ingredient hint.
5. **Bestsellers:** 4–8 product cards from `/collections/bestsellers`, **in-stock only**.
6. **Build your routine:** three bundles on a Black Cherry band (current examples: Full Face Hydration & Glow $22.00, OnlyOne Glow by Aliya $28.00, Fall Favorites Lip Trio $26.97).
7. **As seen on TikTok:** one row of shoppable creator videos (Tolstoy). Replaces today's influencer grid plus two creator spotlights.
8. **Shop by ingredient:** pill links to the ingredient hubs.
9. **Founder note:** two lines plus a link to Our story.
10. **Email signup:** one form, one offer.
11. **Footer.**

Remove from today's homepage: the six-slide carousel, the "find your glow" mid-page H1, the second newsletter form, the "shop by your needs" checkbox recommender (replaced by concern tiles), and duplicate creator spotlights.

### 5.3 Product page (`templates/product.json`)

Mobile order:

1. Breadcrumb (Category / Subcategory).
2. Gallery: hero image, texture shot, 15s video thumbnail.
3. Rating stars + review count (link to reviews), **above** the title.
4. Title (the page's only H1), then a one-line "best for" description, then 2–3 attribute chips (for example "All skin types", "Non-greasy", "Vegan").
5. **Purchase options:** subscribe-and-save (default for masks, mists, eye patches) or one-time.
6. **Free-shipping progress bar:** "You're $X away from free shipping + a free mask".
7. **Complete the routine:** a fixed pairing with combined price and "Add both" button. Pairings are set per product via metafield.
8. Key ingredients: 2×2 grid from a metafield.
9. How to use: numbered steps from a metafield.
10. FAQ: accordion from a metafield, also output as FAQPage schema.
11. Reviews (Yotpo).
12. Creator videos (Tolstoy).
13. **Sticky add-to-cart bar on mobile:** product name, price, button. Appears once the main button scrolls out of view.

Fix: the mask PDPs currently render **6 H1s** (Shogun sections). Exactly one H1 per page.

### 5.4 Collection page

- H1 = collection name. A 1–2 sentence intro from the collection description.
- Filters: concern, ingredient, product type, price (Shopify Search & Discovery).
- Same product card as Section 3.3.

### 5.5 Learn templates (new)

These are the AEO content layer. Each is a page template with structured metafields so content can be filled without code.

**Concern hub** (`templates/page.concern.json`), ×6:

- H1: the concern ("Dry skin").
- **Direct answer:** 40–60 words answering "what helps [concern]".
- Comparison table: which ESW products, key ingredient, how often to use.
- Product grid (filtered collection).
- FAQ accordion (5–8 questions) → FAQPage schema.

**Ingredient hub** (`templates/page.ingredient.json`), ×6: same structure. "What it is / what it does / who it's for / ESW products with it".

**Journal** (`templates/blog.json`, `templates/article.json`):

- Create a new blog `journal` (the existing `/blogs/news` has 0 posts since 2019).
- Article template: H1, author, date, table of contents, body, related products, related hub links.

**Glossary** (`templates/page.glossary.json`): A–Z ingredient and term definitions with anchor links.

### 5.6 Cart drawer

- Free-shipping progress bar at $35.
- Gift tier messaging: "Free mask unlocked" at $35 (the gift itself is a Shopify automatic discount or app, not theme logic).
- One upsell row: a bundle or the complementary product.

---

## 6. Offers and AOV logic

Mostly **admin configuration, not theme code.** The theme only displays it. Confirm each with ESW before changing.

| Change | Where | From → To |
| --- | --- | --- |
| Free shipping threshold | Settings → Shipping | $20 → **$35** |
| Free mask | Discounts (automatic, buy X get Y) or gift app | "Every order" → **orders $35+** |
| Welcome offer | Klaviyo | Up to 20% via pick-a-fruit popup on load → **one offer, exit intent or 45s delay** |
| Subscribe-and-save | Subscription app | Not on PDPs → default option for consumables |

The theme reads the threshold from a **theme setting** (`settings.free_shipping_threshold`), not a hard-coded number.

---

## 7. SEO and AEO requirements

### 7.1 Head tags

| Page | Title template | Meta description |
| --- | --- | --- |
| Home | `ESW Beauty \| K-Beauty Skincare, Masks & Lip Treatments` | ≤155 chars, no emoji |
| Product | `{{ product.title }} \| ESW Beauty` | From a `seo.description` metafield; fall back to the first 155 chars of plain description. **No emoji.** |
| Collection | `{{ collection.title }} \| ESW Beauty` | Collection SEO description |
| Hub pages | `{{ page.title }}: What Works \| ESW Beauty` | The direct-answer sentence, trimmed to 155 |

- The current homepage title still reads "Clean Beauty Raw Juice Sheet Masks", and its meta description runs 320 characters. Replace both.
- `og:image` must be `https://`. The current one is `http://`.

### 7.2 Headings

- **Exactly one H1 per page.** Sections never output H1s.
- Logical H2/H3 order, no skipped levels used for styling.

### 7.3 Structured data (JSON-LD)

**One** block of each type per page. Today every page outputs 2× Organization, 2× WebSite and (on PDPs) 2× Product. Remove the theme's and apps' duplicates.

| Page | Schema |
| --- | --- |
| All pages | `Organization` (name, logo, sameAs: Instagram, TikTok, Pinterest, YouTube), `WebSite` with `SearchAction` |
| Product | `Product` with `offers`, `brand`, `sku`, `gtin` if available, `aggregateRating` + `review` from Yotpo; `BreadcrumbList` |
| Collection | `CollectionPage` + `BreadcrumbList` |
| Hub pages + FAQ | `FAQPage` |
| PDP "How to use" | `HowTo` |
| Articles | `Article` with author and dates |

The rating in schema must match the visible widget. Today Strawberries & Cream schema says 4 reviews while the page shows 37.

Validate every template in Google's Rich Results Test before sign-off.

### 7.4 Images

- Every product and content image gets descriptive `alt` text. Decorative images get `alt=""`. Today 77 of 184 homepage images and 92 of 120 mask-PDP images have no alt text.
- Alt text comes from the image's alt field in admin, with a fallback to the product title. Never leave it empty for product imagery.

### 7.5 llms.txt and brand facts

- Shopify serves a default `/llms.txt` that describes agent checkout, not the brand. Investigate whether it can be overridden (app proxy or Shopify setting). If it can't, publish a crawlable `/pages/about-esw` with the same facts and link it in the footer.
- Brand facts to include: founder Elina Sofia Wang, founded 2019, made in Korea, vegan and cruelty-free, retail partners (Target and others), hero products with a one-line "best for" each, and links to the concern and ingredient hubs.

---

## 8. Performance budget

Measure on mobile with Google PageSpeed Insights and Lighthouse (simulated Moto G, slow 4G).

| Metric | Today (audit) | Target |
| --- | --- | --- |
| Homepage transfer size (mobile) | 12.8 MB | **< 2.5 MB** |
| Homepage requests | 421 | **< 120** |
| Largest Contentful Paint | ~4.7s (unthrottled) | **< 2.5s** in PSI mobile |
| Cumulative Layout Shift | 0.015 | < 0.1 |
| Third-party scripts | 52 | **< 15** |
| Font families | 4 (7 font names) | **2** |
| PSI mobile performance score | not measured | **≥ 80** |

How:

- `image_url` with `srcset` / `sizes` for every image; WebP/AVIF via Shopify CDN.
- Hero image: preloaded, `fetchpriority="high"`, never lazy-loaded.
- Everything below the fold lazy-loads, with sized placeholders in brand color so tiles never flash as empty grey boxes.
- No carousel; no autoplay video above the fold.
- App scripts load only on templates that use them (reviews JS on PDP and collection, not the homepage unless the trust strip needs it).
- Defer all non-critical JS.

---

## 9. Accessibility

- WCAG 2.1 AA contrast on all text (Section 3.1).
- 44×44px touch targets; visible focus states.
- Real `<button>` and `<a>` elements. No click handlers on divs.
- Form fields have `<label>`s.
- Popups trap focus, close with Esc and return focus when closed.
- Run axe or Lighthouse accessibility on each template; target ≥ 95.

---

## 10. Merchandising rules

- **Bestsellers collection:** automated or manually curated, but **out-of-stock items hidden**. At audit, the out-of-stock Strawberry Matcha Latte Eye Patches were tagged "bestseller".
- **Category tile links must match their labels.** At audit, the "Skincare" tile opened facial mists, and "View all products" under Influencer Favorites opened bundles.
- **Server-rendered recommendations.** The current "shop by your needs" recommender shows a placeholder "Face Mask, $13.99" to crawlers because it only fills in with JavaScript.
- **Badges** come from product tags: `badge:new`, `badge:bestseller`, `badge:set`.

---

## 11. Metafields to create

Product (namespace `esw`):

| Key | Type | Used for |
| --- | --- | --- |
| `best_for` | single line text | Card and PDP one-liner |
| `attributes` | list of single line text | PDP chips |
| `key_ingredients` | JSON (name + benefit) | PDP ingredient grid |
| `how_to_use` | list of single line text | PDP steps + HowTo schema |
| `faq` | JSON (q + a) | PDP FAQ + FAQPage schema |
| `routine_pair` | product reference | "Complete the routine" |
| `seo_description` | single line text | Meta description |

Page (namespace `esw`): `direct_answer`, `comparison_table` (JSON), `faq` (JSON), `related_collection` (collection reference).

Populate metafields for at least the top 12 products before ESW testing. Draft content can come from existing product descriptions; the Peach Nectar description already lists ingredients and how-to steps.

---

## 12. Build order

1. **Setup:** repo, Dawn base, Shopify CLI connected to ESW store, unpublished theme created, preview link shared internally.
2. **Foundations:** color tokens, typography, button and card components, header, footer, announcement bar.
3. **Templates:** PDP, then homepage, then collection, then cart drawer.
4. **App wiring:** Yotpo, Klaviyo, Tolstoy, TYB, subscriptions.
5. **SEO layer:** head tags, single H1 audit, JSON-LD, alt text, noindex rules.
6. **Learn layer:** concern + ingredient hub templates, journal, glossary, with 2 hubs filled as examples.
7. **Performance pass:** measure, trim, re-measure against Section 8.
8. **QA** (Section 13), then share the preview link with ESW.

---

## 13. Acceptance checklist

ESW testing starts when every box is checked.

**Design**

- [ ] Only Gelica and Lato load on any page
- [ ] All colors come from the Section 3.1 tokens; no `#FF4F8B`
- [ ] Header looks the same on mobile and desktop
- [ ] Sentence case on every heading
- [ ] Product cards have one add-to-cart button and only New / Bestseller / Set badges
- [ ] Homepage is under 8 screens on a 390px-wide phone
- [ ] No carousel; one static hero
- [ ] One email signup on the page plus the exit-intent popup; nothing fires on load

**Conversion**

- [ ] Free-shipping bar reads from the theme setting and shows $35
- [ ] Cart drawer progress bar updates live
- [ ] Subscribe-and-save shows on consumable PDPs
- [ ] "Complete the routine" adds both items in one click
- [ ] Sticky add-to-cart appears on mobile PDP scroll
- [ ] Bundles appear in the Shop menu (second item) and on the homepage

**SEO / AEO**

- [ ] Exactly one H1 on every template (home, PDP, collection, hub, article, page)
- [ ] One Organization, one WebSite, one Product block per page (Rich Results Test clean)
- [ ] Product schema rating matches the visible Yotpo widget
- [ ] Every product image has alt text
- [ ] Thin pages (Section 4.4) output noindex
- [ ] Redirects in place (Section 4.3)
- [ ] Homepage title and meta updated; no emoji in meta descriptions; `og:image` is https
- [ ] 2 concern hubs and 2 ingredient hubs live with direct answer, table and FAQ schema
- [ ] Brand-facts page or llms.txt published

**Performance and accessibility**

- [ ] PSI mobile performance ≥ 80 on home, a PDP and a collection
- [ ] LCP < 2.5s, homepage transfer < 2.5MB, < 120 requests
- [ ] No Okendo, Loox, Stamped, Privy, Shogun or jQuery code loads
- [ ] Lighthouse accessibility ≥ 95; white-on-pink contrast failures gone

**Merchandising**

- [ ] No out-of-stock product appears in Bestsellers
- [ ] All homepage tiles link to the matching collection or hub

**Test plan with ESW**

- [ ] Preview link shared with ESW's team
- [ ] Test orders placed through checkout (one-time and subscription) and refunded
- [ ] Checked on iPhone Safari, Android Chrome and desktop Chrome
- [ ] Before/after PSI and Rich Results screenshots saved for the sign-off deck

---

## 14. References and open questions

**References (Eleven Signal artifacts, private until shared):**

- Audit doc (findings, impact model, sitemap): https://claude.ai/code/artifact/67eace9d-cced-4be6-ad43-5d3e6f22ce21
- Homepage + PDP mockups and style guide: https://claude.ai/artifact/6ifWB4e9YzTnWjCbQZuSQa
- Internal brief (punch list): https://claude.ai/code/artifact/a815495d-ed1f-4fb0-b868-7edc50453bd8
- Client deck: https://claude.ai/artifact/CtbBthJTRuZrne9N5W9WDJ

**Open questions for ESW:**

1. Collaborator access with Themes permission (and Apps, if we wire app blocks).
2. Gelica web font files and license for web use.
3. Which app powers subscriptions on the site today?
4. What does Aisle (`gotoaisle.com`) do, and is it still needed?
5. Approval to change the free-shipping threshold to $35 and move the free mask to a $35 gift tier.
6. Approval to delay the welcome popup and use one offer.
7. Who writes and approves hub and journal content, and on what schedule?
8. Is anyone else (agency, freelancer) editing the current theme? Coordinate before publishing.
