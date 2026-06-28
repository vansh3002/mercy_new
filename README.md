# Womania Storefront

Premium D2C boutique fashion storefront for **Womania** (`womania.store.in`). Built with Next.js 14 (App Router), TypeScript, Tailwind, and a swappable mock data layer.

The full brief lives in [`PROMPT.md`](./PROMPT.md). The day-to-day "how do I…?" answers live in [`IMPLEMENTATION.md`](./IMPLEMENTATION.md).

## Quickstart

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # next lint
```

Requires **Node 20+**.

## Routes

| Path                       | Screen          |
|----------------------------|-----------------|
| `/`                        | Home (Lookbook hero + Shop by Mood) |
| `/festive-edit`            | PLP ,Festive Edit (alias: `/shop`) |
| `/collections/[mood]`      | Mood collections (`everyday` · `festive` · `light-wear` · `tea-time`) |
| `/product/[slug]`          | PDP with gallery, size, sticky CTA |
| `/cart`                    | My Bag |
| `/checkout`                | Checkout (mock ,no real gateway) |
| `/orders/[id]`             | Order tracking |

## End-to-end mock journey

1. Open `/` and browse the lookbook + mood tiles.
2. Hit `/festive-edit`, filter or sort.
3. Open any product → choose size → **Add to bag** or **Buy now**.
4. Review `/cart`, optionally apply coupon `WOMANIA100` (₹100 off).
5. Continue to `/checkout`, pick a payment method (UPI/Card/COD).
6. Submit ,you land on `/orders/WN-####` with the order timeline.

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- Lucide React icons · Framer Motion (restrained transitions only)
- Mock data via `MockProductRepository` reading `data/products.json`
- Cookie-keyed cart (`wm_cart`) backed by an in-memory mock store

## Data switch

`.env.local`:

```
NEXT_PUBLIC_STORE_URL=womania.store.in
DATA_SOURCE=mock   # change to "db" once DbProductRepository is implemented
```

When you flip `DATA_SOURCE=db`, every product call throws by design until you wire a real DB (see `IMPLEMENTATION.md` → "Switch to a real database").

## Brand assets

- Logo: `public/brand/womania-logo.jpg` ,rendered as an image in the header, never as text.
- Real product photos: `public/products/grid/{slug}.{ext}` ,see `public/products/README.md`.

## Constraints

This app does **not** include an admin/CMS, a real payment gateway, or any Owncomm/Mercy branding on the storefront.
