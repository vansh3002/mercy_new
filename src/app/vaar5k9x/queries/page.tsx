import { prisma } from "@/lib/prisma";
import { AdminQueryRow } from "@/components/admin/AdminQueryRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customer Queries ,Admin" };

const TYPE_LABEL: Record<string, string> = {
  replacement: "Replacement",
  general: "Order Query",
  other: "Other",
};

export default async function AdminQueriesPage() {
  const queries = await prisma.customerQuery.findMany({
    orderBy: { createdAt: "desc" },
  });

  const open = queries.filter((q) => q.status === "OPEN").length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customer Queries</h1>
          {open > 0 && (
            <p className="text-sm text-amber-600 mt-0.5">{open} open {open === 1 ? "query" : "queries"} awaiting response</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {queries.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">No queries yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {queries.map((q) => (
              <AdminQueryRow
                key={q.id}
                id={q.id}
                orderNumber={q.orderNumber}
                phone={q.phone}
                customerName={q.customerName}
                type={TYPE_LABEL[q.type] ?? q.type}
                message={q.message}
                status={q.status}
                createdAt={q.createdAt.toISOString()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
