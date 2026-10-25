"use client";

import { useEffect, useState } from "react";
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
    // Fetching the summary card data from the same GET contract as the
    // restaurant page: name, cuisine, area, and its current average.
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
        // Success: show the reader page, which recomputes the average live.
        router.push(`/restaurant/${id}`);
        return;
      }
      // Failure: print the backend's own words. Never invent a message.
      setError(body.error ?? `Request failed (HTTP ${res.status}).`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-[560px] px-4 pb-16">
      {/* Restaurant name, so you know what you are reviewing */}
      <header className="pt-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {info ? info.name : "…"}
        </h1>
        {info && (
          <p className="mt-1 text-sm text-muted">
            {info.cuisine} · {info.area}
            {info.averageRating !== null && ` · currently ${info.averageRating}★`}
          </p>
        )}
      </header>

      {/* Star picker — kindness validation lives here in the UI.
          The backend will check again; it never trusts this screen. */}
      <section className="mt-8">
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
      <section className="mt-6">
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
        <p className="mt-4 rounded-lg border border-accent bg-accent-soft p-3 text-sm text-accent" role="alert">
          {error}
        </p>
      )}

      {/* Submit — disabled until a rating is picked and the comment is non-empty */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`mt-6 w-full rounded-lg px-5 py-3 text-sm font-medium transition-colors ${
          canSubmit
            ? "bg-accent text-white hover:opacity-90"
            : "cursor-not-allowed bg-line text-muted"
        }`}
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </main>
  );
}
