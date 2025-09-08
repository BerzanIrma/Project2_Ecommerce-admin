import prismadb from '@/lib/prismadb'

export default async function DashboardPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const store = await prismadb.store.findUnique({ where: { id: storeId } })

  return (
    <div className="p-0 m-0">
      <p className="text-sm">Active Store: {store?.name ?? 'Unknown'}</p>
    </div>
  );
}