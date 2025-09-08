import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import prismadb from '@/lib/prismadb'
import CloseStoreModal from './close-store-modal'

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params
  const store = await prismadb.store.findUnique({ where: { id: storeId } })

  if (!store) {
    redirect('/')
  }

  return (
    <div>
      <div className="p-0 text-sm font-normal">This will be a Navbar</div>
      <CloseStoreModal />
      <div className="mt-2">{children}</div>
    </div>
  );
}


