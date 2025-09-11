import { ProductClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { formatter, formatDateMDY } from "@/lib/utils";

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
    params: { storeId: string };
}

const ProductsPage = async ({ params }: ProductsPageProps) => {
    try {
        const products = await (prismadb as any).product.findMany({
            where: { storeId: params.storeId },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              isFeatured: true,
              isArchived: true,
              price: true,
              createdAt: true,
              category: { select: { name: true } },
              size: { select: { name: true } },
              color: { select: { value: true } },
            }
        });
        const formatted = products.map((p: any) => ({
            id: p.id,
            name: p.name,
            isFeatured: !!p.isFeatured,
            isArchived: !!p.isArchived,
            price: formatter.format(Number(p.price ?? 0)),
            category: p.category?.name ?? "-",
            size: p.size?.name ?? "-",
            color: p.color?.value ?? "-",
            createdAt: formatDateMDY(p.createdAt),
        }));
        return (
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <ProductClient data={formatted} />
                </div>
            </div>
        );
    } catch {
        return (
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <ProductClient data={[]} />
                </div>
            </div>
        );
    }
}

export default ProductsPage;


