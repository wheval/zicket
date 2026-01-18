import { getNewsItems } from "@/lib/db/queries";
import { NewsPageClient } from "./news-page-client";

export default async function NewsPage() {
  const newsItems = await getNewsItems({ limit: 50 });
  return <NewsPageClient newsItems={newsItems} />;
}
