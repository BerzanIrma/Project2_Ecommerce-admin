import prismadb from "@/lib/prismadb";
import { formatDateMDY } from "@/lib/utils";
import { Suspense } from "react";

import { SizesClient } from "./components/client";

interface SizesPageProps {
    params: {
        storeId: string;
    };
}

const SizesPage = async ({ params }: SizesPageProps) => {
    // Try DB, fallback to empty (client will load via API as needed)
    let sizes: Array<{ id: string; name: string; value: string; createdAt: string; updatedAt: string }>= [];
    try {
        const rows = await (prismadb as any).size.findMany({
            where: { storeId: params.storeId },
            orderBy: { createdAt: 'desc' },
        });
        sizes = rows.map((s: any) => ({
            id: s.id,
            name: s.name,
            value: s.value,
            createdAt: formatDateMDY(s.createdAt),
            updatedAt: formatDateMDY(s.updatedAt),
        }));
    } catch {}

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Suspense>
                    <SizesClient data={sizes} />
                </Suspense>
            </div>
        </div>
    );
}

export default SizesPage;





