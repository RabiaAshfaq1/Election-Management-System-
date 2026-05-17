import { z } from "zod";

import { LIMITS, sanitizedString } from "@/lib/validations/core";

export const ELECTION_CATEGORIES = [
  "Student Body",
  "Corporate",
  "NGO",
  "Community",
  "Other",
] as const;

export type ElectionCategory = (typeof ELECTION_CATEGORIES)[number];

export const electionStep1Schema = z.object({
  title: sanitizedString({ max: LIMITS.title, min: 3, label: "Title" }),
  description: z
    .string()
    .max(LIMITS.description, `Description must be at most ${LIMITS.description} characters`)
    .optional()
    .or(z.literal("")),
  category: z.enum(ELECTION_CATEGORIES, {
    required_error: "Select a category",
  }),
});

export const electionScheduleFieldsSchema = z.object({
  start_time: z.string().min(1, "Start date and time is required"),
  end_time: z.string().min(1, "End date and time is required"),
  registration_deadline: z
    .string()
    .min(1, "Registration deadline is required"),
  max_voters: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .positive("Must be at least 1")
    .max(1_000_000),
});

const scheduleRefinements = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine(
      (data: z.infer<typeof electionScheduleFieldsSchema>) =>
        new Date(data.end_time) > new Date(data.start_time),
      {
        message: "End time must be after start time",
        path: ["end_time"],
      }
    )
    .refine(
      (data: z.infer<typeof electionScheduleFieldsSchema>) =>
        new Date(data.registration_deadline) <= new Date(data.start_time),
      {
        message: "Registration deadline must be on or before start time",
        path: ["registration_deadline"],
      }
    );

export const electionStep2Schema = scheduleRefinements(
  electionScheduleFieldsSchema
);

export const electionFormSchema = scheduleRefinements(
  electionStep1Schema.merge(electionScheduleFieldsSchema)
);

export type ElectionStep1Input = z.infer<typeof electionStep1Schema>;
export type ElectionStep2Input = z.infer<typeof electionScheduleFieldsSchema>;
export type ElectionFormInput = z.infer<typeof electionFormSchema>;
