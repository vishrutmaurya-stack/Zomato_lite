# V2 Backlog — deferred, not rejected

Session date: 2026-10-25. Source: Stitch design handoff for "Restaurant Details —
Populated" (stored at `design/stitch-reference.txt`).

Decision made this session: **V1 ships per the original PRD** (quiet styling, no
gradients, no shadows, no purple, one warm accent, ~560px column). Items below are
deliberately deferred to V2, together with the product questions each one forces
us to answer first.

## Design direction (V2 look)

**Shipped 2026-10-31** (V2 design commit): lavender-tinted surface (#faf8ff) and
Plus Jakarta Sans typeface; gradient name banner; blurred app headers; soft card
shadows; sticky bottom "Write a Review" bar. Feature items below remain parked —
they need new data and product decisions first.

## Features (each needs a data decision first)

- Reviewer names on reviews -> needs `author_name` column + form field
  (Question: do we want anonymous reviews, and who owns a "reviewer identity"?)
- Restaurant attributes (open hours, price tier, attributes like "Cleanliness
  Inspected") -> needs new columns / a separate attributes table
  (Question: who maintains these facts, and how do they go stale?)
- Ratings-breakdown chart -> forbidden in V1 by spec; needs per-star aggregation
  (Question: does a breakdown chart actually change booking decisions, or is the
  average + latest review enough signal?)
- Review photos -> whole subsystem: upload, storage bucket, moderation
  (Question: what does a bad photo cost us operationally?)
- Helpful/upvotes -> needs an upvotes table; currently impossible honestly
  because we have no user accounts to prevent upvote spam
  (Question: auth first or upvotes first? Note the dependency.)
- Reorder rate / "Top rated in area" claims -> legitimacy problem: cannot
  fabricate; would need order or external data we do not collect
- Gamification (karma, badges) -> full product area; explicitly out of V1
- Offline drafts / localStorage autosave -> sync-conflict engineering, heavy
  (Question: is review-writing abandonment actually a measured problem yet?)
- Filter chips / front-end sorting -> backend query parameters or separate
  endpoints after we outgrow "one restaurant"
- Bookmark / share / profile -> depends entirely on an accounts decision,
  which V1 forbids

## Standing rule

Nothing in this file may slip into V1 silently. Adding any item here is a
versioned scope decision, made deliberately and dated.
