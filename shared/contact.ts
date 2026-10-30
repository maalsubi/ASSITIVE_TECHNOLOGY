import { z } from "zod";
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  email: z.email("Enter a valid email address.").max(254),
  organization: z.string().trim().max(150).default(""),
  subject: z.string().trim().min(3, "Please enter a subject.").max(150),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(5000),
  website: z.string().max(0, "Submission rejected.").optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;
