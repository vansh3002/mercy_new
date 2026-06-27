import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productRepository } from "@/lib/data-source";

// ─── GET /api/products/[slug] ────────────────────────────────────────────────
// Public: fetch a single product by its URL slug.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const repo = productRepository();
  const product = await repo.bySlug(slug);
  if (!product) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, product });
}

// ─── PUT /api/products/[slug] ────────────────────────────────────────────────
// Admin: update an existing product by its ID (passed in the slug segment).
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: id } = await params;
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

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.discountPrice !== undefined && { discountPrice: body.discountPrice }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.sizeInventory !== undefined && { sizeInventory: body.sizeInventory }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.story !== undefined && { story: body.story }),
        ...(body.fabric !== undefined && { fabric: body.fabric }),
        ...(body.colorName !== undefined && { colorName: body.colorName }),
        ...(body.colorHex !== undefined && { colorHex: body.colorHex }),
      },
    });
    return NextResponse.json({ success: true, product });
  } catch {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
}

// ─── DELETE /api/products/[slug] ─────────────────────────────────────────────
// Admin: permanently remove a product by its ID.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
}
