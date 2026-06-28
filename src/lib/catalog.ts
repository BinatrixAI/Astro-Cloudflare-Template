import { getProduct, type Product } from "@/lib/products";
import toursData from "@/content/tours.json";

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

export interface TourDay {
  id: string;
  name: string;
  date: string;
  details: string;
}

export interface ToursConfig {
  title: string;
  subtitle: string;
  pricePerDay: number;
  currency: string;
  maxPerDay: number;
  deadline: string;
  days: TourDay[];
}

export const tours = toursData as ToursConfig;

/**
 * Resolve any priceable item by id — merges single products (products.json,
 * implicit qty 1) and tour days (tours.json, unit price = pricePerDay).
 * Single resolver → one server-side pricing path for all checkouts.
 */
export function getPriceableItem(id: string): PriceableItem | undefined {
  const day = tours.days.find((d) => d.id === id);
  if (day) {
    return {
      id: day.id,
      name: `${tours.title} — ${day.name} (${day.date})`,
      unitPrice: tours.pricePerDay,
      currency: tours.currency,
      maxQty: tours.maxPerDay,
    };
  }
  const product: Product | undefined = getProduct(id);
  if (product) {
    return {
      id: product.id,
      name: product.name,
      unitPrice: product.price,
      currency: product.currency,
      maxQty: 1,
    };
  }
  return undefined;
}
