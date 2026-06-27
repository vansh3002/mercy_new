# Womania Storefront Codebase Index

This document provides a complete, itemized index of every file in the **Womania Storefront** codebase (located at `C:\Users\syedm\OneDrive\Desktop\Mercy\Mercy\website`), detail mapping what each file contains and its explicit function in the system.

---

## 📁 Root & Configuration Files

| File | Path | Description & Role |
| :--- | :--- | :--- |
| **`.eslintrc.json`** | [`.eslintrc.json`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/.eslintrc.json) | Linter configuration file extending Next.js' default ESLint rules (`next/core-web-vitals`). |
| **`.gitignore`** | [`.gitignore`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/.gitignore) | Configures git to ignore files like `node_modules`, `.next`, build logs, and environment variables. |
| **`next-env.d.ts`** | [`next-env.d.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/next-env.d.ts) | Auto-generated Next.js TypeScript declaration file that ensures Next.js types are loaded by the TS compiler. |
| **`next.config.mjs`** | [`next.config.mjs`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/next.config.mjs) | Next.js runtime configuration. Houses compiler options and optimization flags. |
| **`package.json`** | [`package.json`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/package.json) | Project manifest file defining node packages, engine constraints (`node >= 20`), and script commands (`dev`, `build`, `start`, `lint`). |
| **`package-lock.json`** | [`package-lock.json`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/package-lock.json) | Locked dependency tree defining exact versions of all installed npm modules. |
| **`postcss.config.mjs`** | [`postcss.config.mjs`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/postcss.config.mjs) | Configuration for PostCSS, loading Tailwind CSS and Autoprefixer during build compilation. |
| **`tsconfig.json`** | [`tsconfig.json`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/tsconfig.json) | Configures TypeScript compiler options, path alias mappings (`@/*` -> `./src/*`), and module resolution rules. |
| **`tailwind.config.ts`** | [`tailwind.config.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/tailwind.config.ts) | Customizes Tailwind's utility classes. Extends theme parameters (colors like `wine`, `gold`, `ink`, custom font families, animations, and box shadows). |
| **`README.md`** | [`README.md`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/README.md) | High-level quickstart guide, path lists, mock journey walkthrough, and database toggle guide. |
| **`IMPLEMENTATION.md`** | [`IMPLEMENTATION.md`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/IMPLEMENTATION.md) | Day-to-day operations manual detailing file drop locations, product schema fields, and ORM setup steps. |
| **`PROMPT.md`** | [`PROMPT.md`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/PROMPT.md) | The original structural design brief detailing the storefront aesthetics, performance, and user flow requirements. |

---

## 💾 Local Catalog Database

*   **[`data/products.json`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/data/products.json)**:
    Holds the complete array of catalog items (e.g., *Ivory Floral Kurta & Palazzo*, *Rose Pink Suit Set*). Each item defines properties like price, discount percentage, category collections, mood flags, stock levels, popularity scores, size lists, and image paths.

---

## 🗺️ App Router Pages & Styles (`src/app/`)

### Layout & Style Sheets

*   **[`globals.css`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/globals.css)**:
    Initializes Tailwind utility layers. Sets the root CSS variables for the color system, sets up text fonts (`Cormorant Garamond`, `Inter`), and specifies global layout configurations (such as safe bottom offsets for mobile devices).
*   **[`layout.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/layout.tsx)**:
    Root template component. Wraps the children with `BoutiqueHeader`, client-side `BottomNav`, and desktop `footer`. Hydrates custom Next.js Google Fonts and applies metadata declarations.
*   **[`not-found.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/not-found.tsx)**:
    Provides a stylized 404 fallback page matching the boutique design if a path is invalid.

### Page Routes

*   **[`page.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/page.tsx)**:
    Home page. Renders the top festive notice flashbar, a lookbook hero banner, mood category navigation tiles, and a preview of popular products.
*   **[`cart/page.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/cart/page.tsx)**:
    Shopping bag page. Retrieves the cart ID from cookies, pulls current bag items from state, builds the invoice calculations, and renders the `CartClient` UI.
*   **[`checkout/page.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/checkout/page.tsx)**:
    Checkout page. Validates the cart items state; redirects to `/cart` if empty. Renders address entries and payment selectors via `CheckoutClient`.
*   **[`collections/[mood]/page.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/collections/%5Bmood%5D/page.tsx)**:
    Dynamic mood landing page. Filters catalogs by dynamic URL parameters (`everyday`, `festive`, `light-wear`, `tea-time`) and outputs lists via `ProductList`.
*   **[`festive-edit/page.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/festive-edit/page.tsx)**:
    Festive product collection listing page (PLP) rendering the full shop catalog with multi-select filters.
*   **[`shop/page.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/shop/page.tsx)**:
    URL helper endpoint. Automatically redirects requests to `/festive-edit`.
*   **[`product/[slug]/page.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/product/%5Bslug%5D/page.tsx)**:
    Product Detail Page (PDP). Feeds item data to the client-side `PdpClient` and dynamically builds metadata titles and descriptions.
*   **[`orders/[id]/page.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/orders/%5Bid%5D/page.tsx)**:
    Purchase summary and order tracking page. Resolves placed order statistics, tracking milestones, customer addresses, and final price breakdowns.

---

## ⚡ Backend API Handlers (`src/app/api/`)

*   **[`api/products/route.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/api/products/route.ts)**:
    Handles `GET` requests to query catalog items. Filters results by collection, mood, price, and sorts by newest, cheapest, or popularity.
*   **[`api/products/[slug]/route.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/api/products/%5Bslug%5D/route.ts)**:
    Handles `GET` requests to resolve attributes of a single product matching the given slug.
*   **[`api/cart/route.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/api/cart/route.ts)**:
    `GET` resolves current session cart items. `POST` applies coupon discount codes (e.g., `WOMANIA100`).
*   **[`api/cart/items/route.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/api/cart/items/route.ts)**:
    `POST` appends a product id and size selection to the active cart mapping.
*   **[`api/cart/items/[id]/route.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/api/cart/items/%5Bid%5D/route.ts)**:
    `PATCH` modifies quantity targets. `DELETE` removes a specific item row from the cart.
*   **[`api/checkout/place/route.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/api/checkout/place/route.ts)**:
    `POST` validates the address fields, simulates payment processing latency, saves the order details, and clears the cart cookies.
*   **[`api/orders/[id]/route.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/app/api/orders/%5Bid%5D/route.ts)**:
    `GET` queries active status, billing details, and items of a placed order using its order ID.

---

## 🛠️ Domain Modules (`src/features/`)

### Products Module (`src/features/products/`)

*   **[`types.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/features/products/types.ts)**:
    TypeScript schemas for `Product`, `ProductImageSet`, `ProductQuery`, `Size` ('XS' to 'XXL'), `Mood`, `Collection`, and `SortKey`.
*   **[`repository.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/features/products/repository.ts)**:
    Interface defining contract methods (`list`, `bySlug`, `byId`) to enforce database implementation compatibility.
*   **[`mock-repository.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/features/products/mock-repository.ts)**:
    Interprets queries, filters, and sorts products from the local `products.json` file in-memory.
*   **[`db-repository.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/features/products/db-repository.ts)**:
    Database repository stub. Designed to throw explicit errors on invocation to remind developers to wire up database integrations like Prisma before switching `DATA_SOURCE=db`.

### Cart Module (`src/features/cart/`)

*   **[`types.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/features/cart/types.ts)**:
    Interfaces for raw data entities (`Cart`, `CartItem`) and display structures (`CartLine`, `CartView`).
*   **[`store.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/features/cart/store.ts)**:
    Maintains persistent cart instances. Enforces cart thresholds like the ₹999 free shipping mark, COD charges (₹30), and coupon deduction logic.
*   **[`view.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/features/cart/view.ts)**:
    Computes pricing calculations (subtotals, shipping additions, savings amounts, coupon deductions, items count, and free-shipping progress increments).

### Checkout Module (`src/features/checkout/`)

*   **[`types.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/features/checkout/types.ts)**:
    Interfaces for shipping address parameters and valid payment types (`UPI`, `CARD`, `COD`).

### Orders Module (`src/features/orders/`)

*   **[`types.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/features/orders/types.ts)**:
    Definitions for order data structures, tracking dates, item lists, and current tracking state options (`placed` | `tailored` | `out_for_delivery` | `delivered`).
*   **[`store.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/features/orders/store.ts)**:
    Maintains in-memory saved orders. Handles tracking step indices and order ID sequences starting at `WN-1042`.

---

## 🧰 General Libraries (`src/lib/`)

*   **[`data-source.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/lib/data-source.ts)**:
    Singleton class resolution factory that returns either the mock file repository or the Prisma database repository based on the active `DATA_SOURCE` environment variable.
*   **[`cart-cookie.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/lib/cart-cookie.ts)**:
    Server-side cookie manager. Reads or sets a secure `wm_cart` session identifier in HTTP-only cookies.
*   **[`cart-client.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/lib/cart-client.ts)**:
    Client-side fetch wrappers that component elements invoke to interact with backend cart APIs (adding items, changing counts, applying coupons, placing orders).
*   **[`format.ts`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/lib/format.ts)**:
    Utility functions formatting currency values into Indian Rupees format (e.g., `Rs. 2,599`), extracting product title initials, and calculating discount values.

---

## 🧩 UI Presentation Components (`src/components/`)

*   **[`BoutiqueHeader.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/BoutiqueHeader.tsx)**:
    Desktop and mobile header containing logo wordmarks, navigation links (Everyday, Festive, Tea Time), and quick cart indicators.
*   **[`BottomNav.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/BottomNav.tsx)**:
    Sticky navigation bar for mobile devices, offering rapid navigation between Home, Festive Edit, Wishlist, and Cart pages.
*   **[`FestiveFlashBar.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/FestiveFlashBar.tsx)**:
    Banner bar displayed at the top of the Home page, announcing festive shipping updates or current boutique highlights.
*   **[`LookbookHero.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/LookbookHero.tsx)**:
    Large banner widget for lookbook showcases. Includes background covers, typography overlays, and call-to-action buttons.
*   **[`MoodTile.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/MoodTile.tsx)**:
    Visual link cards on the home page grouping items under specific moods (Everyday, Festive, etc.) using grid cards.
*   **[`SectionLabel.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/SectionLabel.tsx)**:
    Small, spaced upper-case typographical utility used for category tags.
*   **[`GoldRule.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/GoldRule.tsx)**:
    Divider line rendered with a signature thin gradient.
*   **[`SafeImage.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/SafeImage.tsx)**:
    Next.js `<Image>` wrapper that catches loading issues or missing image files, gracefully falling back to a stylized cream placeholder featuring the product's initials.
*   **[`ProductPlaceholder.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/ProductPlaceholder.tsx)**:
    Renders placeholder squares with initials if product visual assets are unavailable.
*   **[`ProductCardBoutique.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/ProductCardBoutique.tsx)**:
    Renders individual product cards in grids, featuring price tags, discount badges, and quick-view selectors.
*   **[`ProductList.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/ProductList.tsx)**:
    Container layout for product listings, supporting search inputs, sorting parameters, and size filter sidebar drawers.
*   **[`SizeSelector.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/SizeSelector.tsx)**:
    Interactive size selector widget (XS to XXL) used on PDP sheets. Disables sizes that are out of stock.
*   **[`DualCTA.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/DualCTA.tsx)**:
    Combines 'Add to Bag' and 'Buy Now' buttons, supporting sticky scrolling transitions on mobile devices.
*   **[`PdpClient.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/PdpClient.tsx)**:
    Client layout page for PDP views. Controls visual slide selection galleries, interactive size widgets, description blocks, and bag adding triggers.
*   **[`CartClient.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/CartClient.tsx)**:
    Interactive cart checkout review layout. Handles coupon submission forms, shipping threshold progress indicators, and total calculations.
*   **[`CheckoutStepper.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/CheckoutStepper.tsx)**:
    Renders visual process indicators showing checkout stage progression (Bag -> Details -> Tracking).
*   **[`CheckoutClient.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/CheckoutClient.tsx)**:
    Form handler page for checkout entries, featuring address inputs, zipcode filters, payment choices, and submission flows.
*   **[`OrderTimeline.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/OrderTimeline.tsx)**:
    Order tracker indicator showing the order status (Placed -> Tailored -> Out for Delivery -> Delivered).
*   **[`OrderSummaryBox.tsx`](file:///C:/Users/syedm/OneDrive/Desktop/Mercy/Mercy/website/src/components/OrderSummaryBox.tsx)**:
    Side-aligned invoice details displaying subtotals, applied discount amounts, shipping charges, and final sums.
