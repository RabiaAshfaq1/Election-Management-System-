// SERVER ONLY — never import in client components

import { createAdminClient } from "@/lib/supabase-admin";
import { ALLOWED_IMAGE_TYPES } from "@/lib/validations/candidate";

const BUCKET = "candidate-photos";

export async function uploadCandidatePhoto(
  electionId: string,
  file: File
): Promise<string> {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    throw new Error("Invalid image type");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${electionId}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();

  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

export async function deleteCandidatePhoto(photoUrl: string | null) {
  if (!photoUrl) return;

  try {
    const url = new URL(photoUrl);
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) return;

    const path = decodeURIComponent(
      url.pathname.slice(index + marker.length)
    );
    const admin = createAdminClient();
    await admin.storage.from(BUCKET).remove([path]);
  } catch {
    // ignore cleanup failures
  }
}
