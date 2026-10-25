import ReviewForm from "./form";

// Per-URL rendering at request time; the interactive form is a client
// component fetched below. Server owners may set route segment config.
export const instant = false;

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  return <ReviewForm restaurantId={restaurantId} />;
}
