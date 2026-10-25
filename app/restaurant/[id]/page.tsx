import RestaurantScreen from "./screen";

// This screen renders per URL at request time; reader data is fetched by
// the client screen after load. The flag lives here because route segment
// config is only valid in a Server Component module.
export const instant = false;

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RestaurantScreen id={Number(id)} />;
}
