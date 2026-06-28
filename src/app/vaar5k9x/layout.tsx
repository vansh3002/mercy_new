import Link from "next/link";
import { ExternalLink, Store } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Admin Panel" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F4F4F5]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#1C1917] flex flex-col min-h-screen sticky top-0 h-screen">
        <div className="flex-1 px-3 pt-6 pb-2">
          <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase px-3 mb-2">Womaniya</p>
          <AdminNav />
        </div>

        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <Store size={15} strokeWidth={1.5} />
            View Store
            <ExternalLink size={11} className="ml-auto" />
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
