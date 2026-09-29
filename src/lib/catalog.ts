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
 * Resolve a priceable item by id from the product catalog (EmDash `products`).
 * Single resolver → one server-side pricing path for all checkouts. Extend this
 * to merge other catalogs (e.g. event tickets) when needed.
 */
export async function getPriceableItem(id: string): Promise<PriceableItem | undefined> {
  const product: Product | undefined = await getProduct(id);
  if (!product) return undefined;
  return {
    id: product.id,
    name: product.name,
    unitPrice: product.price,
    currency: product.currency,
    maxQty: product.maxQty ?? 1,
  };
}
