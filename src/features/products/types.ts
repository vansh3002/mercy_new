export type Mood = "everyday" | "festive" | "light-wear" | "tea-time";
export type Collection = "festive-edit" | "everyday" | "light-wear" | "tea-time";
export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type SortKey = "popular" | "new" | "price-asc" | "price-desc";

export interface ProductImageSet {
  grid: string;
  /** Optional second image revealed on hover. */
  hover?: string;
  /** Optional cinematic hero asset for editorial blocks. */
  hero?: string;
  pdp: string[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  collection: Collection;
  mood: Mood;
  price: number;
  mrp: number;
  discountPct: number;
  tag?: string;
  /** Short marketing line — 1 sentence, editorial voice. */
  story?: string;
  /** Optional fabric label, used by PDP and cards. */
  fabric?: string;
  /** Human-readable colour name shown beside swatch dot. */
  colorName?: string;
  /** Hex used to render the swatch chip. */
  colorHex?: string;
  sizes: Size[];
  stock: number;
  popularity: number;
  createdAt: string;
  description?: string;
  images: ProductImageSet;
}

export interface ProductQuery {
  collection?: Collection;
  mood?: Mood;
  sort?: SortKey;
  maxPrice?: number;
  minPrice?: number;
  size?: Size;
}
