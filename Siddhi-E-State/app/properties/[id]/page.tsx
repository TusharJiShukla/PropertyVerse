import PropertyDetailsClient from "./PropertyDetailsClient";

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PropertyDetailsClient id={resolvedParams.id} />;
}
