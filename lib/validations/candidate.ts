import { z } from "zod";

import { LIMITS, sanitizedString } from "@/lib/validations/core";

const MAX_MANIFESTO = LIMITS.manifesto;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const candidateFormSchema = z.object({
  name: sanitizedString({ max: LIMITS.name, min: 2, label: "Name" }),
  designation: sanitizedString({ max: LIMITS.designation, label: "Designation" })
    .optional()
    .or(z.literal("")),
  manifesto: sanitizedString({ max: MAX_MANIFESTO, label: "Manifesto" })
    .optional()
    .or(z.literal("")),
});

export type CandidateFormInput = z.infer<typeof candidateFormSchema>;

export { MAX_MANIFESTO, MAX_PHOTO_SIZE, ALLOWED_IMAGE_TYPES };

export function validatePhotoFile(file: File | null): string | null {
  if (!file) return null;
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return "Photo must be JPEG, PNG, WebP, or GIF";
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return "Photo must be 5MB or smaller";
  }
  return null;
}
