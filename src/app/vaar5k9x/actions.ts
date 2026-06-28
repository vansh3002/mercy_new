"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

// Revalidates all public-facing pages that depend on product/order data
function revalidateAll(productSlug?: string) {
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/festive-edit");
  revalidatePath("/cart");
  if (productSlug) revalidatePath(`/product/${productSlug}`);
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function adminUpdateOrderStatus(id: string, orderStatus: string, paymentStatus?: string) {
  const data: Record<string, unknown> = { orderStatus };
  if (paymentStatus) data.paymentStatus = paymentStatus;
  await prisma.order.update({ where: { id }, data });
  revalidatePath(`/orders/${id}`);
  revalidatePath("/vaar5k9x/orders");
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function adminToggleActive(id: string, active: boolean) {
  const product = await prisma.product.update({ where: { id }, data: { active } });
  revalidateAll(product.slug);
}

export async function adminDeleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  await prisma.product.delete({ where: { id } });
  revalidateAll(product?.slug);
}

export async function adminUpdateInventory(id: string, sizeInventory: Record<string, number>) {
  const product = await prisma.product.update({ where: { id }, data: { sizeInventory } });
  revalidateAll(product.slug);
}

export async function adminSaveProduct(id: string, data: {
  title: string;
  description: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  sizeInventory: Record<string, number>;
  story: string;
  fabric: string;
  colorName: string;
  colorHex: string;
  active: boolean;
}) {
  const product = await prisma.product.update({ where: { id }, data });
  revalidateAll(product.slug);
  return { success: true };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function adminResolveQuery(id: string) {
  await prisma.customerQuery.update({ where: { id }, data: { status: "RESOLVED" } });
  revalidatePath("/vaar5k9x/queries");
}

export async function adminCreateProduct(data: {
  title: string;
  description: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  sizeInventory: Record<string, number>;
  story: string;
  fabric: string;
  colorName: string;
  colorHex: string;
  active: boolean;
}) {
  const slug = slugify(data.title, { lower: true, strict: true });
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw new Error(`Product with slug "${slug}" already exists`);

  const product = await prisma.product.create({ data: { ...data, slug } });
  revalidateAll(product.slug);
  return { success: true, id: product.id };
}
