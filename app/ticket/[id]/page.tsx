import type { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Ticket #${id}`,
        description: `Details for ticket ${id} on Zicket.`,
    };
}

export default async function TicketDetailPage({ params }: Props) {
    const { id } = await params;
    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Ticket #{id}</h1>
            <p>Displaying details for ticket ID: {id}</p>
        </main>
    );
}
