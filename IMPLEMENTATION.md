# Implementation Notes

The day-to-day operating manual for the Womania storefront. For the full design brief see [`PROMPT.md`](./PROMPT.md).

---

## Where to drop new product images

All photos live under `public/products/`. Each subfolder has its own `README.md` with the exact spec, but in short:

| Image type        | Folder                          | Aspect | Recommended  | Filename                          |
|-------------------|---------------------------------|--------|--------------|-----------------------------------|
| PLP card / thumb  | `public/products/grid/`         | 3:4    | 800 × 1067   | `{slug}.webp`                     |
| PDP gallery       | `public/products/pdp/`          | 3:4    | 1200 × 1600  | `{slug}-01.webp`, `{slug}-02.webp`, … |
| Lookbook hero     | `public/products/hero/`         | 4:5    | 1600 × 2000  | `{slug}.webp` (only the home hero) |
| Mood tile         | `public/products/mood/`         | 1:1    | 1000 × 1000  | `everyday.webp`, `festive.webp`, `light-wear.webp`, `tea-time.webp` |
| Cart thumb (opt)  | `public/products/cart/`         | 3:4    | 440 × 560    | `{slug}.webp` — falls back to `grid/` |
| Collection banner | `public/products/collections/`  | 16:9   | 1600 × 900   | `festive-edit.webp`, etc.         |

Rules:
- Filename must equal the product's `slug` in `data/products.json`.
- Lowercase, hyphenated, no spaces or special characters.
- WebP preferred; PNG/JPG accepted.
- If a slot is empty the app renders a branded cream placeholder card with the product's initials — never a stock photo.

---

## How to add a new product

1. Pick a slug (lowercase, hyphenated). Example: `peach-floral-anarkali`.
2. Drop the grid photo into `public/products/grid/peach-floral-anarkali.webp`.
3. Add 2–5 PDP photos into `public/products/pdp/peach-floral-anarkali-01.webp` … `-NN.webp`.
4. Append an entry to `data/products.json`:

```json
{
  "id": "peach-floral-anarkali",
  "slug": "peach-floral-anarkali",
  "title": "Peach Floral Anarkali",
  "subtitle": "Hand block · Cotton · Festive",
  "collection": "festive-edit",
  "mood": "festive",
  "price": 2599,
  "mrp": 4799,
  "discountPct": 46,
  "tag": "New",
  "sizes": ["XS", "S", "M", "L", "XL"],
  "stock": 10,
  "popularity": 75,
  "createdAt": "2026-06-22T10:00:00.000Z",
  "description": "A few honest lines about the piece.",
  "images": {
    "grid": "/products/grid/peach-floral-anarkali.webp",
    "pdp": [
      "/products/pdp/peach-floral-anarkali-01.webp",
      "/products/pdp/peach-floral-anarkali-02.webp"
    ]
  }
}
```

5. Restart `npm run dev` (the catalog is cached at server startup).

### Field reference

- **`collection`** — one of `festive-edit` · `everyday` · `light-wear` · `tea-time`. Drives `/festive-edit` and `/collections/[mood]`.
- **`mood`** — same four values. Drives the home "Shop by Mood" tiles.
- **`discountPct`** — show gold `% OFF` badge when ≥ 10.
- **`popularity`** — integer used for the default "Popular" sort.
- **`createdAt`** — ISO date used for the "Newest" sort.
- **`stock`** — informational on PDP; not currently enforced at checkout.

---

## How to replace the logo

The header renders `public/brand/womania-logo.jpg` as an `<Image>`. To swap:

1. Drop the new file at `public/brand/womania-logo.jpg` (or `.png` / `.svg`).
2. If you change the file extension, update the `src` in `src/components/BoutiqueHeader.tsx`.
3. The header `<Image>` is set to `priority` and a fixed height; the new file should be a horizontal wordmark — square logos crop visually.

---

## Switch to a real database (`DATA_SOURCE=db`)

The repository pattern in `src/features/products/` is built for this swap.

1. Install Prisma (or the ORM of your choice):

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

2. Define a `Product` model in `prisma/schema.prisma` mirroring `src/features/products/types.ts` (`id`, `slug`, `title`, `collection`, `mood`, `price`, `mrp`, `discountPct`, `sizes` as `String[]`, `stock`, `popularity`, `createdAt`, `images` as JSON, etc.).
3. Implement `src/features/products/db-repository.ts`. The interface is already locked:

```ts
class DbProductRepository implements ProductRepository {
  async list(query?: ProductQuery): Promise<Product[]> { /* prisma.product.findMany(...) */ }
  async bySlug(slug: string): Promise<Product | null>  { /* prisma.product.findUnique(...) */ }
  async byId(id: string): Promise<Product | null>      { /* prisma.product.findUnique(...) */ }
}
```

4. Seed your DB from `data/products.json` (`prisma db seed`).
5. Flip `.env.local` to `DATA_SOURCE=db`. `src/lib/data-source.ts` will return the DB-backed repo automatically on the next boot.
6. The cart and orders stores in `src/features/cart/store.ts` and `src/features/orders/store.ts` are still in-memory. Either move them to the same DB or to a KV (Redis, Vercel KV) before going to production.

---

## Architecture cheat-sheet

```
src/
  app/
    page.tsx                   Home
    festive-edit/page.tsx      PLP
    shop/page.tsx              alias → /festive-edit
    collections/[mood]/page.tsx
    product/[slug]/page.tsx    PDP
    cart/page.tsx
    checkout/page.tsx
    orders/[id]/page.tsx
    api/
      products/route.ts
      products/[slug]/route.ts
      cart/route.ts
      cart/items/route.ts
      cart/items/[id]/route.ts
      checkout/place/route.ts
      orders/[id]/route.ts
  components/                  Signature boutique components (GoldRule, LookbookHero, MoodTile, ProductCardBoutique, …)
  features/
    products/                  types · repository · MockProductRepository · DbProductRepository (stub)
    cart/                      types · in-memory store · view builder
    checkout/                  types
    orders/                    types · in-memory store
  lib/
    data-source.ts             picks repository based on DATA_SOURCE
    cart-cookie.ts             httpOnly wm_cart cookie helpers
    cart-client.ts             browser-side cart API calls
    format.ts                  INR rupee formatting + helpers
data/products.json             seeded catalog (active data path)
public/brand/                  logo
public/products/               real product photography
```

---

## Coupons

The only valid coupon in mock is `WOMANIA100` → flat ₹100 off. Add new ones in `src/features/cart/store.ts` → `applyCoupon`.

## Free shipping

Threshold lives in `src/features/cart/store.ts` → `cartConfig.FREE_SHIPPING_THRESHOLD` (default ₹999). The cart shows a progress bar with remaining-to-free copy.

## COD fee

`cartConfig.COD_FEE` (₹30). Added on checkout when payment method = COD; surfaced in the summary and the **Place Order** button.

## Order IDs

Format: `WN-####`. Counter starts at `1042` (see `src/features/orders/store.ts`). Replace with a DB sequence when you move off the mock.
