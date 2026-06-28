import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const sizeInventory = (product.sizeInventory ?? {}) as Record<string, number>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/vaar5k9x/products" className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
            <ArrowLeft size={18} className="text-gray-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{product.title}</h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{product.slug}</p>
          </div>
        </div>
        <Link
          href={`/product/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#8B1A2F] transition-colors"
        >
          View on store <ExternalLink size={12} />
        </Link>
      </div>

      <AdminProductForm
        initial={{
          id: product.id,
          title: product.title,
          description: product.description ?? "",
          price: product.price,
          discountPrice: product.discountPrice,
          images,
          sizeInventory,
          story: product.story ?? "",
          fabric: product.fabric ?? "",
          colorName: product.colorName ?? "",
          colorHex: product.colorHex ?? "#000000",
          active: product.active,
        }}
      />
    </div>
  );
}
