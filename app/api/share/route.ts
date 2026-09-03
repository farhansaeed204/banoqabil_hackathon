import { NextRequest, NextResponse } from "next/server";
import { getServerClient, supabaseUrl } from "@/lib/supabase";

export const maxDuration = 60;
export const runtime = "nodejs";

const BUCKET = "plant-images";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, analysis, image } = body as {
      id: string;
      analysis: unknown;
      image?: string;
    };

    if (!id || !analysis) {
      return NextResponse.json(
        { error: "Missing id or analysis." },
        { status: 400 }
      );
    }

    const sb = getServerClient();

    // 1. Upload compressed image to Storage (public bucket).
    if (image && image.startsWith("data:")) {
      const comma = image.indexOf(",");
      const mime = comma > -1 ? image.slice(5, image.indexOf(";")) : "image/jpeg";
      const base64 = comma > -1 ? image.slice(comma + 1) : image;
      const buffer = Buffer.from(base64, "base64");
      const { error: uploadErr } = await sb.storage
        .from(BUCKET)
        .upload(`${id}.jpg`, buffer, {
          contentType: mime,
          upsert: true,
          cacheControl: "3600",
        });
      if (uploadErr) {
        // Ignore if object already exists (re-share) — treat as success.
        if (!String(uploadErr.message).toLowerCase().includes("already exists")) {
          return NextResponse.json({ error: "Image upload failed.", detail: uploadErr.message }, { status: 500 });
        }
      }
    }

    // 2. Upsert analysis JSON into reports table.
    const { error: dbErr } = await sb
      .from("reports")
      .upsert({ id, analysis, created_at: new Date().toISOString() }, { onConflict: "id" });

    if (dbErr) {
      return NextResponse.json({ error: "Database save failed.", detail: dbErr.message }, { status: 500 });
    }

    return NextResponse.json({
      id,
      url: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${id}.jpg`,
      shared: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Share failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
