import { BillboardClient } from "./components/client";
import prismadb from "@/lib/prismadb";

interface BillboardsPageProps {
    params: {
        storeId: string;
    };
}

const BillboardsPage = async ({ params }: BillboardsPageProps) => {
    const billboards = await prismadb.billboard.findMany({
        where: {
            storeId: params.storeId,
        },
        orderBy: {
            createdAt: 'desc',
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BillboardClient data={billboards} />
            </div>
        </div>
    );
}

export default BillboardsPage;