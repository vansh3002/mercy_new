# Product Images — Upload Guide

Drop real product photos into the subfolder for their role.
**Never upload stock or placeholder images.** If a slot is empty, the app renders a branded cream placeholder card with product initials.

## Folder roles

| Folder         | Used on              | Recommended size        | Aspect | Notes |
|----------------|----------------------|-------------------------|--------|-------|
| `grid/`        | PLP cards, cart thumbs | 800 × 1067 px           | 3:4    | One image per product. **Required** for every product. |
| `hero/`        | Home Lookbook hero   | 1600 × 2000 px          | 4:5    | One editorial portrait. Only the “lookbook” product. |
| `pdp/`         | Product Detail Page  | 1200 × 1600 px          | 3:4    | 2–5 images per product. Filename: `{slug}-01.webp`, `{slug}-02.webp` … |
| `mood/`        | Home “Shop by Mood” tiles | 1000 × 1000 px      | 1:1    | Exactly 4 files: `everyday.webp`, `festive.webp`, `light-wear.webp`, `tea-time.webp`. |
| `cart/`        | Cart line-item thumbs (optional) | 440 × 560 px | 3:4    | Optional. If absent, the app falls back to `grid/{slug}.{ext}`. |
| `collections/` | Mood collection page banners (optional) | 1600 × 900 px | 16:9 | Optional. One per collection slug. |

## Naming rule

`{slug}.webp` — all lowercase, hyphenated, **must match the `slug` field in `data/products.json`**.

- WebP preferred. PNG and JPG accepted.
- For PDP: append `-NN` (zero-padded): `{slug}-01.webp`, `{slug}-02.webp`.
- No spaces, no uppercase, no special characters.

## Example

For a product with `"slug": "ivory-floral-kurta-palazzo"`:

```
public/products/grid/ivory-floral-kurta-palazzo.webp           ← required
public/products/hero/ivory-floral-kurta-palazzo.webp           ← only if hero product
public/products/pdp/ivory-floral-kurta-palazzo-01.webp         ← required for PDP
public/products/pdp/ivory-floral-kurta-palazzo-02.webp
public/products/pdp/ivory-floral-kurta-palazzo-03.webp
```

## Workflow to add a new product

1. Pick a slug (lowercase, hyphenated).
2. Drop the grid image into `grid/{slug}.webp`. This is the minimum to render a card.
3. Drop 2–5 PDP images into `pdp/{slug}-NN.webp`.
4. Add a matching entry to `data/products.json` (see `IMPLEMENTATION.md`).
5. Restart the dev server if the image was added while running.
