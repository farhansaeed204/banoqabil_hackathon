"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera,
  ImagePlus,
  Loader2,
  Leaf,
  UploadCloud,
  ScanSearch,
  Bot,
  Share2,
  ArrowRight,
  Sparkles,
  Sprout,
} from "lucide-react";

import {
  compressImage,
  previewUrl,
  validateImageFile,
} from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const acceptFile = useCallback((f: File) => {
    const err = validateImageFile(f);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setFile(f);
    setPreview(previewUrl(f));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) acceptFile(f);
    },
    [acceptFile]
  );

  const onAnalyze = async () => {
    if (!file) {
      setError("Select an image first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Compress image for fast upload + small localStorage footprint.
      const compressed = await compressImage(file, 1000, 0.75);
      const compressedBlob = await (await fetch(compressed)).blob();
      const compressedFile = new File(
        [compressedBlob],
        file.name,
        { type: "image/jpeg" }
      );

      const form = new FormData();
      form.append("image", compressedFile);
      form.append("name", file.name);

      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      // Store compressed image in localStorage history (fits quota).
      const { id, analysis, demo } = data;
      const record = {
        id,
        image: compressed,
        demoKey: demo ? file.name : undefined,
        analysis,
        createdAt: Date.now(),
      };
      const existing = JSON.parse(localStorage.getItem("doctor_plant_history") || "[]");
      existing.push(record);
      localStorage.setItem("doctor_plant_history", JSON.stringify(existing.slice(-8)));

      router.push(`/analyze/${id}?demo=${String(Boolean(demo))}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, var(--color-secondary) 0, transparent 45%), radial-gradient(circle at 80% 40%, var(--color-primary) 0, transparent 50%)",
          }}
        />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium">
            <Leaf className="h-4 w-4 text-primary" />
            AI-powered plant care for farmers &amp; gardeners
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold sm:text-6xl">
            Is your plant healthy?{" "}
            <span className="text-primary">Upload a photo to find out.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-c">
            Snap any plant, fruit, flower or tree. Doctor Plant identifies it,
            checks its health, spots diseases, and gives you a treatment plan with
            recovery estimates — in seconds.
          </p>

          {/* UPLOAD ZONE */}
          <div className="mt-10 w-full max-w-2xl">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`card card-organic flex flex-col items-center justify-center gap-3 p-10 text-center transition ${
                dragging ? "ring-2 ring-primary" : ""
              }`}
            >
              {preview ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-56 w-56 overflow-hidden rounded-2xl">
                    <Image
                      src={preview as string}
                      alt="Plant preview"
                      fill
                      className="object-cover"
                      sizes="224px"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="text-sm font-medium text-muted-c underline underline-offset-4"
                  >
                    Remove &amp; choose another
                  </button>
                </div>
              ) : (
                <>
                  <div className="rounded-full bg-muted p-4">
                    <UploadCloud className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-lg font-semibold">
                    Drag &amp; drop your plant photo here
                  </p>
                  <p className="text-sm text-muted-c">
                    or choose a file (JPEG, PNG, WebP — max 10MB)
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-full btn-primary px-5 py-2.5 text-sm font-semibold"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Browse files
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground"
                      aria-label="Take a photo with your camera"
                    >
                      <Camera className="h-4 w-4" />
                      Camera
                    </button>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) acceptFile(f);
                  e.currentTarget.value = "";
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) acceptFile(f);
                  e.currentTarget.value = "";
                }}
              />

              {error && (
                <p className="mt-2 text-sm font-medium text-danger">{error}</p>
              )}

              {file && !loading && (
                <button
                  type="button"
                  onClick={onAnalyze}
                  className="mt-4 inline-flex items-center gap-2 rounded-full btn-primary px-7 py-3 text-base font-semibold"
                >
                  <Sparkles className="h-5 w-5" />
                  Analyze plant
                </button>
              )}
              {loading && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-7 py-3 text-base font-semibold text-muted-c">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing…
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / HOW IT WORKS */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold">
            Farming shouldn&apos;t be guesswork
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-c">
            Crop failure often starts with a small problem you can&apos;t see.
            Doctor Plant gives you answers you can act on today.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="card p-6">
              <ScanSearch className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Identify</h3>
              <p className="mt-2 text-sm text-muted-c">
                Know the plant and whether it&apos;s healthy, showing early stress,
                or actively diseased.
              </p>
            </div>
            <div className="card p-6">
              <Bot className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Diagnose</h3>
              <p className="mt-2 text-sm text-muted-c">
                Get specific disease names, severity, symptoms, and a suggested
                treatment with dosages.
              </p>
            </div>
            <div className="card p-6">
              <Sprout className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Recover</h3>
              <p className="mt-2 text-sm text-muted-c">
                Follow the recovery plan with realistic time estimates and care
                tips — then chat to ask follow-ups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION: CHAT + SHARE */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">
              Not sure about the next step? Ask.
            </h2>
            <ul className="mt-6 space-y-4 text-muted-c">
              <li className="flex items-start gap-2">
                <Bot className="mt-0.5 h-5 w-5 text-primary" />
                Chat about your specific analysis — &quot;Is neem oil enough?&quot;
              </li>
              <li className="flex items-start gap-2">
                <Leaf className="mt-0.5 h-5 w-5 text-primary" />
                General plant care Q&amp;A backed by a curated knowledge base.
              </li>
              <li className="flex items-start gap-2">
                <Share2 className="mt-0.5 h-5 w-5 text-primary" />
                Share your health report with your fellow farmers via a link.
              </li>
            </ul>
          </div>
          <div className="card card-organic p-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold">Doctor Plant Assistant</span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl rounded-tl-sm bg-muted p-3">
                Your tomato looks like early blight. Symptoms are consistent.
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary p-3 text-on-primary">
                Can I treat it with neem oil?
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted p-3">
                Yes — mix 5 ml per litre and spray every 7–10 days in the evening.
                It&apos;s slower than copper but organic and bee-safe.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold">Loved by growers</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                quote:
                  "Caught blight on my tomatoes a week early. The treatment plan saved my crop.",
                name: "Ahmed R., Tomato Farmer",
              },
              {
                quote:
                  "I'm new to plants. The chat answers like a friendly expert, not a robot.",
                name: "Sara K., Home Gardener",
              },
              {
                quote:
                  "The recovery estimate told me exactly what to expect. No more guessing.",
                name: "Usman T., Orchard Owner",
              },
            ].map((t) => (
              <figure key={t.name} className="card p-6">
                <blockquote className="text-muted-c">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 font-semibold">{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold">
            Your plant&apos;s health check is one photo away
          </h2>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreview(null);
              fileInputRef.current?.click();
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full btn-accent px-7 py-3 text-base font-semibold"
          >
            <ArrowRight className="h-5 w-5" />
            Upload a plant now
          </button>
        </div>
      </section>
    </main>
  );
}
