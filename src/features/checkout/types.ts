export interface Address {
  id?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  tag?: "HOME" | "WORK" | "OTHER";
}

export type PaymentMethod = "UPI" | "CARD" | "COD";

import type { CartView } from "@/features/cart/types";

export interface PlaceOrderInput {
  address: Address;
  paymentMethod: PaymentMethod;
  /** Client-side cart snapshot — sent as a fallback when the in-memory store is stale */
  cartSnapshot?: CartView;
}
