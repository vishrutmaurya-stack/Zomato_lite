"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRestaurantPage, RestaurantPageData } from "@/lib/api";

export default function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const id = Number(restaurantId);
  const router = useRouter();

  const [info, setInfo] = useState<RestaurantPageData | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Whatever the backend returned for a failed attempt goes here, verbatim.
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRestaurantPage(id).then((result) => {
      if (result.ok) setInfo(result.data);
    }).catch(() => {});
  }, [id]);

  const canSubmit = rating >= 1 && comment.trim().length > 0 && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: id, rating, comment }),
      });
      const body: { success?: boolean; error?: string } = await res.json();

      if (res.status === 201) {
        router.push(`/restaurant/${id}`);
        return;
      }
      // Print the backend's own words. Never invent a message.
      setError(body.error ?? `Request failed (HTTP ${res.status}).`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <header className="sticky top-0 z-20 border-b border-line bg-paper/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[560px] items-center gap-2 px-4">
          <Link href={`/restaurant/${id}`} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-line">
            ←
          </Link>
          <span className="text-sm font-bold tracking-tight text-ink">Write Review</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[560px] px-4 pb-16 pt-4">
        {/* Restaurant summary — name, area, current rating, all from the GET API */}
        <section className="rounded-xl bg-card p-5 shadow-sm">
          <h1 className="truncate text-lg font-bold tracking-tight text-ink">
            {info ? info.name : "…"}
          </h1>
          {info && (
            <p className="mt-1 truncate text-sm text-muted">
              {info.cuisine} · {info.area}
              {info.averageRating !== null && ` · currently ${info.averageRating}★`}
            </p>
          )}
        </section>

        {/* Star picker — kindness validation; the backend re-checks, always. */}
        <section className="mt-4 rounded-xl bg-card p-5 shadow-sm">
          <label className="block text-sm font-medium text-ink">Your rating</label>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                onClick={() => setRating(star)}
                className={`h-11 w-11 rounded-lg border text-2xl transition-colors ${
                  star <= rating
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-card text-line hover:text-muted"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </section>

        {/* Comment box */}
        <section className="mt-4 rounded-xl bg-card p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <label htmlFor="comment" className="block text-sm font-medium text-ink">
              Your review
            </label>
            <span className="text-xs text-muted">{comment.length}/500</span>
          </div>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            maxLength={500}
            placeholder="What did you eat? How was the service?"
            className="mt-2 w-full resize-none rounded-lg border border-line bg-card p-3 text-[15px] leading-relaxed text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
        </section>

        {/* The backend's own error text, unmodified */}
        {error && (
          <p className="mt-4 rounded-lg border border-accent bg-accent-soft p-3 text-sm font-medium text-accent" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`mt-4 w-full rounded-lg px-5 py-3 text-sm font-semibold transition-colors ${
            canSubmit
              ? "bg-accent text-white shadow-md hover:opacity-95"
              : "cursor-not-allowed bg-line text-muted"
          }`}
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </main>
    </div>
  );
}
