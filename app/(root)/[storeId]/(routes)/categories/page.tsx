import { CategoriesClient } from "./components/client";

interface CategoriesPageProps {
    params: {
        storeId: string;
    };
}

const CategoriesPage = async ({ params }: CategoriesPageProps) => {
    // Defer fetching to client to avoid server Prisma dependency
    const formatted: any[] = [];
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CategoriesClient data={formatted as any} />
            </div>
        </div>
    );
}

export default CategoriesPage;

