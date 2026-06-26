# Womania Storefront — Build Brief

> Final, single source of truth. Hand this file to the engineer or agent. Everything outside it is reference only.

---

## 0. Role & objective

You are a senior full-stack + UI engineer. Build a production-quality D2C ecommerce storefront for the boutique fashion brand **Womania** (`womania.store.in`). Ship the full mobile + desktop journey running on mock data in a single repo.

The visual direction is locked: **Modern Boutique Fashion**, rendered at `preview-thumbs/mercy/slide-05.png` (inspired by *Wishful by W · Rangita · Style Jaipur*). Mobile must visually match the six phone mockups on that slide. Desktop is an intentional expansion of the same design language, **not** a stretched mobile layout.

> ⚠️ **Brand name check (please confirm):** The brief says `Womania`. The logo file at `public/brand/womania-logo.jpg` reads **`Womaniya`**. Treat `Womania` as canonical for code, copy, and metadata unless told otherwise. The header always renders the logo image — never the brand name as text — so a wordmark mismatch is invisible to the user but matters for SEO, alt text, and metadata.

---

## 1. Non-negotiables

1. Brand name is **Womania** in all code, copy, metadata, and env. Never **Mercy**. Tagline: *Womania — by Mercy* may appear once in footer/about copy only.
2. Header renders `public/brand/womania-logo.jpg` (or `.svg`/`.png` if present). **Never** type the brand name as text in the header.
3. Only real product photos. No stock, no Unsplash, no placeholders from third parties. If a product image is missing, render a branded cream placeholder card with the product's initials.
4. **Mobile-first**, fully supported on Android + iOS Safari. Add intentional desktop layouts at `lg:` (≥1024px).
5. Frontend works end-to-end with mock data on day one. Backend is stubbed but architected so a real DB plugs in later without rewriting pages.
6. Boutique scale: 60–100 products. No mega menus, no marketplace-grade filters.
7. Before reporting done, search the repo for `mercy`/`MERCY`/`owncomm` — none must appear in shipped code, metadata, or storefront copy.

---

## 2. Tech stack

- Next.js 14+ (App Router) · TypeScript (strict) · Tailwind CSS
- `next/image` for **every** product photo · `next/font` for fonts
- Framer Motion for restrained transitions only (no gimmicks)
- Lucide React for icons (replaces emoji from the mockups)
- Mock data layer via a typed Repository pattern (see §6)
- Node 20+ · no external paid services required to run locally

---

## 3. Design system (locked — derived from `slide-05.png`)

### Tokens — wire into `tailwind.config.ts` + `globals.css`

```
--bg:          #F6ECE2   /* warm cream page background */
--surface:     #FFFBF6   /* card / sheet */
--surface-2:   #EEDDCB   /* summary / muted block */
--line:        #DBC4AA   /* hairlines, dividers */
--text:        #3A121E   /* deep wine-brown ink */
--text-dim:    #734452
--text-faint:  #A98691
--accent:      #6E2230   /* WINE — primary CTAs, brand */
--accent-2:    #C99957   /* GOLD — badges, rules, sale chips */
--on-accent:   #FFFBF6
--success:     #4F7A3E
--sale:        #C53D4F
```

### Typography

- **Display / headings** → serif: **Cormorant Garamond** (700) or **Playfair Display**. Fallback: `Cambria, "Times New Roman", serif`.
- **Body / UI** → **Inter** (400 / 500 / 600).
- **Section labels** → small-caps + tracking `0.18em`, uppercase (e.g. `FESTIVE EDIT`, `SHOP BY MOOD`, `DELIVERY ADDRESS`).

### Signature components — must exist, must be reused

| Component               | Purpose |
|-------------------------|---------|
| `<GoldRule>`            | Thin gold line with a centered diamond. Section divider. |
| `<FestiveFlashBar>`     | Wine pill bar at top of home: `FESTIVE EDIT · UPTO 50% OFF`. |
| `<LookbookHero>`        | Editorial portrait + bottom-left cream overlay card: eyebrow `FW26 LOOKBOOK` → serif title `Festive in Bloom` → muted subtitle → wine circular arrow CTA. |
| `<MoodTile>`            | Square photo tile with dark bottom gradient + tracked white label (`EVERYDAY` · `FESTIVE` · `LIGHT WEAR` · `TEA TIME`). |
| `<ProductCardBoutique>` | Portrait image, gold `% OFF` badge top-left, heart top-right, serif title, dim subtitle, price + strikethrough MRP, size hints `S M L XL`. |
| `<SizeSelector>`        | Flat squares XS…XXL, wine fill on selected. |
| `<DualCTA>`             | Outline-wine `ADD TO BAG` + solid-wine `BUY NOW`. Sticky on mobile PDP, inline on desktop. |
| `<OrderSummaryBox>`     | Subtotal · Discount · Shipping · Total. Total in wine, serif. |
| `<CheckoutStepper>`     | `BAG · ADDRESS · PAY` with wine underline on the active step. |
| `<OrderTimeline>`       | Vertical stepper: Order placed → Tailored & QC done → Out for delivery → Delivered. |
| `<BoutiqueHeader>`      | Hamburger left · centered logo image · wishlist + bag right. |

### Iconography

Replace any emoji from the mockups (♡, ◆, →) with Lucide icons (`Heart`, `Diamond`, `ArrowRight`) sized 16–20px.

---

## 4. Information architecture

| Route                       | Screen          | Mobile                          | Desktop (`lg:`)                                  |
|-----------------------------|-----------------|---------------------------------|--------------------------------------------------|
| `/`                         | Home            | Single column                   | Lookbook hero 100% width; mood tiles 4-up        |
| `/shop` (alias `/festive-edit`) | PLP         | 2-col grid                      | Left filter rail + 3–4 col grid                  |
| `/product/[slug]`           | PDP             | Sticky bottom dual CTA          | Gallery left 55% · details right 45%             |
| `/cart`                     | My Bag          | Stacked                         | Items left · sticky summary right                |
| `/checkout`                 | Checkout        | Stepper stacked                 | Stepper top · 2-col form + summary               |
| `/orders/[id]`              | Order tracking  | Timeline vertical               | Timeline + order card side-by-side               |
| `/collections/[mood]`       | Mood collection | 2-col grid                      | Grid with breadcrumb                             |

- **Mobile shell:** top `<BoutiqueHeader>`, optional bottom nav (Home · Shop · Bag · Orders).
- **Desktop shell:** top `<BoutiqueHeader>` only.

---

## 5. Screen-by-screen acceptance (compare against `preview-thumbs/mercy/slide-05.png`)

**Home**
- `<FestiveFlashBar>` flush to top of content
- `<LookbookHero>` with overlay card (`FW26 LOOKBOOK` → `Festive in Bloom` → subtitle → circular wine arrow)
- `SHOP BY MOOD` eyebrow → serif `Curated Collections` → `<GoldRule>` → 2×2 mood tiles

**Festive Edit (PLP)**
- Header: `← FESTIVE EDIT` centered serif + subtitle `26 styles · Hand-curated`
- Filter pill (`≡ FILTER`) + sort pill (`POPULAR ↓`)
- 2-col grid of `<ProductCardBoutique>` with gold % OFF, heart, MRP strike, size hint

**PDP**
- Hero photo + gold `% OFF` ribbon top-left + carousel dots
- `FESTIVE COLLECTION` eyebrow → centered serif title → `<GoldRule>` → centered wine price → `MRP · Save Rs. X`
- `SIZE GUIDE →` row → flat size boxes
- Sticky `<DualCTA>` on mobile only

**My Bag**
- Header `MY BAG` + `N items · ready for checkout`
- Each line: 110×140 thumb, title, subtitle, `Size M · Qty 1`, price, MRP strike, gold `YOU SAVE Rs. X` chip, `×` remove
- `Apply offer` row with `VIEW ALL →`
- `<OrderSummaryBox>` (Subtotal · Discount · Shipping · Total)
- Full-width wine `PROCEED TO CHECKOUT`

**Checkout**
- `<CheckoutStepper>` — Address active
- Delivery address card (`EDIT` link, `HOME` tag)
- Collapsed order preview (3 thumbnails + `N items` + `Total Rs. X` + `→`)
- `PAYMENT METHOD` → UPI · Card · COD (Rs. 30 fee). Selected = wine border + filled radio
- Wine `PLACE ORDER · Rs. X,XXX`

**Order tracking**
- Header `ORDER WN-1042` + `Confirmed Mon · 14 Jun`
- `<GoldRule>`
- Hero card: 96×106 thumb + product title + ETA + `VIEW INVOICE`
- `<OrderTimeline>`: Order placed ✓ → Tailored & QC done ✓ → Out for delivery (current, wine) → Delivered

---

## 6. Responsive rules

- **Mobile (default)** — match the phone mockups closely. Sticky CTAs where shown. iOS safe-area padding (`env(safe-area-inset-bottom)`).
- **Tablet (`md:`, ≥768px)** — 3-col PLP grid; cart summary may stay inline below items.
- **Desktop (`lg:`, ≥1024px)** — `max-width: 1280px`, centered with generous gutters.
  - PLP gets a left filter sidebar (Size · Price · Collection · Mood).
  - PDP becomes 2-col (gallery left, sticky details right). `<DualCTA>` is no longer sticky.
  - Cart + Checkout become 2-col (content left, sticky summary right).

---

## 7. Backend architecture (stub now, swappable later)

```
src/
  app/                          # Next.js routes (App Router)
  components/                   # UI primitives + boutique components
  features/
    products/
      types.ts                  # Product, Variant, ImageSet
      repository.ts             # interface
      mock-repository.ts        # JSON-backed (active)
      db-repository.ts          # Prisma-backed (stub, throws "not implemented")
    cart/
    checkout/
    orders/
  lib/
    data-source.ts              # picks repo based on env DATA_SOURCE=mock|db
  app/api/
    products/route.ts
    products/[slug]/route.ts
    cart/route.ts
    cart/items/route.ts
    cart/items/[id]/route.ts
    checkout/place/route.ts
    orders/[id]/route.ts
data/
  products.json                 # seeded catalog (already-seeded with 5 real products — see §8)
public/
  brand/
    womania-logo.jpg            # already present
    favicon.ico                 # add when available
  products/
    grid/                       # PLP cards (3:4)              ← real photos live here
    hero/                       # lookbook hero (4:5)
    pdp/                        # PDP gallery (3:4, multi)
    mood/                       # 4 mood-tile backgrounds (1:1)
    cart/                       # optional cart thumbs
    collections/                # optional collection banners
```

### API contracts (Next.js Route Handlers — JSON only, mock now)

```
GET    /api/products?collection=&mood=&sort=&maxPrice=
GET    /api/products/[slug]
GET    /api/cart                    # cookie-keyed cart, mock store
POST   /api/cart/items              { productId, size, qty }
PATCH  /api/cart/items/[id]         { qty }
DELETE /api/cart/items/[id]
POST   /api/checkout/place          { address, paymentMethod } → { orderId }
GET    /api/orders/[id]
```

- Cart persistence: HTTP-only cookie `wm_cart` holding the cart id; server-side mock store keyed by that id.
- Order IDs use `WN-####` format (e.g. `WN-1042`).
- Mock checkout always returns success after a ~600 ms simulated delay.

### Repository pattern (TypeScript)

```ts
export interface ProductRepository {
  list(query: ProductQuery): Promise<Product[]>;
  bySlug(slug: string): Promise<Product | null>;
}
// MockProductRepository  → reads data/products.json   (active)
// DbProductRepository    → stubbed, throws            (document swap in IMPLEMENTATION.md)
```

Toggle via env: `DATA_SOURCE=mock` (default) or `DATA_SOURCE=db`.

---

## 8. Product catalog

### Schema — `data/products.json`

```json
{
  "id": "ivory-floral-kurta-palazzo",
  "slug": "ivory-floral-kurta-palazzo",
  "title": "Ivory Floral Kurta & Palazzo",
  "subtitle": "Hand block · Cotton · Festive",
  "collection": "festive-edit",
  "mood": "festive",
  "price": 2299,
  "mrp": 4499,
  "discountPct": 49,
  "tag": "Festive",
  "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "stock": 12,
  "images": {
    "grid": "/products/grid/ivory-floral-kurta-palazzo.png",
    "hero": "/products/hero/ivory-floral-kurta-palazzo.webp",
    "pdp":  [
      "/products/pdp/ivory-floral-kurta-palazzo-01.webp",
      "/products/pdp/ivory-floral-kurta-palazzo-02.webp"
    ]
  }
}
```

**Naming rule:** `{slug}.webp` — lowercase, hyphenated. PDP files use `{slug}-NN.webp`.

### Seed catalog — 5 real products already on disk

Use these as the initial entries in `data/products.json`. Image extensions are `.png` for the first delivery; if you later convert to `.webp`, update the JSON paths too.

| slug                              | title                          | mood     | collection      | grid image (already on disk)                          |
|-----------------------------------|--------------------------------|----------|-----------------|-------------------------------------------------------|
| `rose-pink-chikan-tunic`          | Rose Pink Chikan Tunic         | everyday | festive-edit    | `public/products/grid/rose-pink-chikan-tunic.png`     |
| `crimson-embroidered-kurta`       | Crimson Embroidered Short Kurta| festive  | festive-edit    | `public/products/grid/crimson-embroidered-kurta.png`  |
| `sage-green-tea-dress`            | Sage Green Tea Dress           | tea-time | everyday        | `public/products/grid/sage-green-tea-dress.png`       |
| `ivory-floral-kurta-palazzo`      | Ivory Floral Kurta & Palazzo   | festive  | festive-edit    | `public/products/grid/ivory-floral-kurta-palazzo.png` |
| `rose-pink-suit-set`              | Rose Pink Suit Set             | festive  | festive-edit    | `public/products/grid/rose-pink-suit-set.png`         |

> If you can replicate the grid image into `pdp/{slug}-01.png` until proper PDP photography is added, do so — but **do not duplicate the file on disk**; reference the same path in JSON or copy at build time only if necessary.

---

## 9. Where to upload real product photos

All photos live under `public/products/`. Each subfolder has a `README.md` with the exact spec.

| Image type          | Folder                       | Aspect | Recommended | Required? |
|---------------------|------------------------------|--------|-------------|-----------|
| PLP card / thumb    | `public/products/grid/`      | 3:4    | 800 × 1067  | **Yes**, for every product |
| PDP gallery         | `public/products/pdp/`       | 3:4    | 1200 × 1600 | Yes (2–5 per product, `{slug}-NN.webp`) |
| Lookbook hero       | `public/products/hero/`      | 4:5    | 1600 × 2000 | Only for the home hero |
| Mood tiles (×4)     | `public/products/mood/`      | 1:1    | 1000 × 1000 | Yes — fixed names: `everyday.webp`, `festive.webp`, `light-wear.webp`, `tea-time.webp` |
| Cart line thumb     | `public/products/cart/`      | 3:4    | 440 × 560   | Optional (falls back to `grid/`) |
| Collection banner   | `public/products/collections/` | 16:9 | 1600 × 900  | Optional |

**Rules**
- Filename must equal the product's `slug` (lowercase, hyphenated). PDP appends `-NN`.
- Only WebP / PNG / JPG. No SVG for photos.
- If a slot is empty, the app renders the branded cream placeholder card — never a third-party stock photo.

---

## 10. Business rules

- Currency: **INR**, formatted `Rs. 2,299` (Indian grouping).
- MRP strikethrough next to price; show `Save Rs. X` when discounted.
- Gold `% OFF` badge shown only when `discountPct >= 10`.
- Free shipping threshold: **Rs. 999**. Cart shows a progress bar with remaining-to-free copy.
- COD adds **Rs. 30** fee, surfaced in checkout summary and the PLACE ORDER button.
- Coupon stub: `WOMANIA100` → flat ₹100 off (server returns mock discount).
- Collections: `festive-edit`, `everyday`, `light-wear`, `tea-time`.
- Sort options: `popular`, `new`, `price-asc`, `price-desc`.

---

## 11. Quality bar

- Lighthouse mobile: **Performance ≥ 85**, **Accessibility ≥ 95**.
- No layout shift on product images (explicit width/height via `next/image`).
- All interactive elements keyboard-focusable with visible focus ring (wine, 2px).
- All icon-only buttons have `aria-label`.
- Color contrast AA on body text and CTAs.
- No console errors or warnings in production build.

---

## 12. Env & run

`.env.local`
```
NEXT_PUBLIC_STORE_URL=womania.store.in
DATA_SOURCE=mock
```

Scripts
```
npm install
npm run dev      # localhost:3000
npm run build
npm run start
npm run lint
```

---

## 13. Deliverables (definition of done)

1. Runnable app on `npm run dev` — full journey works on mock data: browse → PLP → PDP → add to bag → checkout → order page.
2. All 7 routes implemented and visually match `slide-05.png` mockups on mobile (390 px viewport).
3. Desktop layouts at ≥1024 px are intentional per §6 (not stretched).
4. Folder structure under `public/` and `data/` matches §7–§8 exactly.
5. `MockProductRepository` reading from `data/products.json` is the only active data path; `DbProductRepository` stub exists with TODOs.
6. `IMPLEMENTATION.md` at repo root documenting:
   - Where to drop new product images (point to `public/products/README.md`).
   - How to add a product to `products.json`.
   - How to replace the logo.
   - How to switch `DATA_SOURCE=db` and what to implement.
7. `README.md` quickstart.

---

## 14. Constraints

- Do **not** type the brand name as text in the header — use the logo image.
- Do **not** name anything "Mercy" or "Owncomm" in code, copy, metadata, or env. Run a final grep to confirm.
- Do **not** use stock photography. If `public/products/**` is empty for a product, render the branded placeholder.
- Do **not** build admin/CMS.
- Do **not** introduce a real payment gateway. Checkout is mock.
- Do **not** mention Owncomm anywhere on the storefront.

---

## 15. Execution order

1. Confirm brief, scaffold Next.js 14 + Tailwind + TS.
2. Wire design tokens into `tailwind.config.ts` and `globals.css`.
3. Verify folder tree from §7 exists. Image subfolders already exist with READMEs — do not delete them.
4. Build shared primitives (`<GoldRule>`, `<BoutiqueHeader>`, `<ProductCardBoutique>`, …).
5. Implement routes in this order: Home → PLP → PDP → Cart → Checkout → Order tracking.
6. Add desktop breakpoints per §6.
7. Mock API routes + cookie cart.
8. Seed `data/products.json` with the 5 real products in §8.
9. Write `IMPLEMENTATION.md` + `README.md`.
10. Self-review against the §13 checklist before reporting done.

---

## 16. What the user has already provided

These assets are on disk now — use them, don't recreate them:

- `public/brand/womania-logo.jpg` — logo (header source).
- `public/products/grid/rose-pink-chikan-tunic.png`
- `public/products/grid/crimson-embroidered-kurta.png`
- `public/products/grid/sage-green-tea-dress.png`
- `public/products/grid/ivory-floral-kurta-palazzo.png`
- `public/products/grid/rose-pink-suit-set.png`
- `preview-thumbs/mercy/slide-05.png` — **the** visual reference. Not shipped with the app; keep at repo root, gitignore from `public/`.

Anything still missing (lookbook hero, mood tiles, PDP secondary shots, favicon) — scaffold with the branded placeholder per §14 and continue. Do not block on inputs.

---

## 17. Open question for the user (please confirm before shipping)

- The brand name in the brief is **Womania**; the supplied logo wordmark reads **Womaniya**. Confirm which is the official brand and, if needed, supply a replacement logo so the wordmark and `<title>` agree. Until then, code, copy, and metadata use **Womania**.

Begin.
