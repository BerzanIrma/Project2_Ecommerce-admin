import { BillboardClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { formatDateMDY } from "@/lib/utils";

interface BillboardsPageProps {
    params: {
        storeId: string;
    };
}

const BillboardsPage = async ({ params }: BillboardsPageProps) => {
    console.log("BillboardsPage - Store ID:", params.storeId);

    const billboards = await prismadb.billboard.findMany({
        where: {
            storeId: params.storeId,
        },
        orderBy: {
            createdAt: 'desc',
        }
    });

    // Normalize dates to ISO strings to avoid hydration mismatches
    const formatted = billboards.map(b => ({
        id: b.id,
        label: b.label,
        imageUrl: b.imageUrl,
        createdAt: formatDateMDY(b.createdAt),
        updatedAt: formatDateMDY(b.updatedAt),
    }));

    console.log("BillboardsPage - Found billboards:", formatted.length);

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BillboardClient data={formatted} />
            </div>
        </div>
    );
}

export default BillboardsPage;