// The shape of GET /api/restaurants/[id]'s response — written down once so
// both screens share one contract. averageRating arrives already computed:
// the frontend prints it, and does no maths of its own. Ever.

export type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

export type RestaurantPageData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

export type RestaurantResult =
  | { ok: true; data: RestaurantPageData }
  | { ok: false; notFound: boolean };

export async function getRestaurantPage(id: number): Promise<RestaurantResult> {
  const res = await fetch(`/api/restaurants/${id}`);
  if (res.status === 404) return { ok: false, notFound: true };
  if (!res.ok) return { ok: false, notFound: false };
  return { ok: true, data: (await res.json()) as RestaurantPageData };
}
