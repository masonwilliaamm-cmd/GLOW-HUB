import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
      }),
    )
    .min(1, "Your cart is empty."),
  shippingAddress: z.string().trim().min(5, "Enter a shipping address."),
  shippingCity: z.string().trim().min(2, "Enter a city."),
  shippingState: z.string().trim().min(2, "Enter a state."),
  contactPhone: z.string().trim().min(7, "Enter a valid phone number."),
});
