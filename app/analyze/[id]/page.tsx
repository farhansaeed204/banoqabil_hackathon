"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Leaf, Share2 } from "lucide-react";
import { validateAnalysis, type PlantAnalysis } from "@/lib/types";
import {
  PlantHeader,
  DiseaseCards,
  TreatmentPlan,
  RecoveryTimeline,
  CareTips,
} from "@/components/report/Report";
import ChatPanel from "@/components/chat/ChatPanel";

interface Record {
  id: string;
  image?: string;
  analysis: unknown;
}

interface SharedReport {
  id: string;
  analysis: unknown;
  imageUrl?: string;
}

export default function AnalyzePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;

  const [record, setRecord] = useState<Record | null>(null);
  const [parsed, setParsed] = useState<PlantAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const apiBase =
    typeof window !== "undefined"
      ? `${window.location.origin}`
      : "";

  // Load local report first; if it's a shared link (?shared=1) and not local, fetch from server.
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("doctor_plant_history");
        const list: Record[] = raw ? JSON.parse(raw) : [];
        const found = list.find((r) => r.id === id);
        if (found) {
          setRecord({ ...found, image: found.image });
          setParsed(validateAnalysis(found.analysis));
          return;
        }
      } catch {
        /* ignore */
      }

      // Not in localStorage — try to load a shared report from the server.
      try {
        const res = await fetch(`/api/analysis/${id}`);
        if (res.ok) {
          const data: SharedReport = await res.json();
          const analysis = validateAnalysis(data.analysis);
          setRecord({
            id: data.id,
            image: data.imageUrl,
            analysis: data.analysis,
          });
          setParsed(analysis);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [id]);

  const onShare = async () => {
    // Build a public shareable link (works on any device once deployed).
    const publicUrl = `${apiBase}/analyze/${id}?shared=1`;

    // 1. Save to server (Supabase) so the link works off-device.
    if (!sharedUrl) {
      setSaving(true);
      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            analysis: record?.analysis,
            image: record?.image,
          }),
        });
        if (res.ok) {
          setSharedUrl(publicUrl);
        }
      } catch {
        /* server save optional — still allow local share */
      } finally {
        setSaving(false);
      }
    }

    const url = publicUrl;
    const text = parsed
      ? `Doctor Plant report — ${parsed.plantName}: ${parsed.healthStatus}. ${parsed.summary}`
      : "Doctor Plant health report";

    // 2. Native share sheet (best on mobile) — shares image + text + link.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const shareData: ShareData = { title: "Doctor Plant Report", text, url };
        // Attach the image file when available for a richer share.
        if (record?.image) {
          try {
            const blob = await (await fetch(record.image)).blob();
            const file = new File([blob], "plant-report.jpg", { type: "image/jpeg" });
            shareData.files = [file];
          } catch {
            /* image attach is optional */
          }
        }
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelling share or API error → fall through to clipboard.
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    // 3. Clipboard fallback (works on HTTPS / localhost).
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 4. Last resort: alert with the link.
      window.prompt("Copy this report link:", url);
    }
  };

  if (!record || !parsed) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <Leaf className="h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold">Report not found</h1>
        {searchParams.get("demo") && (
          <>
            <p className="max-w-md text-muted-c">
              This session can&apos;t restore the image. Results are stored on the
              same device. Go back and analyze a plant to get a report.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full btn-primary px-5 py-2.5 text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" /> Back to upload
            </Link>
          </>
        )}
        {!searchParams.get("demo") && (
          <p className="max-w-md text-muted-c">The report isn&apos;t on this device.</p>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-10">
      <nav className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-c"
        >
          <ArrowLeft className="h-4 w-4" /> New scan
        </Link>
        <button
          type="button"
          onClick={onShare}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium"
        >
          <Share2 className="h-4 w-4" />
          {saving ? "Saving…" : copied ? "Link copied" : "Share report"}
        </button>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* LEFT: image + report */}
        <div className="space-y-8">
          <div className="card overflow-hidden">
            {record.image ? (
              <div className="relative h-72 w-full">
                <Image
                  src={record.image}
                  alt="Analyzed plant"
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            ) : (
              <div className="flex h-72 w-full items-center justify-center bg-muted">
                <Leaf className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <section className="card p-6">
            <PlantHeader analysis={parsed} />
            <p className="mt-4 text-sm text-muted-c">{parsed.summary}</p>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold">Diseases</h2>
            <DiseaseCards diseases={parsed.diseases} />
          </section>

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold">Treatment plan</h2>
            <TreatmentPlan treatment={parsed.treatment} />
          </section>

          <section className="card p-6">
            <RecoveryTimeline recovery={parsed.recoveryEstimate} />
          </section>

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold">Care tips</h2>
            <CareTips tips={parsed.careTips} />
          </section>
        </div>

        {/* RIGHT: sticky chat */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ChatPanel analysisId={record.id} />
        </div>
      </div>
    </main>
  );
}
