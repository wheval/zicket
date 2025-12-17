import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explore Events",
    description: "Discover public and private events on Zicket.",
};

export default function ExplorePage() {
    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Explore Events</h1>
            <p>Coming soon...</p>
        </main>
    );
}
