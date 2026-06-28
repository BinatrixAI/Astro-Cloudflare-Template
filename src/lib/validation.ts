import { z } from "zod";

/** A cart line: an item id + quantity. Price is resolved server-side. */
export const cartItemSchema = z.object({
  id: z.string().min(1),
  qty: z.number().int().min(1).max(100),
});

/** Buyer/payer fields — reused by client forms and the server cart schema. */
export const buyerSchema = z.object({
  name: z.string().min(1, "First name is required").max(100),
  lname: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Enter a valid email").max(200),
  phone: z
    .string()
    .min(6, "Enter a valid phone number")
    .max(30)
    .regex(/^[0-9+\-() ]+$/, "Phone may contain digits and + - ( ) only"),
  country: z.string().max(4).optional(),
  // Israeli ID (תעודת זהות) — optional; some terminals require it.
  userId: z
    .string()
    .max(20)
    .regex(/^[0-9]*$/, "ID must be digits only")
    .optional()
    .or(z.literal("")),
});

/** Checkout payload. Amounts are NEVER taken from the client — the server
 *  recomputes the total from the catalog. */
export const cartCheckoutSchema = buyerSchema.extend({
  items: z.array(cartItemSchema).min(1, "Choose at least one item"),
});

export type BuyerInput = z.infer<typeof buyerSchema>;
export type CartCheckoutInput = z.infer<typeof cartCheckoutSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
