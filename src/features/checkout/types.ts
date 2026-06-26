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

export interface PlaceOrderInput {
  address: Address;
  paymentMethod: PaymentMethod;
}
