import { z } from "zod";

import { AuthGuardError } from "@/lib/auth-guard";

export const LIMITS = {
  name: 120,
  email: 254,
  phone: 20,
  password: 128,
  title: 200,
  description: 5000,
  organization: 200,
  purpose: 2000,
  designation: 120,
  manifesto: 500,
  rejectionReason: 1000,
  secretId: 64,
  notificationTitle: 200,
  notificationMessage: 1000,
} as const;

const HTML_TAG_REGEX = /<[^>]*>/g;

export function stripHtml(value: string): string {
  return value.replace(HTML_TAG_REGEX, "").trim();
}

export function sanitizedString(options: {
  max: number;
  min?: number;
  label?: string;
}) {
  const { max, min = 0, label = "Value" } = options;

  return z
    .string()
    .transform((val) => stripHtml(val))
    .pipe(
      z
        .string()
        .min(min, min > 0 ? `${label} must be at least ${min} characters` : undefined)
        .max(max, `${label} must be at most ${max} characters`)
    );
}

export const emailSchema = z
  .string()
  .email("Enter a valid email address")
  .max(LIMITS.email)
  .transform((v) => v.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(LIMITS.password)
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

export const uuidSchema = z.string().uuid("Invalid ID");

export const turnstileTokenSchema = z
  .string()
  .min(1, "CAPTCHA verification is required");

export const loginApiSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(LIMITS.password),
  turnstileToken: turnstileTokenSchema,
});

export const signupApiSchema = z
  .object({
    fullName: sanitizedString({ max: LIMITS.name, min: 2, label: "Name" }),
    email: emailSchema,
    phone: sanitizedString({ max: LIMITS.phone, min: 10, label: "Phone" }).regex(
      /^[\d\s+\-()]+$/,
      "Enter a valid phone number"
    ),
    password: passwordSchema,
    confirmPassword: z.string(),
    turnstileToken: turnstileTokenSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const voteBodySchema = z.object({
  secretId: sanitizedString({
    max: LIMITS.secretId,
    min: 1,
    label: "Secret voter ID",
  }),
  candidateId: uuidSchema,
});

export const verifySecretIdBodySchema = z.object({
  secretId: sanitizedString({
    max: LIMITS.secretId,
    min: 1,
    label: "Secret voter ID",
  }),
});

export const registerElectionBodySchema = z.object({
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms to register." }),
  }),
});

export const notificationsPatchSchema = z.object({
  markAllRead: z.literal(true),
});

export const emailSendBodySchema = z.object({
  template: z.enum([
    "email_verification",
    "approval",
    "rejection",
    "secret_id",
    "election_start_reminder",
    "election_end",
    "winner_creator",
  ]),
  to: emailSchema,
  data: z.record(z.union([z.string(), z.number()])),
  userId: uuidSchema.optional().nullable(),
  notification: z
    .object({
      type: sanitizedString({ max: 64, label: "Type" }),
      title: sanitizedString({ max: LIMITS.notificationTitle, label: "Title" }),
      message: sanitizedString({
        max: LIMITS.notificationMessage,
        label: "Message",
      }),
      link: z.string().url().max(2048).optional().nullable(),
      electionId: uuidSchema.optional().nullable(),
    })
    .optional(),
});

export const emailApprovalBodySchema = z.object({
  requestId: uuidSchema,
  to: emailSchema,
  name: sanitizedString({ max: LIMITS.name, min: 1, label: "Name" }),
  organization: sanitizedString({
    max: LIMITS.organization,
    min: 1,
    label: "Organization",
  }),
  creatorId: uuidSchema,
});

export const emailRejectionBodySchema = z.object({
  requestId: uuidSchema,
  to: emailSchema,
  name: sanitizedString({ max: LIMITS.name, min: 1, label: "Name" }),
  creatorId: uuidSchema,
  reason: sanitizedString({
    max: LIMITS.rejectionReason,
    min: 1,
    label: "Rejection reason",
  }),
});

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }

  const result = schema.safeParse(json);

  if (!result.success) {
    const first = result.error.errors[0];
    throw new ValidationError(first?.message ?? "Validation failed");
  }

  return result.data;
}

export function validationErrorResponse(error: unknown) {
  if (error instanceof ValidationError) {
    return { error: error.message, status: 400 as const };
  }
  if (error instanceof AuthGuardError) {
    return { error: error.message, status: error.status };
  }
  return null;
}
