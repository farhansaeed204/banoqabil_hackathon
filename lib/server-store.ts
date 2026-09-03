// Simple in-memory server store for analyses (per serverless instance).
// For a hackathon this is fine; swap for a DB if needed.

import type { PlantAnalysis } from "./types";

const map = new Map<string, { analysis: PlantAnalysis; createdAt: number }>();

export function save(id: string, analysis: PlantAnalysis): void {
  map.set(id, { analysis, createdAt: Date.now() });
}

export function get(id: string): PlantAnalysis | undefined {
  return map.get(id)?.analysis;
}

export function list(): { id: string; createdAt: number }[] {
  return Array.from(map.entries()).map(([id, v]) => ({ id, createdAt: v.createdAt }));
}
