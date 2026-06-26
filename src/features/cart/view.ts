import type { Cart, CartView, CartLine } from "./types";
import { cartConfig } from "./store";
import { productRepository } from "@/lib/data-source";

export async function buildCartView(cart: Cart): Promise<CartView> {
  const repo = productRepository();
  const lines: CartLine[] = [];
  for (const item of cart.items) {
    const product = await repo.byId(item.productId);
    if (!product) continue;
    lines.push({
      ...item,
      title: product.title,
      subtitle: product.subtitle,
      price: product.price,
      mrp: product.mrp,
      discountPct: product.discountPct,
      image: product.images.grid,
      slug: product.slug,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const mrpTotal = lines.reduce((sum, l) => sum + l.mrp * l.qty, 0);
  const productDiscount = Math.max(0, mrpTotal - subtotal);
  const couponDiscount = cart.coupon?.amount ?? 0;
  const discount = couponDiscount;
  const shipping = subtotal >= cartConfig.FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 49;
  const total = Math.max(0, subtotal - discount + shipping);
  const itemsCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const freeShippingRemaining = Math.max(0, cartConfig.FREE_SHIPPING_THRESHOLD - subtotal);

  return {
    id: cart.id,
    lines,
    coupon: cart.coupon,
    totals: {
      itemsCount,
      subtotal,
      mrpTotal,
      productDiscount,
      couponDiscount,
      discount,
      shipping,
      freeShippingThreshold: cartConfig.FREE_SHIPPING_THRESHOLD,
      freeShippingRemaining,
      total,
      youSave: productDiscount + couponDiscount,
    },
  };
}
