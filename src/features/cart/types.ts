import type { Size } from "@/features/products/types";

export interface CartItem {
  id: string;
  productId: string;
  size: Size;
  qty: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  coupon?: { code: string; amount: number };
  updatedAt: string;
}

export interface CartLine extends CartItem {
  title: string;
  subtitle: string;
  price: number;
  mrp: number;
  discountPct: number;
  image: string;
  slug: string;
}

export interface CartView {
  id: string;
  lines: CartLine[];
  coupon?: { code: string; amount: number };
  totals: {
    itemsCount: number;
    subtotal: number;
    mrpTotal: number;
    productDiscount: number;
    couponDiscount: number;
    discount: number;
    shipping: number;
    freeShippingThreshold: number;
    freeShippingRemaining: number;
    total: number;
    youSave: number;
  };
}
