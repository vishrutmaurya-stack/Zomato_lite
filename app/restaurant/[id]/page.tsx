"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { getRestaurantPage, RestaurantPageData, Review } from "@/lib/api";

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="text-accent tracking-tight" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function ReviewCard({ review, latest = false }: { review: Review; latest?: boolean }) {
  if (latest) {
    return (
      <article className="rounded-lg border border-line border-l-4 border-l-accent bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-accent">
            Latest review
          </span>
          <StarRow rating={review.rating} />
        </div>
        <p className="mt-3 leading-relaxed text-ink">{review.comment}</p>
        <p className="mt-2 text-xs text-muted">{new Date(review.createdAt).toLocaleString()}</p>
      </article>
    );
  }
  return (
    <article className="border-t border-line py-4">
      <div className="flex items-center gap-2">
        <StarRow rating={review.rating} />
        <span className="text-xs text-muted">{new Date(review.createdAt).toLocaleString()}</span>
      </div>
      <p className="mt-2 leading-relaxed text-ink">{review.comment}</p>
    </article>
  );
}

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<RestaurantPageData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getRestaurantPage(Number(id)).then((result) => {
      if (result.ok) setData(result.data);
      else setNotFound(result.notFound);
    }).catch(() => setFailed(true));
  }, [id]);

  if (notFound) {
    return (
      <main className="mx-auto max-w-[560px] px-4 py-24 text-center">
        <p className="text-ink">Restaurant not found.</p>
      </main>
    );
  }
  if (failed) {
    return (
      <main className="mx-auto max-w-[560px] px-4 py-24 text-center">
        <p className="text-ink">Something went wrong. Please refresh.</p>
      </main>
    );
  }
  if (!data) {
    return (
      <main className="mx-auto max-w-[560px] px-4 py-24 text-center">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[560px] px-4 pb-16">
      {/* 1. Name, cuisine, area */}
      <header className="pt-10">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{data.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {data.cuisine} · {data.area}
        </p>
      </header>

      {/* 2. The average — the biggest thing on the page.
          It was computed by the backend (AVG), rounded to one decimal, and
          arrives finished. This screen prints data.averageRating. That is all. */}
      <section className="mt-8 flex items-baseline gap-3">
        <span data-testid="average-rating" className="text-6xl font-semibold text-accent">
          {data.averageRating ?? "—"}
        </span>
        <span className="text-sm text-muted">
          {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
        </span>
      </section>

      {data.totalReviews === 0 ? (
        /* The honest empty state: no facts yet, so no rating shown. */
        <section className="mt-10 rounded-lg border border-dashed border-line bg-card p-8 text-center">
          <p className="text-ink">No reviews yet.</p>
          <p className="mt-1 text-sm text-muted">Be the first to tell it like it was.</p>
        </section>
      ) : (
        <>
          {/* 3. The latest review — sits apart, always. */}
          <section className="mt-8">{data.latestReview && <ReviewCard review={data.latestReview} latest />}</section>

          {/* 4. Older reviews, newest first — order came from the backend. */}
          <section className="mt-10">
            {data.reviews.length === 0 ? (
              <p className="pt-4 text-sm text-muted">This restaurant has only one review so far.</p>
            ) : (
              <div>{data.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}</div>
            )}
          </section>
        </>
      )}

      {/* 5. The one action */}
      <Link
        href={`/review/${id}`}
        className="mt-10 inline-block rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        Write a review
      </Link>
    </main>
  );
}
