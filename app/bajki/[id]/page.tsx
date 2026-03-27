import { redirect } from "next/navigation";

// Stary URL /bajki/[id] — przekieruj do nowej biblioteki
export default function LegacyBajkaPage({ params }: { params: { id: string } }) {
  redirect(`/biblioteka/${params.id}`);
}
