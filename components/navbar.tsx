import { MainNav } from "@/components/main-nav";
import StoreSwitcher from "@/components/store-switcher";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { UserButton } from "./user-button";

const Navbar = async () => {
    await auth();

    const stores = await prismadb.store.findMany({
        orderBy: { createdAt: 'desc' },
    });
    const items = stores.map(s => ({ id: s.id, name: s.name }));

  return (
    <div>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
            <StoreSwitcher items={items} />
            <MainNav className="mx-6" />
         <div className="ml-auto flex items-center space-x-4">
             <UserButton />

         </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

