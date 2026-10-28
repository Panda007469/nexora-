import { z } from "zod";
import { services } from "./site";
export const requestSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  college: z.string().trim().min(1, "Please enter your college."),
  email: z.string().trim().email("Please enter a valid email address."),
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
    ),
});
