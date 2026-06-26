import type { Product, ProductQuery } from "./types";

export interface ProductRepository {
  list(query?: ProductQuery): Promise<Product[]>;
  bySlug(slug: string): Promise<Product | null>;
  byId(id: string): Promise<Product | null>;
}
