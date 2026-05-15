import { NextResponse } from "next/server";

import { getElectionResults } from "@/lib/elections/results";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const data = await getElectionResults(params.id);

  if (!data) {
    return NextResponse.json({ error: "Election not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
