const inr = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function rupees(value: number): string {
  return `Rs. ${inr.format(Math.max(0, Math.round(value)))}`;
}

export function discountSaved(price: number, mrp: number): number {
  return Math.max(0, mrp - price);
}

export function showOffBadge(discountPct: number): boolean {
  return discountPct >= 10;
}

export function initials(title: string): string {
  return title
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
