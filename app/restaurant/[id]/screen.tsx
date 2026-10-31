"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRestaurantPage, RestaurantPageData, Review } from "@/lib/api";

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="text-accent tracking-tight" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function RestaurantScreen({ id }: { id: number }) {
  const [data, setData] = useState<RestaurantPageData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getRestaurantPage(id).then((result) => {
      if (result.ok) setData(result.data);
      else setNotFound(result.notFound);
    }).catch(() => setFailed(true));
  }, [id]);

  if (notFound || failed) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-4 py-24 text-center">
        <p className="text-ink">{notFound ? "Restaurant not found." : "Something went wrong. Please refresh."}</p>
      </main>
    );
  }

  return (
    <div className="pb-28">
      {/* App header — the blurred bar from the design */}
      <header className="sticky top-0 z-20 border-b border-line bg-paper/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[560px] items-center gap-2 px-4">
          <Link href="/" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-line">
            ←
          </Link>
          <span className="text-sm font-bold tracking-tight text-ink">Zomato Lite</span>
        </div>
      </header>

      {/* 1. Banner — gradient scrim from the V2 design, name and area on it.
          No photo: we store no image facts, so none is pretended. */}
      <main className="mx-auto w-full max-w-[560px] px-4">
        <section className="relative mt-4 h-56 overflow-hidden rounded-xl bg-gradient-to-br from-[#5e0a16] via-[#8c1022] to-[#c22a3e] shadow-md">
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h1 className="text-2xl font-bold tracking-tight text-white">{data ? data.name : "…"}</h1>
            {data && (
              <p className="mt-0.5 text-sm text-white/75">
                {data.cuisine} · {data.area}
              </p>
            )}
          </div>
        </section>

        {/* 2. The average — arrived computed; this page prints it. Still no maths. */}
        <section className="mt-4 rounded-xl bg-card p-5 shadow-sm">
          <div className="flex items-baseline gap-3">
            <span data-testid="average-rating" className="text-5xl font-extrabold text-accent">
              {data ? (data.averageRating ?? "—") : "…"}
            </span>
            <span className="text-sm text-muted">
              {data ? `${data.totalReviews} ${data.totalReviews === 1 ? "review" : "reviews"}` : "…"}
            </span>
          </div>
        </section>

        {data && data.totalReviews === 0 ? (
          <section className="mt-4 rounded-xl border border-dashed border-line bg-card p-8 text-center shadow-sm">
            <p className="font-semibold text-ink">No reviews yet.</p>
            <p className="mt-1 text-sm text-muted">Be the first to tell it like it was.</p>
          </section>
        ) : (
          <>
            {/* 3. Latest review — the spotlight card, weighted like the design */}
            {data?.latestReview && (
              <article className="relative mt-4 rounded-xl border border-line border-l-4 border-l-accent bg-card p-5 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white">
                    Latest Customer Review
                  </span>
                  <StarRow rating={data.latestReview.rating} />
                </div>
                <p className="mt-3 leading-relaxed text-ink">{data.latestReview.comment}</p>
                <p className="mt-2 text-xs text-muted">{new Date(data.latestReview.createdAt).toLocaleString()}</p>
              </article>
            )}

            {/* 4. Older reviews, newest first — order came from the backend. */}
            {data && data.reviews.length > 0 && (
              <section className="mt-4 rounded-xl bg-card shadow-sm">
                <div className="divide-y divide-line">
                  {data.reviews.map((review) => (
                    <article key={review.id} className="p-5">
                      <div className="flex items-center gap-2">
                        <StarRow rating={review.rating} />
                        <span className="text-xs text-muted">{new Date(review.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-2 leading-relaxed text-ink">{review.comment}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Sticky action tray — the design's bottom bar; frontend prints, links, thinks nothing */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[560px] items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted">Visited recently?</p>
              <p className="truncate text-sm font-semibold text-ink">Share your dining story</p>
            </div>
            <Link
              href={`/review/${id}`}
              className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-95"
            >
              Write a Review
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
