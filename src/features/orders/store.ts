import type { Order, OrderStatus } from "./types";

const orders = new Map<string, Order>();
let counter = 1041;

export function nextOrderId(): string {
  counter += 1;
  return `WN-${counter}`;
}

export function saveOrder(order: Order): void {
  orders.set(order.id, order);
}

export function getOrder(id: string): Order | null {
  return orders.get(id) ?? null;
}

export const STATUS_FLOW: OrderStatus[] = [
  "placed",
  "tailored",
  "out_for_delivery",
  "delivered",
];

export function statusIndex(s: OrderStatus): number {
  return STATUS_FLOW.indexOf(s);
}
