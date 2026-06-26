import { redirect } from "next/navigation";
import { getCartIdFromCookies } from "@/lib/cart-cookie";
import { getOrCreateCart } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";
import { CheckoutClient } from "@/components/CheckoutClient";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const id = getCartIdFromCookies();
  if (!id) redirect("/cart");
  const cart = await buildCartView(getOrCreateCart(id));
  if (cart.lines.length === 0) redirect("/cart");
  return <CheckoutClient cart={cart} />;
}
