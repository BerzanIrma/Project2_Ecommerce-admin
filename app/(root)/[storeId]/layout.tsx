import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import prismadb from '@/lib/prismadb'
import CloseStoreModal from './close-store-modal'
import Navbar from '@/components/navbar'

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
    <>
      <Navbar />
      <CloseStoreModal />
      <div className="border-b" />
      <div className="mt-2">{children}</div>
    </>
  );
}


