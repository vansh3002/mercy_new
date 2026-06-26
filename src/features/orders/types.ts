import type { Address, PaymentMethod } from "@/features/checkout/types";
import type { CartLine } from "@/features/cart/types";

export type OrderStatus = "placed" | "tailored" | "out_for_delivery" | "delivered";

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  lines: CartLine[];
  address: Address;
  paymentMethod: PaymentMethod;
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    codFee: number;
    total: number;
    youSave: number;
  };
  etaLabel: string;
}
