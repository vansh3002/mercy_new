import type { Product, ProductQuery } from "./types";
import type { ProductRepository } from "./repository";

/**
 * DbProductRepository — production DB-backed implementation.
 *
 * Intentionally stubbed. To activate:
 *   1. Add Prisma (or your ORM of choice) and define a `Product` model
 *      mirroring `src/features/products/types.ts`.
 *   2. Implement the methods below using that ORM.
 *   3. Set `DATA_SOURCE=db` in `.env.local`. `lib/data-source.ts`
 *      will then return this repository instead of the mock one.
 *
 * Until then, every call throws so the swap is loud and obvious.
 */
export class DbProductRepository implements ProductRepository {
  async list(_query?: ProductQuery): Promise<Product[]> {
    throw new Error(
      "DbProductRepository.list not implemented. See src/features/products/db-repository.ts.",
    );
  }
  async bySlug(_slug: string): Promise<Product | null> {
    throw new Error(
      "DbProductRepository.bySlug not implemented. See src/features/products/db-repository.ts.",
    );
  }
  async byId(_id: string): Promise<Product | null> {
    throw new Error(
      "DbProductRepository.byId not implemented. See src/features/products/db-repository.ts.",
    );
  }
}
