import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { SettingsForm } from "./components/settings-form";

interface SettingsPageProps {
  params: { storeId: string }
}


export default async function SettingsPage({ params }: SettingsPageProps) {
  await auth();

  const store = await prismadb.store.findUnique({
    where: { id: params.storeId }
  });
 
  // Dacă store nu există, păstrăm pagina pentru a evita redirect neprevăzut în dev

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={store} />
      </div>
    </div>
  );
}


