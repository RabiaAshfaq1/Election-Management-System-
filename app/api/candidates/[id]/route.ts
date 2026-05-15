import { NextResponse } from "next/server";

import { verifyCandidateOwner } from "@/lib/candidates/verify-creator";
import {
  deleteCandidatePhoto,
  uploadCandidatePhoto,
} from "@/lib/storage/candidate-photos";
import { candidateFormSchema, validatePhotoFile } from "@/lib/validations/candidate";

interface RouteContext {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const auth = await verifyCandidateOwner(params.id);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();

    const parsed = candidateFormSchema.safeParse({
      name: formData.get("name"),
      designation: formData.get("designation") || undefined,
      manifesto: formData.get("manifesto") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const photoFile = formData.get("photo") as File | null;
    const removePhoto = formData.get("remove_photo") === "true";

    const photoError = validatePhotoFile(
      photoFile && photoFile.size > 0 ? photoFile : null
    );
    if (photoError) {
      return NextResponse.json({ error: photoError }, { status: 400 });
    }

    let photoUrl = auth.candidate.photo_url;

    if (removePhoto && !photoFile?.size) {
      await deleteCandidatePhoto(photoUrl);
      photoUrl = null;
    }

    if (photoFile && photoFile.size > 0) {
      await deleteCandidatePhoto(photoUrl);
      photoUrl = await uploadCandidatePhoto(
        auth.candidate.election_id,
        photoFile
      );
    }

    const { data, error } = await auth.supabase
      .from("candidates")
      .update({
        name: parsed.data.name,
        designation: parsed.data.designation || null,
        manifesto: parsed.data.manifesto || null,
        photo_url: photoUrl,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ candidate: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update candidate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await verifyCandidateOwner(params.id);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await deleteCandidatePhoto(auth.candidate.photo_url);

  const { error } = await auth.supabase
    .from("candidates")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
