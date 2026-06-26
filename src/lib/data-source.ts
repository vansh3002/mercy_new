import { MockProductRepository } from "@/features/products/mock-repository";
import { DbProductRepository } from "@/features/products/db-repository";
import type { ProductRepository } from "@/features/products/repository";

let singleton: ProductRepository | null = null;

export function productRepository(): ProductRepository {
  if (singleton) return singleton;
  const source = process.env.DATA_SOURCE ?? "mock";
  singleton = source === "db" ? new DbProductRepository() : new MockProductRepository();
  return singleton;
}
