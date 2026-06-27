import { NextResponse } from "next/server";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { productRepository } from "@/lib/data-source";
import type { Collection, Mood, SortKey } from "@/features/products/types";

// ─── GET /api/products ──────────────────────────────────────────────────────
// Public: returns all active products with optional filter/sort query params.
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
  return NextResponse.json({ success: true, products });
}

// ─── POST /api/products ─────────────────────────────────────────────────────
// Admin: create a new product. Auto-generates a URL slug from title.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
    price?: number;
    discountPrice?: number;
    images?: unknown;
    sizeInventory?: Record<string, number>;
    active?: boolean;
    story?: string;
    fabric?: string;
    colorName?: string;
    colorHex?: string;
  };

  if (!body.title || typeof body.price !== "number") {
    return NextResponse.json(
      { success: false, error: "title and price are required" },
      { status: 400 },
    );
  }

  const slug = slugify(body.title, { lower: true, strict: true });

  // Guard against duplicate slugs
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: `slug "${slug}" already exists` },
      { status: 400 },
    );
  }

  const product = await prisma.product.create({
    data: {
      slug,
      title: body.title,
      description: body.description ?? null,
      price: body.price,
      discountPrice: body.discountPrice ?? null,
      images: body.images ?? {},
      sizeInventory: body.sizeInventory ?? {},
      active: body.active ?? true,
      story: body.story ?? null,
      fabric: body.fabric ?? null,
      colorName: body.colorName ?? null,
      colorHex: body.colorHex ?? null,
    },
  });

  return NextResponse.json({ success: true, product }, { status: 201 });
}
