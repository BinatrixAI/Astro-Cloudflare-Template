import { getEmDashEntry } from "emdash";

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Price in MINOR units (agorot / cents). Server-controlled — never trust the client. */
  price: number;
  currency: string;
  image: string | null;
  /** Max quantity per order line (optional, defaults to 1). */
  maxQty?: number;
}

/** Look up a published product in the CMS `products` collection (slug = id). */
export async function getProduct(id: string): Promise<Product | undefined> {
  const { entry, error, isPreview } = await getEmDashEntry("products", id);
  if (error) throw error;
  // A `?_preview=` token makes EmDash serve the unpublished draft. Never price
  // (or sell) from a draft — a shared preview link would otherwise let anyone
  // check out at an unpublished price.
  if (!entry || isPreview) return undefined;
  const d = entry.data;
  return {
    id,
    name: d.name,
    description: d.description ?? "",
    price: d.price,
    currency: d.currency ?? "ILS",
    image: d.image?.src ?? null,
    maxQty: d.max_qty ?? 1,
  };
}

/** Format minor units to a major-unit string, e.g. 5000 -> "50.00". */
export function formatAmount(minorUnits: number): string {
  return (minorUnits / 100).toFixed(2);
}

const CURRENCY_SYMBOL: Record<string, string> = {
  ILS: "₪",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function formatPrice(minorUnits: number, currency: string): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? "";
  return `${symbol}${formatAmount(minorUnits)}`;
}
