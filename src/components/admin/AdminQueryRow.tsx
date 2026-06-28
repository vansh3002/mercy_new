"use client";

import { useTransition } from "react";
import { adminResolveQuery } from "@/app/vaar5k9x/actions";
import { CheckCircle2, Clock } from "lucide-react";

interface Props {
  id: string;
  orderNumber: string;
  phone: string;
  customerName: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
}

const TYPE_COLOR: Record<string, string> = {
  Replacement: "bg-red-50 text-red-600",
  "Order Query": "bg-blue-50 text-blue-600",
  Other: "bg-gray-100 text-gray-600",
};

export function AdminQueryRow({ id, orderNumber, phone, customerName, type, message, status, createdAt }: Props) {
  const [pending, startTransition] = useTransition();
  const isOpen = status === "OPEN";

  return (
    <div className={`p-5 flex flex-col sm:flex-row sm:items-start gap-4 ${!isOpen ? "opacity-60" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[type] ?? "bg-gray-100 text-gray-600"}`}>
            {type}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            isOpen ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
          }`}>
            {isOpen ? <Clock size={10} /> : <CheckCircle2 size={10} />}
            {isOpen ? "Open" : "Resolved"}
          </span>
          <span className="text-[10px] text-gray-400">
            {new Date(createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>

        <p className="font-medium text-gray-800 text-sm">{customerName}</p>
        <p className="text-xs text-gray-400">+91 {phone} · Order {orderNumber}</p>

        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{message}</p>
      </div>

      {isOpen && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => adminResolveQuery(id))}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <CheckCircle2 size={13} />
          {pending ? "Resolving…" : "Mark Resolved"}
        </button>
      )}
    </div>
  );
}
