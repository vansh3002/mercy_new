"use client";

import { useState } from "react";
import { MessageCircle, X, CheckCircle2 } from "lucide-react";

const QUERY_TYPES = [
  { value: "replacement", label: "Replacement Request", desc: "Item damaged, wrong size or colour received" },
  { value: "general", label: "Order Query", desc: "Questions about delivery, status, etc." },
  { value: "other", label: "Other", desc: "Anything else we can help with" },
] as const;

interface Props {
  orderNumber: string;
  phone: string;
  customerName: string;
}

export function NeedHelpButton({ orderNumber, phone, customerName }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("replacement");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!message.trim()) {
      setError("Please describe your issue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/customer/queries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber, phone, customerName, type, message }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError("Could not submit your request. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpen(false);
    // Reset after close animation
    setTimeout(() => {
      if (!open) {
        setDone(false);
        setMessage("");
        setType("replacement");
        setError(null);
      }
    }, 300);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full border border-wine/40 text-wine hover:bg-wine/5 transition-colors text-sm font-medium py-2.5 rounded-[2px]"
      >
        <MessageCircle size={15} strokeWidth={1.75} />
        Need help with this order?
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-[4px] shadow-2xl z-10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Need help?</p>
                <p className="text-xs text-gray-400 mt-0.5">Order {orderNumber}</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-5">
              {done ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle2 size={44} className="text-green-500" strokeWidth={1.5} />
                  <p className="font-semibold text-gray-900">Request submitted!</p>
                  <p className="text-sm text-gray-500">
                    We&apos;ll review your request and get back to you shortly on your registered number.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-2 px-6 py-2 bg-[#8B1A2F] text-white text-sm font-medium rounded-[2px] hover:bg-[#7a1728] transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Query type */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">What do you need?</p>
                  <div className="flex flex-col gap-2 mb-5">
                    {QUERY_TYPES.map((qt) => (
                      <label
                        key={qt.value}
                        className={`flex items-start gap-3 p-3 border rounded-[4px] cursor-pointer transition-colors ${
                          type === qt.value
                            ? "border-[#8B1A2F] bg-[#8B1A2F]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="queryType"
                          value={qt.value}
                          checked={type === qt.value}
                          onChange={() => setType(qt.value)}
                          className="mt-0.5 accent-[#8B1A2F]"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{qt.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{qt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Message */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your message</p>
                  <textarea
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setError(null); }}
                    placeholder="Please describe your issue in detail…"
                    rows={4}
                    className="w-full border border-gray-200 rounded-[4px] px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#8B1A2F]/60 resize-none"
                  />

                  {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

                  <button
                    type="button"
                    onClick={submit}
                    disabled={loading}
                    className="mt-4 w-full bg-[#8B1A2F] text-white py-3 rounded-[2px] text-sm font-semibold hover:bg-[#7a1728] transition-colors disabled:opacity-60"
                  >
                    {loading ? "Submitting…" : "Submit Request"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
