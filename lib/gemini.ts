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

function nextKey(): string {
  const key = KEYS[keyIndex % KEYS.length];
  keyIndex = (keyIndex + 1) % KEYS.length;
  return key;
}

function getModel(modelName: string): GenerativeModel {
  const key = nextKey();

  if (!key) {
    throw new Error("No Gemini API key configured.");
  }

  return new GoogleGenerativeAI(key).getGenerativeModel({
    model: modelName,
  });
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function isTransientError(msg: string): boolean {
  const lower = msg.toLowerCase();

  return (
    msg.includes("408") ||
    msg.includes("429") ||
    msg.includes("500") ||
    msg.includes("502") ||
    msg.includes("503") ||
    msg.includes("504") ||
    lower.includes("resource_exhausted") ||
    lower.includes("service unavailable") ||
    lower.includes("unavailable") ||
    lower.includes("timeout") ||
    lower.includes("temporarily")
  );
}

function isModelNotFound(msg: string): boolean {
  const lower = msg.toLowerCase();

  return (
    msg.includes("404") ||
    lower.includes("model not found") ||
    lower.includes("not_found")
  );
}

async function tryModel<T>(
  modelName: string,
  fn: (model: GenerativeModel) => Promise<T>
): Promise<T> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const model = getModel(modelName);

    try {
      console.log(
        `[Gemini] Trying ${modelName} | attempt ${attempt}/${maxAttempts}`
      );

      const result = await fn(model);

      console.log(`[Gemini] ${modelName} succeeded`);

      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);

      console.error(
        `[Gemini] ${modelName} failed | attempt ${attempt}/${maxAttempts}`,
        msg
      );

      // Model doesn't exist → don't waste retries
      if (isModelNotFound(msg)) {
        throw err;
      }

      // Temporary error → retry with exponential backoff
      if (isTransientError(msg) && attempt < maxAttempts) {
        const delay = 1000 * Math.pow(2, attempt - 1);

        console.log(
          `[Gemini] Retrying ${modelName} in ${delay}ms...`
        );

        await sleep(delay);
        continue;
      }

      throw err;
    }
  }

  throw new Error(`${modelName} failed after all retries`);
}

async function withRetry<T>(
  fn: (model: GenerativeModel) => Promise<T>
): Promise<T> {
  // --------------------------------------------------
  // 1. Try primary model
  // --------------------------------------------------
  try {
    return await tryModel(MODEL_PRIMARY, fn);
  } catch (primaryError: unknown) {
    const msg =
      primaryError instanceof Error
        ? primaryError.message
        : String(primaryError);

    console.warn(
      `[Gemini] Primary model ${MODEL_PRIMARY} failed. Switching to ${MODEL_FALLBACK}...`
    );

    // --------------------------------------------------
    // 2. Automatically switch to fallback model
    // --------------------------------------------------
    try {
      const result = await tryModel(MODEL_FALLBACK, fn);

      // Remember the working model for future requests
      currentModel = MODEL_FALLBACK;

      return result;
    } catch (fallbackError) {
      console.error(
        `[Gemini] Both models failed.`,
        {
          primary: msg,
          fallback:
            fallbackError instanceof Error
              ? fallbackError.message
              : String(fallbackError),
        }
      );

      throw fallbackError;
    }
  }
}

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
              inlineData: {
                mimeType: options.mimeType,
                data: options.base64,
              },
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

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Gemini returned invalid JSON.");
  }

  const rawJson = cleaned.slice(jsonStart, jsonEnd + 1);

  return validateAnalysis(JSON.parse(rawJson));
}

// --------------------------------------------------
// Embedding (for RAG)
// --------------------------------------------------

let embedClient: GoogleGenerativeAI | null = null;

function getEmbedClient(): GoogleGenerativeAI {
  if (embedClient) return embedClient;

  const key = KEYS[0];

  if (!key) {
    throw new Error("No Gemini API key for embeddings");
  }

  embedClient = new GoogleGenerativeAI(key);

  return embedClient;
}

export async function embedText(text: string): Promise<number[]> {
  const model = getEmbedClient().getGenerativeModel({
    model: "text-embedding-004",
  });

  const res = await model.embedContent(text);

  return res.embedding.values;
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  const model = getEmbedClient().getGenerativeModel({
    model: "text-embedding-004",
  });

  const results = await model.batchEmbedContents({
    requests: texts.map((t) => ({
      content: {
        parts: [{ text: t }],
        role: "user",
      },
    })),
  });

  return results.embeddings.map((e) => e.values);
}
