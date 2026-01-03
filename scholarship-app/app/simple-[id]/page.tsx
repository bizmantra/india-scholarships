export default async function SimplePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <div>Simple page: {id}</div>;
}
