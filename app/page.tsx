"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRestaurantPage, RestaurantPageData } from "@/lib/api";

// Root = a doorway, not a listing (there is exactly one restaurant).
// Name and rating arrive from the API; this screen prints and links.
export default function Home() {
  const [info, setInfo] = useState<RestaurantPageData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getRestaurantPage(1)
      .then((result) => {
        if (result.ok) setInfo(result.data);
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-4">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        {info ? info.name : "Zomato Lite"}
      </h1>
      {info && (
        <p className="mt-1 text-sm text-muted">
          {info.cuisine} · {info.area}
          {info.averageRating !== null && ` · ${info.averageRating}★`}
        </p>
      )}
      <Link
        href="/restaurant/1"
        className="mt-6 inline-block w-fit rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        View the restaurant
      </Link>
      {failed && (
        <p className="mt-3 text-xs text-muted">
          Live details are unavailable right now — the button still works.
        </p>
      )}
    </main>
  );
}
