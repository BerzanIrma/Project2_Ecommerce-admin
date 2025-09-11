import prismadb from "@/lib/prismadb";
import { OrdersClient } from "./components/client";
import { formatDateMDY, formatter } from "@/lib/utils";

interface OrdersPageProps {
    params: { storeId: string };
}

const OrdersPage = async ({ params }: OrdersPageProps) => {
   
    let data: Array<{ id: string; products: string; phone: string; address: string; totalPrice: string; paid: boolean; createdAt: string }> = [];
    try {
      
    } catch {}

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <OrdersClient data={data as any} />
            </div>
        </div>
    );
}

export default OrdersPage;


