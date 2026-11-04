import { z } from "zod";
import { services } from "./site";
import { normalizeWhatsApp } from "@/lib/whatsapp";

export const CUSTOMER_TYPES = [
  "Student",
  "Startup",
  "Business",
  "Individual",
  "Researcher",
  "Other",
] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const requestFields = z.object({
  customer_type: z
    .string()
    .min(1, "Please select who you are.")
    .refine((val) => CUSTOMER_TYPES.includes(val as CustomerType), "Please select a valid option."),
  name: z.string().trim().min(1, "Please enter your name."),
  college: z.string().trim(),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeWhatsApp(v) !== null, { message: "Enter a valid WhatsApp number" }),
  service: z
    .string()
    .refine((value) => services.some((item) => item.id === value), "Please select a service."),
  description: z.string().trim().min(1, "Please describe your project."),
  deadline: z
    .string()
    .min(1, "Please choose a deadline.")
    .refine(
      (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)),
      "Please choose a valid date.",
    )
    .refine((value) => value >= getTodayIsoDate(), { message: "Pick a date from today onward" }),
});

export const requestSchema = requestFields.superRefine((data, ctx) => {
  if (data.customer_type === "Student" && !data.college?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["college"],
      message: "Please enter your college / organization.",
    });
  }
});
