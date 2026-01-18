import { getTickets } from "@/lib/db/queries";
import { ExplorePageClient } from "./explore-page-client";

export default async function ExplorePage() {
  const tickets = await getTickets({ limit: 100, orderByPopularity: true });
  return <ExplorePageClient tickets={tickets} />;
}
