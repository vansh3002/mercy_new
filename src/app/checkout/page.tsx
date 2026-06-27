import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCartIdAsync } from "@/lib/cart-cookie";
import { getOrCreateCart } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";
import { CheckoutClient } from "@/components/CheckoutClient";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const id = await getCartIdAsync();
  if (!id) redirect("/cart");

  const cart = await getOrCreateCart(id);
  const view = await buildCartView(cart);
  if (view.lines.length === 0) redirect("/cart");

  const cookieStore = await cookies();
  const verifiedPhone = cookieStore.get("wm_phone")?.value ?? null;

  // If phone not verified, redirect to cart (OTP modal lives there)
  if (!verifiedPhone) redirect("/cart");

  return <CheckoutClient cart={view} verifiedPhone={verifiedPhone} />;
}
