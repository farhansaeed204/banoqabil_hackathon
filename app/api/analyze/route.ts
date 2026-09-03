import { NextRequest, NextResponse } from "next/server";
import { analyzePlantImage } from "@/lib/gemini";
import { save } from "@/lib/server-store";
import { detectDemoKey, mimeFromFile } from "@/lib/utils";
import { randomUUID } from "crypto";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const fileName = typeof formData.get("name") === "string" ? formData.get("name") as string : "";

    if (!file) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = mimeFromFile(file);

    // Demo detection based on filename, so the app works with no API key.
    const demoKey = detectDemoKey(fileName || file.name);

    const analysis = await analyzePlantImage({ mimeType, base64, demoKey });

    const id = randomUUID();
    save(id, analysis);

    return NextResponse.json({
      id,
      analysis,
      demo: Boolean(demoKey),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
