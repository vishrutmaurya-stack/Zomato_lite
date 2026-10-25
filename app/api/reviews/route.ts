import { sql } from "@/lib/db";

// POST /api/reviews — save one review.
// In:  { "restaurantId": 1, "rating": 4, "comment": "Good, but slow service" }
// Out: 201 { "success": true, "reviewId": 104 }
//      400 { "error": "<plain English reason>" }
export async function POST(request: Request) {
  // Parse the body. If it is not JSON at all, that is also a 400.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body was not valid JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "The request body was not valid JSON." }, { status: 400 });
  }
  const { restaurantId, rating, comment } = body as Record<string, unknown>;

  // Check 1 — rating is an integer from 1 to 5.
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 }
    );
  }

  // Check 2 — comment is non-empty after trimming whitespace.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return Response.json(
      { error: "Please write a comment before submitting." },
      { status: 400 }
    );
  }

  // Check 3 — the restaurant must actually exist. (Database lookup.)
  try {
    const found = await sql`SELECT id FROM restaurants WHERE id = ${Number(restaurantId)}`;
    if (found.length === 0) {
      return Response.json({ error: "That restaurant does not exist." }, { status: 400 });
    }

    // All checks passed. Write exactly one row. Change nothing else.
    const inserted = await sql`
      INSERT INTO reviews (restaurant_id, rating, comment)
      VALUES (${Number(restaurantId)}, ${rating}, ${comment.trim()})
      RETURNING id
    `;
    return Response.json({ success: true, reviewId: inserted[0].id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews failed:", err);
    return Response.json(
      { error: "Something went wrong on our side. Please try again." },
      { status: 500 }
    );
  }
}
