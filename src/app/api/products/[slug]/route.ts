import { NextResponse } from "next/server";
import { productRepository } from "@/lib/data-source";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const repo = productRepository();
  const product = await repo.bySlug(params.slug);
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ product });
}
