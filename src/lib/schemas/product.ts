import { z } from "zod";

export const productCategorySchema = z.enum([
  "SKINCARE",
  "MAKEUP",
  "HAIR",
  "FASHION",
  "SHOES",
  "ACCESSORIES",
  "FRAGRANCE",
]);

export const createProductSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  category: productCategorySchema,
  description: z
    .string()
    .trim()
    .min(10, "Description should be at least 10 characters."),
  price: z.coerce.number().positive("Price must be greater than 0."),
  images: z.array(z.string().url()).default([]),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).default("IN_STOCK"),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});
