import { promises as fs } from "node:fs";
import path from "node:path";
import type { Product, ProductQuery } from "./types";
import type { ProductRepository } from "./repository";

let cached: Product[] | null = null;

async function loadCatalog(): Promise<Product[]> {
  if (cached) return cached;
  const file = path.join(process.cwd(), "data", "products.json");
  const raw = await fs.readFile(file, "utf8");
  const parsed = JSON.parse(raw) as Product[];
  cached = parsed;
  return parsed;
}

function applyQuery(items: Product[], q: ProductQuery = {}): Product[] {
  let out = items.slice();
  if (q.collection) out = out.filter((p) => p.collection === q.collection);
  if (q.mood) out = out.filter((p) => p.mood === q.mood);
  if (typeof q.maxPrice === "number") out = out.filter((p) => p.price <= q.maxPrice!);
  if (typeof q.minPrice === "number") out = out.filter((p) => p.price >= q.minPrice!);
  if (q.size) out = out.filter((p) => p.sizes.includes(q.size!));

  switch (q.sort) {
    case "new":
      out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      out.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      out.sort((a, b) => b.price - a.price);
      break;
    case "popular":
    default:
      out.sort((a, b) => b.popularity - a.popularity);
  }
  return out;
}

export class MockProductRepository implements ProductRepository {
  async list(query?: ProductQuery): Promise<Product[]> {
    const items = await loadCatalog();
    return applyQuery(items, query);
  }
  async bySlug(slug: string): Promise<Product | null> {
    const items = await loadCatalog();
    return items.find((p) => p.slug === slug) ?? null;
  }
  async byId(id: string): Promise<Product | null> {
    const items = await loadCatalog();
    return items.find((p) => p.id === id) ?? null;
  }
}
