import { DEMO_KEYS } from "./demo";

export function detectDemoKey(prompt?: string): string | undefined {
  if (!prompt) return undefined;
  const p = prompt.toLowerCase();
  if (p.includes("tomato") || p.includes("blight")) return "tomato-blight";
  if (p.includes("rose") || p.includes("blackspot") || p.includes("black spot"))
    return "rose-blackspot";
  if (p.includes("monstera") || p.includes("healthy")) return "monstera-healthy";
  if (p.includes("lemon") || p.includes("citrus") || p.includes("yellow"))
    return "lemon-yellowing";
  return undefined;
}

export function hasDemoKeys(): boolean {
  return DEMO_KEYS.length > 0;
}

export function previewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function mimeFromFile(file: File): string {
  return file.type || "image/jpeg";
}

// Resize + compress an image to a small data URL so it fits in localStorage quota.
export function compressImage(
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not compress image"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Convert to JPEG for small size; keep transparency loss acceptable.
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return "Please upload a JPEG, PNG or WebP image.";
  }
  if (file.size > 10 * 1024 * 1024) {
    return "Image is too large. Max 10MB.";
  }
  return null;
}

export interface AnalysisRecord {
  id: string;
  image: string; // base64 data URL
  demoKey?: string;
  analysis: unknown;
  createdAt: number;
}

const STORAGE_KEY = "verdisan_history";

export function saveAnalysis(record: AnalysisRecord): void {
  try {
    const all = loadHistory();
    all.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(-20)));
  } catch {
    /* ignore quota errors */
  }
}

export function loadHistory(): AnalysisRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalysisRecord[]) : [];
  } catch {
    return [];
  }
}

export function getAnalysisById(id: string): AnalysisRecord | undefined {
  return loadHistory().find((r) => r.id === id);
}
