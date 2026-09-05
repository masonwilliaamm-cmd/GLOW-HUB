import { z } from "zod";

export { firstIssueMessage } from "./shared";

// Admins are provisioned directly (seed data / future admin tooling), not
// via self-signup.
export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["BUYER", "VENDOR"]),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export const vendorOnboardingSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required."),
  trustTier: z.enum(["READY_STOCK", "MADE_TO_ORDER"]),
  payoutAccountDetails: z
    .string()
    .trim()
    .min(4, "Enter payout account details (bank + account number)."),
});
