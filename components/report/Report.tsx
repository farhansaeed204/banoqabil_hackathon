import type { PlantAnalysis } from "@/lib/types";
import {
  Activity,
  CheckCircle2,
  Circle,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Droplets,
  Sun,
  Leaf,
} from "lucide-react";

const statusConfig = {
  healthy: {
    label: "Healthy",
    icon: ShieldCheck,
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  unhealthy: {
    label: "Needs Treatment",
    icon: AlertTriangle,
    cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  uncertain: {
    label: "Uncertain",
    icon: HelpCircle,
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
} as const;

function statusIcon(status: PlantAnalysis["healthStatus"]) {
  return statusConfig[status]?.icon || HelpCircle;
}

export function HealthBadge({
  status,
  confidence,
}: {
  status: PlantAnalysis["healthStatus"];
  confidence?: number;
}) {
  const Icon = statusIcon(status);
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${cfg.cls}`}
    >
      <Icon className="h-4 w-4" />
      {cfg.label}
      {typeof confidence === "number" && ` · ${confidence}%`}
    </span>
  );
}

export function PlantHeader({ analysis }: { analysis: PlantAnalysis }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{analysis.plantName}</h1>
        {analysis.scientificName && (
          <p className="mt-1 text-sm italic text-muted-c">
            {analysis.scientificName}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <HealthBadge status={analysis.healthStatus} confidence={analysis.confidence} />
        <div className="flex items-center gap-4 text-sm text-muted-c">
          {analysis.moistureEstimate && (
            <span className="inline-flex items-center gap-1">
              <Droplets className="h-4 w-4" /> Moisture: {analysis.moistureEstimate}
            </span>
          )}
          {analysis.sunlightNeeds && (
            <span className="inline-flex items-center gap-1">
              <Sun className="h-4 w-4" /> {analysis.sunlightNeeds}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function DiseaseCards({ diseases }: { diseases: PlantAnalysis["diseases"] }) {
  if (!diseases.length) {
    return (
      <div className="card flex items-center gap-3 p-6">
        <ShieldCheck className="h-8 w-8 text-success" />
        <div>
          <h3 className="font-semibold">No diseases detected</h3>
          <p className="text-sm text-muted-c">
            Keep up the good care — monitor for early signs of stress.
          </p>
        </div>
      </div>
    );
  }
  const sevColor = {
    mild: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    moderate:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    severe: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  } as const;
  return (
    <div className="space-y-4">
      {diseases.map((d, i) => (
        <details key={i} className="card p-6 open:ring-1 open:ring-border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-danger" />
              <div>
                <p className="font-semibold">{d.name}</p>
                {typeof d.probability === "number" && (
                  <p className="text-xs text-muted-c">
                    ~{d.probability}% match
                  </p>
                )}
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${sevColor[d.severity]}`}
            >
              {d.severity}
            </span>
          </summary>
          <p className="mt-4 text-sm text-muted-c">{d.description}</p>
          {d.symptoms.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {d.symptoms.map((s, j) => (
                <li key={j} className="flex items-start gap-2 text-sm">
                  <Circle className="mt-1 h-2 w-2 shrink-0 fill-current" />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </details>
      ))}
    </div>
  );
}

export function TreatmentPlan({ treatment }: { treatment: PlantAnalysis["treatment"] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 font-semibold">Act now</h3>
        <ul className="space-y-2">
          {treatment.immediateActions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {a}
            </li>
          ))}
        </ul>
      </div>

      {treatment.remedies.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">Recommended treatments</h3>
          <div className="space-y-3">
            {treatment.remedies.map((r, i) => (
              <div key={i} className="card p-4">
                <p className="font-semibold">{r.name}</p>
                <dl className="mt-2 grid gap-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 font-medium text-muted-c">
                      Dosage
                    </dt>
                    <dd>{r.dosage}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 font-medium text-muted-c">
                      Frequency
                    </dt>
                    <dd>{r.frequency}</dd>
                  </div>
                  {r.safetyNote && (
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 font-medium text-muted-c">
                        Safety
                      </dt>
                      <dd className="text-amber-700 dark:text-amber-300">
                        {r.safetyNote}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {treatment.preventiveMeasures.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">Prevent it returning</h3>
          <ul className="space-y-2">
            {treatment.preventiveMeasures.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function RecoveryTimeline({
  recovery,
}: {
  recovery: PlantAnalysis["recoveryEstimate"];
}) {
  const max = recovery.maxDays || 30;
  const min = recovery.minDays || 0;
  const pct = max > 0 ? Math.round((max / 60) * 100) : 0;
  return (
    <div>
      <h3 className="mb-3 font-semibold">Recovery estimate</h3>
      {max > 0 ? (
        <>
          <p className="text-3xl font-bold text-primary">
            {min === max ? `${max}` : `${min}–${max}`}
            <span className="ml-1 text-base font-medium text-muted-c">days</span>
          </p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <ul className="mt-4 space-y-1.5">
            {recovery.conditions.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {c}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-muted-c">No active issue — no recovery time needed.</p>
      )}
    </div>
  );
}

export function CareTips({ tips }: { tips: string[] }) {
  return (
    <ul className="space-y-2">
      {tips.map((t, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {t}
        </li>
      ))}
    </ul>
  );
}
