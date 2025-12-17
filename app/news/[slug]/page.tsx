import type { Metadata } from "next";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    // Format slug to title case for display
    const title = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return {
        title: title,
        description: `Read the latest about ${title} on Zicket.`,
    };
}

export default async function NewsDetailPage({ params }: Props) {
    const { slug } = await params;
    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">News: {slug}</h1>
            <p>Content for {slug}...</p>
        </main>
    );
}
