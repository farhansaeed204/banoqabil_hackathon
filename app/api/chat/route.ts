import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { get } from "@/lib/server-store";
import { KNOWLEDGE_BASE } from "@/lib/knowledge";
import { CHAT_IMAGE_CONTEXT_SYSTEM, CHAT_GENERAL_SYSTEM } from "@/lib/prompts";

export const maxDuration = 60;
export const runtime = "nodejs";

const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter((k): k is string => Boolean(k));

// Keyword fallback when no embedding API available (works without a key).
function keywordSearch(query: string, topK = 5) {
  const terms = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  const scored = KNOWLEDGE_BASE.map((e) => {
    const hay = (e.text + " " + Object.values(e.metadata).join(" ")).toLowerCase();
    let score = 0;
    for (const t of terms) if (hay.includes(t)) score++;
    // give strong boost for plant + disease terms
    const plant = e.metadata.plant?.toLowerCase();
    const disease = e.metadata.disease?.toLowerCase();
    if (plant && terms.includes(plant)) score += 3;
    if (disease && terms.some((t) => disease.includes(t))) score += 4;
    return { entry: e, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.entry);
  return scored;
}

async function retrieveChunks(query: string, topK = 5) {
  // Keyword-based retrieval over the curated knowledge base.
  // Fast, deployable without a vector DB, and works even without embeddings.
  return keywordSearch(query, topK);
  // Note: real vector search (embedQuery → cosine) can be layered on later;
  // keyword matching already yields strong results for a small curated KB.
}

export async function POST(req: NextRequest) {
  // SSE streaming response

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        const body = await req.json();
        const { message, mode = "general", analysisId } = body as {
          message: string;
          mode: "image" | "general";
          analysisId?: string;
        };

        if (!message) {
          send({ error: "No message provided." });
          controller.close();
          return;
        }

        // Gather context
        const chunks = await retrieveChunks(message, 5);
        const docs = chunks.map((c) => c.text).join("\n\n---\n\n");
        const missingDocs =
          chunks.length === 0 ? "(No specific knowledge base matches found.)" : "";

        let systemPrompt: string;
        let userPrompt: string;

        if (mode === "image" && analysisId) {
          const analysis = get(analysisId);
          systemPrompt = CHAT_IMAGE_CONTEXT_SYSTEM;
          const analysisCtx = analysis
            ? JSON.stringify({
                plant: analysis.plantName,
                status: analysis.healthStatus,
                diseases: analysis.diseases?.map((d) => d.name).join(", "),
                summary: analysis.summary,
              })
            : "No prior analysis was found for this image ID.";
          userPrompt = `IMAGE ANALYSIS:\n${analysisCtx}\n\nKNOWLEDGE BASE:\n${docs || missingDocs}\n\nUser question: ${message}\n\nAnswer:`;
        } else {
          systemPrompt = CHAT_GENERAL_SYSTEM;
          userPrompt = `KNOWLEDGE BASE:\n${docs || missingDocs}\n\nUser question: ${message}\n\nAnswer:`;
        }

        if (KEYS.length === 0) {
          send({
            text: "No Gemini API key is configured, so live answers are unavailable. The app is running in demo mode. Add GEMINI_API_KEY to enable the RAG chatbot.",
            done: true,
          });
          controller.close();
          return;
        }

        const client = new GoogleGenerativeAI(KEYS[0]);
        const model = client.getGenerativeModel({
          model: "gemini-3.5-flash",
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContentStream(userPrompt);
        for await (const chunk of result.stream) {
          const t = chunk.text();
          if (t) send({ text: t });
        }
        send({ done: true });
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Chat failed";
        send({ error: msg });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
