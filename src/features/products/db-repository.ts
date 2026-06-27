import { prisma } from "@/lib/prisma";
import type { Product, ProductQuery, Mood, Collection, Size, ProductImageSet } from "./types";
import type { ProductRepository } from "./repository";

/**
 * Maps a Prisma Product row → storefront Product type.
 * The Prisma schema stores images and sizeInventory as JSON.
 */
function mapRow(row: {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  images: unknown;
  sizeInventory: unknown;
  pickupLocation: string | null;
  story: string | null;
  fabric: string | null;
  colorName: string | null;
  colorHex: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Product {
  const sizeInv = (row.sizeInventory ?? {}) as Record<string, number>;

  // Derive available sizes from sizeInventory keys, or fall back to a default set
  const sizes: Size[] = Object.keys(sizeInv).length > 0
    ? (Object.keys(sizeInv) as Size[])
    : ["S", "M", "L", "XL"];

  // Derive total stock from sizeInventory values
  const stock = Object.values(sizeInv).reduce((sum, qty) => sum + (qty as number), 0);

  // Derive mood and collection from slug segments (convention: "collection-mood-name")
  const mood = deriveMood(row.slug);
  const collection = deriveCollection(row.slug);

  const discountPct =
    row.discountPrice && row.price > 0
      ? Math.round(((row.price - row.discountPrice) / row.price) * 100)
      : 0;

  // Support both image array of strings and rich ProductImageSet JSON object
  let images: ProductImageSet;
  if (row.images && typeof row.images === "object" && !Array.isArray(row.images)) {
    const imgObj = row.images as any;
    images = {
      grid: imgObj.grid ?? "/products/placeholder.png",
      hero: imgObj.hero ?? imgObj.grid ?? "/products/placeholder.png",
      hover: imgObj.hover ?? undefined,
      pdp: Array.isArray(imgObj.pdp) ? imgObj.pdp : [imgObj.grid ?? "/products/placeholder.png"],
    };
  } else {
    const imagesArr = Array.isArray(row.images) ? (row.images as string[]) : [];
    images = {
      grid: imagesArr[0] ?? "/products/placeholder.png",
      hero: imagesArr[0] ?? "/products/placeholder.png",
      pdp: imagesArr.length > 0 ? imagesArr : ["/products/placeholder.png"],
    };
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.description?.split(".")[0] ?? "",
    collection,
    mood,
    price: row.discountPrice ?? row.price,
    mrp: row.price,
    discountPct,
    sizes,
    stock,
    popularity: 50,
    createdAt: row.createdAt.toISOString(),
    description: row.description ?? undefined,
    story: row.story ?? undefined,
    fabric: row.fabric ?? undefined,
    colorName: row.colorName ?? undefined,
    colorHex: row.colorHex ?? undefined,
    images,
  };
}

function deriveMood(slug: string): Mood {
  if (slug.includes("festive") || slug.includes("embroidered")) return "festive";
  if (slug.includes("tea") || slug.includes("tea-time")) return "tea-time";
  if (slug.includes("light")) return "light-wear";
  return "everyday";
}

function deriveCollection(slug: string): Collection {
  if (slug.includes("festive") || slug.includes("embroidered")) return "festive-edit";
  if (slug.includes("tea")) return "tea-time";
  if (slug.includes("light")) return "light-wear";
  return "everyday";
}

export class DbProductRepository implements ProductRepository {
  async list(query?: ProductQuery): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    let products = rows.map(mapRow);

    if (query?.collection) {
      products = products.filter((p) => p.collection === query.collection);
    }
    if (query?.mood) {
      products = products.filter((p) => p.mood === query.mood);
    }
    if (typeof query?.maxPrice === "number") {
      products = products.filter((p) => p.price <= query.maxPrice!);
    }
    if (typeof query?.minPrice === "number") {
      products = products.filter((p) => p.price >= query.minPrice!);
    }
    if (query?.size) {
      products = products.filter((p) => p.sizes.includes(query.size!));
    }

    switch (query?.sort) {
      case "new":
        products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "popular":
      default:
        products.sort((a, b) => b.popularity - a.popularity);
    }

    return products;
  }

  async bySlug(slug: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({ where: { slug, active: true } });
    return row ? mapRow(row) : null;
  }

  async byId(id: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? mapRow(row) : null;
  }
}
