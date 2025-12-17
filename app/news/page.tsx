import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Latest News",
    description: "Stay updated with the latest news from Zicket.",
};

export default function NewsPage() {
    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Latest News</h1>
            <p>Coming soon...</p>
        </main>
    );
}
