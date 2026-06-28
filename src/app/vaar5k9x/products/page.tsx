import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { AdminProductRow } from "@/components/admin/AdminProductRow";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Products <span className="text-gray-400 font-normal text-base">({products.length})</span>
        </h1>
        <Link
          href="/vaar5k9x/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1A2F] text-white text-sm font-semibold rounded-lg hover:bg-[#6d1525] transition-colors"
        >
          <Plus size={15} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Inventory</th>
                <th className="px-5 py-3 font-medium">Active</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <AdminProductRow key={p.id} product={p} />
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    No products yet.{" "}
                    <Link href="/vaar5k9x/products/new" className="text-[#8B1A2F] hover:underline">Add one →</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
