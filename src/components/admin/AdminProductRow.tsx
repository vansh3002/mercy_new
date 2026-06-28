"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { adminToggleActive, adminDeleteProduct } from "@/app/vaar5k9x/actions";

function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  images: unknown;
  sizeInventory: unknown;
  active: boolean;
  slug: string;
}

export function AdminProductRow({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const images = Array.isArray(product.images) ? product.images : [];
  const thumb = typeof images[0] === "string" ? images[0] : null;
  const inv = (product.sizeInventory ?? {}) as Record<string, number>;
  const totalStock = Object.values(inv).reduce((s, v) => s + (v || 0), 0);

  function toggleActive() {
    startTransition(async () => {
      await adminToggleActive(product.id, !product.active);
      router.refresh();
    });
  }

  function deleteProduct() {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await adminDeleteProduct(product.id);
      router.refresh();
    });
  }

  return (
    <tr className={`hover:bg-gray-50/50 transition-colors ${isPending ? "opacity-50" : ""}`}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {thumb ? (
            <img src={thumb} alt={product.title} className="w-10 h-12 object-cover rounded-md bg-gray-100 shrink-0" />
          ) : (
            <div className="w-10 h-12 bg-gray-100 rounded-md shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-gray-800 text-sm leading-snug line-clamp-1">{product.title}</p>
            <p className="text-gray-400 text-xs font-mono mt-0.5">{product.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="font-semibold text-gray-800">{rupees(product.price)}</p>
        {product.discountPrice && (
          <p className="text-xs text-green-600">{rupees(product.discountPrice)}</p>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex flex-wrap gap-1">
          {Object.entries(inv).length > 0 ? (
            Object.entries(inv).map(([size, qty]) => (
              <span
                key={size}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  qty > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
                }`}
              >
                {size}:{qty}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">No inventory</span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Total: {totalStock}</p>
      </td>
      <td className="px-5 py-3.5">
        <button
          type="button"
          onClick={toggleActive}
          disabled={isPending}
          className={`relative w-10 h-5 rounded-full transition-colors ${product.active ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              product.active ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Link
            href={`/vaar5k9x/products/${product.id}`}
            className="p-1.5 text-gray-400 hover:text-[#8B1A2F] hover:bg-[#8B1A2F]/5 rounded-md transition-colors"
          >
            <Pencil size={14} />
          </Link>
          <button
            type="button"
            onClick={deleteProduct}
            disabled={isPending}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
