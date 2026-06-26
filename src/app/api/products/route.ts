import { NextResponse } from "next/server";
import { productRepository } from "@/lib/data-source";
import type { Collection, Mood, SortKey } from "@/features/products/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const repo = productRepository();
  const products = await repo.list({
    collection: (searchParams.get("collection") as Collection | null) ?? undefined,
    mood: (searchParams.get("mood") as Mood | null) ?? undefined,
    sort: (searchParams.get("sort") as SortKey | null) ?? undefined,
    maxPrice: searchParams.has("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
  });
  return NextResponse.json({ products });
}
