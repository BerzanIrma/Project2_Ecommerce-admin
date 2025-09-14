import prismadb from "@/lib/prismadb";
import { OrdersClient } from "./components/client";
import { formatDateMDY, formatter } from "@/lib/utils";

interface OrdersPageProps {
    params: { storeId: string };
}

const OrdersPage = async ({ params }: OrdersPageProps) => {
    const { storeId } = params;
   
    let data: Array<{ id: string; products: string; phone: string; address: string; totalPrice: string; paid: boolean; createdAt: string }> = [];
    try {
        const orders = await prismadb.order.findMany({
            where: {
                storeId: storeId,
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        data = orders.map((order) => ({
            id: order.id,
            products: order.orderItems.map((item) => item.product.name).join(', '),
            phone: order.phone || '',
            address: order.address || '',
            totalPrice: formatter.format(
                order.orderItems.reduce((total, item) => {
                    return total + Number(item.product.price)
                }, 0)
            ),
            paid: order.isPaid,
            createdAt: formatDateMDY(order.createdAt)
        }));
    } catch (error) {
        console.error('Error fetching orders:', error);
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <OrdersClient data={data as any} />
            </div>
        </div>
    );
}

export default OrdersPage;


