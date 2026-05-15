import { NextResponse } from "next/server";

import { verifyElectionCreator } from "@/lib/candidates/verify-creator";
import { uploadCandidatePhoto } from "@/lib/storage/candidate-photos";
import { candidateFormSchema, validatePhotoFile } from "@/lib/validations/candidate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const electionId = searchParams.get("election_id");

  if (!electionId) {
    return NextResponse.json(
      { error: "election_id is required" },
      { status: 400 }
    );
  }

  const auth = await verifyElectionCreator(electionId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("candidates")
    .select("*")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ candidates: data });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const electionId = formData.get("election_id") as string | null;

    if (!electionId) {
      return NextResponse.json(
        { error: "election_id is required" },
        { status: 400 }
      );
    }

    const auth = await verifyElectionCreator(electionId);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

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
    const photoError = validatePhotoFile(
      photoFile && photoFile.size > 0 ? photoFile : null
    );
    if (photoError) {
      return NextResponse.json({ error: photoError }, { status: 400 });
    }

    let photoUrl: string | null = null;
    if (photoFile && photoFile.size > 0) {
      photoUrl = await uploadCandidatePhoto(electionId, photoFile);
    }

    const { data, error } = await auth.supabase
      .from("candidates")
      .insert({
        election_id: electionId,
        name: parsed.data.name,
        designation: parsed.data.designation || null,
        manifesto: parsed.data.manifesto || null,
        photo_url: photoUrl,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ candidate: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create candidate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
