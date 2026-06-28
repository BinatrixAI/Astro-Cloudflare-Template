import catalog from "@/content/products.json";

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

const PRODUCTS: Product[] = catalog.products as Product[];

export function listProducts(): Product[] {
  return PRODUCTS;
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
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
