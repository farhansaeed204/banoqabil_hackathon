import { z } from "zod";

export const DiseaseSchema = z.object({
  name: z.string(),
  probability: z.number().min(0).max(100).optional(),
  severity: z.enum(["mild", "moderate", "severe"]),
  description: z.string(),
  symptoms: z.array(z.string()),
});

export const TreatmentSchema = z.object({
  immediateActions: z.array(z.string()),
  remedies: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      safetyNote: z.string().optional(),
    })
  ),
  preventiveMeasures: z.array(z.string()),
});

export const RecoveryEstimateSchema = z.object({
  minDays: z.number(),
  maxDays: z.number(),
  conditions: z.array(z.string()),
});

export const PlantAnalysisSchema = z.object({
  plantName: z.string(),
  scientificName: z.string().optional(),
  confidence: z.number().min(0).max(100),
  healthStatus: z.enum(["healthy", "unhealthy", "uncertain"]),
  moistureEstimate: z.enum(["low", "normal", "high", "unknown"]).optional(),
  sunlightNeeds: z.string().optional(),
  diseases: z.array(DiseaseSchema),
  treatment: TreatmentSchema,
  recoveryEstimate: RecoveryEstimateSchema,
  careTips: z.array(z.string()),
  summary: z.string(),
});

export type Disease = z.infer<typeof DiseaseSchema>;
export type Treatment = z.infer<typeof TreatmentSchema>;
export type RecoveryEstimate = z.infer<typeof RecoveryEstimateSchema>;
export type PlantAnalysis = z.infer<typeof PlantAnalysisSchema>;

export const validateAnalysis = (raw: unknown): PlantAnalysis => {
  return PlantAnalysisSchema.parse(raw);
};
