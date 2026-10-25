import { sql } from "@/lib/db";

// GET /api/restaurants/[id] — everything the restaurant page needs, in one call.
// 404 if the restaurant does not exist. Otherwise:
// {
//   name, cuisine, area,
//   averageRating,   <- computed NOW: AVG(rating), rounded to 1 decimal
//   totalReviews,    <- computed NOW: COUNT(*)
//   latestReview,    <- newest by created_at
//   reviews          <- every review except the latest, newest first
// }
// With no reviews yet: averageRating null, totalReviews 0,
// latestReview null, reviews [] — absence, not a fake zero.

type ReviewRow = { id: number; rating: number; comment: string; created_at: string };

function toReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // The URL segment is text ("1", "abc", "1.5"). If it is not a whole
  // number, no restaurant can possibly match — skip straight to 404.
  const restaurantId = Number(id);
  if (!Number.isInteger(restaurantId)) {
    return Response.json({ error: "Restaurant not found." }, { status: 404 });
  }

  try {
    const restaurants = await sql`
      SELECT id, name, cuisine, area FROM restaurants WHERE id = ${restaurantId}
    `;
    if (restaurants.length === 0) {
      return Response.json({ error: "Restaurant not found." }, { status: 404 });
    }
    const restaurant = restaurants[0];

    // The two computed values — the whole intelligence of this product.
    // Facts are stored; answers are computed here, at the moment of asking.
    const stats = await sql`
      SELECT COUNT(*)::int AS total, AVG(rating) AS average
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
    `;
    const total = stats[0].total as number;
    const average = stats[0].average ?? null;

    // Newest review, exactly one. Shown separately, so the list below
    // must not repeat it — hence OFFSET 1.
    const latestRows = await sql`
      SELECT id, rating, comment, created_at
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `;

    const olderRows = await sql`
      SELECT id, rating, comment, created_at
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
      ORDER BY created_at DESC, id DESC
      OFFSET 1
    `;

    return Response.json({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating:
        average === null ? null : Math.round(Number(average) * 10) / 10,
      totalReviews: total,
      latestReview: latestRows.length > 0 ? toReview(latestRows[0]) : null,
      reviews: olderRows.map(toReview),
    });
  } catch (err) {
    console.error("GET /api/restaurants/[id] failed:", err);
    return Response.json(
      { error: "Something went wrong on our side. Please try again." },
      { status: 500 }
    );
  }
}
