import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export default function AdminNewProductPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vaar5k9x/products" className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-500" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">New Product</h1>
      </div>
      <AdminProductForm />
    </div>
  );
}
