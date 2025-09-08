import { auth } from '@clerk/nextjs/server'
import prismadb from '@/lib/prismadb'
import OpenStoreModal from './open-store-modal'
import RedirectToStore from './redirect-to-store'

export default async function RootPage() {
  const { userId: authedUserId } = await auth()
  const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user'

  const store = await prismadb.store.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  // Randează întotdeauna redirectorul client-side (preferă lastStoreId din localStorage)
  // Dacă nu există store în DB pentru user, afișează și caseta.
  return (
    <>
      <RedirectToStore defaultStoreId={store?.id ?? ''} />
      {!store && <OpenStoreModal />}
    </>
  )
}


