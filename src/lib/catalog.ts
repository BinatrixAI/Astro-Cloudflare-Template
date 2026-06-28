import { getProduct, type Product } from "@/lib/products";

/** A unit-priced item that can appear in a checkout cart. */
export interface PriceableItem {
  id: string;
  name: string;
  /** Unit price in MINOR units (agorot/cents). Server-controlled. */
  unitPrice: number;
  currency: string;
  /** Max quantity allowed per order line. */
  maxQty: number;
}

/**
 * Resolve a priceable item by id from the product catalog (products.json).
 * Single resolver → one server-side pricing path for all checkouts. Extend this
 * to merge other catalogs (e.g. event tickets) when needed.
 */
export function getPriceableItem(id: string): PriceableItem | undefined {
  const product: Product | undefined = getProduct(id);
  if (!product) return undefined;
  return {
    id: product.id,
    name: product.name,
    unitPrice: product.price,
    currency: product.currency,
    maxQty: product.maxQty ?? 1,
  };
}
