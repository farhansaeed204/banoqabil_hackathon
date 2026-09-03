import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import { DEMO_RESULTS } from "./demo";
import { validateAnalysis, type PlantAnalysis } from "./types";

export const MODEL_PRIMARY = "gemini-3.5-flash";
export const MODEL_FALLBACK = "gemini-3.6-flash";

const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter((k): k is string => Boolean(k));

let keyIndex = 0;
let currentModel = MODEL_PRIMARY;
let modelSuccessful = false;

function nextKey(): string {
  const key = KEYS[keyIndex % KEYS.length];
  keyIndex = (keyIndex + 1) % KEYS.length;
  return key;
}

function getModel(modelName: string): GenerativeModel {
  const key = nextKey();
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: modelName });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const withRetry = async <T>(fn: (model: GenerativeModel) => Promise<T>): Promise<T> => {
  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const model = getModel(currentModel);
    try {
      const result = await fn(model);
      modelSuccessful = true;
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
        if (attempt < attempts) {
          await sleep(5000 * attempt);
          continue;
        }
      }
      if (msg.includes("404") || msg.toLowerCase().includes("model not found")) {
        if (currentModel === MODEL_PRIMARY) {
          currentModel = MODEL_FALLBACK;
          modelSuccessful = false;
          if (attempt < attempts) {
            await sleep(1000);
            continue;
          }
        }
      }
      throw err;
    }
  }
  throw new Error("All Gemini retries failed");
};

interface AnalyzeOptions {
  mimeType: string;
  base64: string;
  demoKey?: string;
}

export async function analyzePlantImage(
  options: AnalyzeOptions
): Promise<PlantAnalysis> {
  if (options.demoKey && DEMO_RESULTS[options.demoKey]) {
    return DEMO_RESULTS[options.demoKey];
  }
  if (KEYS.length === 0) {
    throw new Error(
      "No GEMINI_API_KEY configured and no demo match. Add an API key or provide a supported demo image."
    );
  }

  const { ANALYSIS_SYSTEM } = await import("./prompts");

  const text = await withRetry(async (model) => {
    const res = await model.generateContent({
      systemInstruction: ANALYSIS_SYSTEM,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: { mimeType: options.mimeType, data: options.base64 },
            },
          ],
        },
      ],
    });
    return res.response.text();
  });

  const cleaned = text.replace(/```json|```/g, "").trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  const rawJson = cleaned.slice(jsonStart, jsonEnd + 1);
  return validateAnalysis(JSON.parse(rawJson));
}

// --- Embedding (for RAG) ---
let embedClient: GoogleGenerativeAI | null = null;
function getEmbedClient(): GoogleGenerativeAI {
  if (embedClient) return embedClient;
  const key = KEYS[0];
  if (!key) throw new Error("No Gemini API key for embeddings");
  embedClient = new GoogleGenerativeAI(key);
  return embedClient;
}

export async function embedText(text: string): Promise<number[]> {
  const model = getEmbedClient().getGenerativeModel({ model: "text-embedding-004" });
  const res = await model.embedContent(text);
  return res.embedding.values;
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  const model = getEmbedClient().getGenerativeModel({ model: "text-embedding-004" });
  const results = await model.batchEmbedContents({
    requests: texts.map((t) => ({ content: { parts: [{ text: t }], role: "user" } })),
  });
  return results.embeddings.map((e) => e.values);
}
