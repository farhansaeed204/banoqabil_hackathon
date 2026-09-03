import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

const EMBED_MODEL = "text-embedding-004";

const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter((k): k is string => Boolean(k));

let genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (genAI) return genAI;
  const key = KEYS[0];
  if (!key) throw new Error("No Gemini API key for embeddings");
  genAI = new GoogleGenerativeAI(key);
  return genAI;
}

export async function embedText(text: string): Promise<number[]> {
  const model: GenerativeModel = getGenAI().getGenerativeModel({ model: EMBED_MODEL });
  const res = await model.embedContent(text);
  return res.embedding.values;
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  const model: GenerativeModel = getGenAI().getGenerativeModel({ model: EMBED_MODEL });
  const out: number[][] = [];
  // batch in chunks to stay within limits
  for (let i = 0; i < texts.length; i += 8) {
    const batch = texts.slice(i, i + 8);
    const res = await model.batchEmbedContents({
      requests: batch.map((t) => ({ content: { parts: [{ text: t }], role: "user" } })),
    });
    out.push(...res.embeddings.map((e) => e.values));
  }
  return out;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export interface RagChunk {
  id: string;
  text: string;
  embedding: number[];
  metadata: Record<string, string>;
}

// In-memory store, populated at runtime from embedded knowledge base.
let store: RagChunk[] = [];

export function setStore(chunks: RagChunk[]): void {
  store = chunks;
}

export function getStoreSize(): number {
  return store.length;
}

export function search(queryEmbedding: number[], topK = 5): RagChunk[] {
  return store
    .map((c) => ({ chunk: c, score: cosineSimilarity(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}
