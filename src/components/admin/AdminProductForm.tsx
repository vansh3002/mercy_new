"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { adminSaveProduct, adminCreateProduct } from "@/app/vaar5k9x/actions";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "6", "8", "10", "12", "14", "36", "38", "40", "42", "44", "46"];

interface ProductData {
  id?: string;
  title: string;
  description: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  sizeInventory: Record<string, number>;
  story: string;
  fabric: string;
  colorName: string;
  colorHex: string;
  active: boolean;
}

export function AdminProductForm({ initial }: { initial?: Partial<ProductData> & { id?: string } }) {
  const isNew = !initial?.id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [discountPrice, setDiscountPrice] = useState(initial?.discountPrice ? String(initial.discountPrice) : "");
  const [story, setStory] = useState(initial?.story ?? "");
  const [fabric, setFabric] = useState(initial?.fabric ?? "");
  const [colorName, setColorName] = useState(initial?.colorName ?? "");
  const [colorHex, setColorHex] = useState(initial?.colorHex ?? "#000000");
  const [active, setActive] = useState(initial?.active ?? true);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [inv, setInv] = useState<Record<string, number>>(initial?.sizeInventory ?? {});
  const [uploading, setUploading] = useState(false);
  const [newSize, setNewSize] = useState("");

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) setImages((prev) => [...prev, json.url]);
      else setError("Image upload failed");
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addSize(size: string) {
    const s = size.trim().toUpperCase();
    if (!s) return;
    if (inv[s] !== undefined) return;
    setInv((prev) => ({ ...prev, [s]: 0 }));
    setNewSize("");
  }

  function removeSize(size: string) {
    setInv((prev) => {
      const copy = { ...prev };
      delete copy[size];
      return copy;
    });
  }

  function handleSubmit() {
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { setError("Valid price is required"); return; }

    const data: ProductData = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      images,
      sizeInventory: inv,
      story: story.trim(),
      fabric: fabric.trim(),
      colorName: colorName.trim(),
      colorHex,
      active,
    };

    startTransition(async () => {
      try {
        if (isNew) {
          const result = await adminCreateProduct(data);
          router.push(`/vaar5k9x/products/${result.id}`);
        } else {
          await adminSaveProduct(initial!.id!, data);
          router.refresh();
        }
      } catch (e: any) {
        setError(e?.message ?? "Failed to save product");
      }
    });
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Basic info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Basic Info</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#8B1A2F] transition-colors"
              placeholder="Product title"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#8B1A2F] transition-colors resize-none"
              placeholder="Short product description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Price (₹) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#8B1A2F] transition-colors"
                placeholder="e.g. 1499"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Discount Price (₹)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#8B1A2F] transition-colors"
                placeholder="Leave empty if no discount"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-500">Active</label>
            <button
              type="button"
              onClick={() => setActive((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${active ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-xs text-gray-400">{active ? "Visible on store" : "Hidden from store"}</span>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Images</h3>
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img src={url} alt="" className="w-20 h-24 object-cover rounded-lg border border-gray-100" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          <label className={`w-20 h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#8B1A2F] hover:bg-[#8B1A2F]/5 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}>
            {uploading ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <Upload size={16} className="text-gray-400" />}
            <span className="text-[10px] text-gray-400 mt-1">{uploading ? "Uploading…" : "Upload"}</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }}
            />
          </label>
        </div>
        <p className="text-[11px] text-gray-400">First image is used as the product thumbnail.</p>
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Size Inventory</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSize(s)}
              disabled={inv[s] !== undefined}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                inv[s] !== undefined
                  ? "bg-[#8B1A2F] text-white border-[#8B1A2F]"
                  : "border-gray-200 text-gray-500 hover:border-[#8B1A2F] hover:text-[#8B1A2F]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <input
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(newSize); } }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:border-[#8B1A2F]"
            placeholder="Custom size"
          />
          <button
            type="button"
            onClick={() => addSize(newSize)}
            className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        {Object.entries(inv).length > 0 && (
          <div className="flex flex-col gap-2">
            {Object.entries(inv).map(([size, qty]) => (
              <div key={size} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-16">{size}</span>
                <input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => setInv((prev) => ({ ...prev, [size]: Math.max(0, Number(e.target.value)) }))}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:border-[#8B1A2F]"
                />
                <span className="text-xs text-gray-400">units</span>
                <button type="button" onClick={() => removeSize(size)} className="ml-auto text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Details</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Story</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#8B1A2F] transition-colors resize-none"
              placeholder="Product story or collection note"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Fabric / Material</label>
            <input
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#8B1A2F] transition-colors"
              placeholder="e.g. 100% Cotton"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Color Name</label>
              <input
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#8B1A2F] transition-colors"
                placeholder="e.g. Wine Red"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Color Hex</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200 p-0.5"
                />
                <input
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#8B1A2F] font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || uploading}
          className="px-6 py-2.5 bg-[#8B1A2F] text-white font-semibold text-sm rounded-lg hover:bg-[#6d1525] transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
