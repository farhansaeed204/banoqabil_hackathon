import { NextRequest, NextResponse } from "next/server";
import { getServerClient, supabaseUrl } from "@/lib/supabase";

export const maxDuration = 30;
export const runtime = "nodejs";

const BUCKET = "plant-images";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }

    const sb = getServerClient();
    const { data, error } = await sb
      .from("reports")
      .select("id, analysis, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Database query failed.", detail: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${id}.jpg`;

    return NextResponse.json({
      id: data.id,
      analysis: data.analysis,
      created_at: data.created_at,
      imageUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
