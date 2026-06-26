import { getCartIdFromCookies } from "@/lib/cart-cookie";
import { getOrCreateCart } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";
import { CartClient } from "@/components/CartClient";

export const metadata = { title: "My Bag" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const id = getCartIdFromCookies();
  const cart = id ? await buildCartView(getOrCreateCart(id)) : null;
  return <CartClient initial={cart} />;
}
