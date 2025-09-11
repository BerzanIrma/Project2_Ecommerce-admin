import { Suspense } from "react";
import prismadb from "@/lib/prismadb";
import { ColorsClient } from "./components/client";
import { formatDateMDY } from "@/lib/utils";

interface ColorsPageProps {
    params: { storeId: string };
}

const ColorsPage = async ({ params }: ColorsPageProps) => {
    let colors: Array<{ id: string; name: string; value: string; createdAt: string; updatedAt: string }>= [];
    try {
        const rows = await (prismadb as any).color.findMany({
            where: { storeId: params.storeId },
            orderBy: { createdAt: 'desc' },
        });
        colors = rows.map((c: any) => ({
            id: c.id,
            name: c.name,
            value: c.value,
            createdAt: formatDateMDY(c.createdAt),
            updatedAt: formatDateMDY(c.updatedAt),
        }));
    } catch {}

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Suspense>
                    <ColorsClient data={colors} />
                </Suspense>
            </div>
        </div>
    );
}

export default ColorsPage;


