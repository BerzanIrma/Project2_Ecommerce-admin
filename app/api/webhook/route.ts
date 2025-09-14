import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request){
    try {
        console.log("🔔 Webhook received");
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get("Stripe-Signature") as string;

        let event: Stripe.Event;

        try{
            event=stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            )
        } catch(error: any){
            console.error("❌ Webhook signature verification failed:", error.message);
            return new NextResponse(`Webhook Error: ${error.message}`, {status: 400});
        }

        console.log("✅ Webhook event type:", event.type);

    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.customer_details?.address;

    const addressComponents = [
        address?.line1,
         address?.line2,
          address?.city,
           address?.state,
            address?.postal_code,
             address?.country,
    ];
    
    const addressString = addressComponents.filter((c) => c !==null).join(`, `);

        if (event.type === "checkout.session.completed"){
            console.log("💳 Processing checkout.session.completed");
            console.log("📋 Order ID:", session?.metadata?.orderId);
            console.log("📞 Phone:", session?.customer_details?.phone);
            console.log("🏠 Address:", addressString);

            const order = await prismadb.order.update({
                where: {
                    id: session?.metadata?.orderId,
                },
                data:{
                    isPaid: true,
                    address: addressString,
                    phone: session?.customer_details?.phone || ''
                },
                include: {
                    orderItems: true,
                }
            });

            console.log("✅ Order updated:", order.id);

            const productIds = order.orderItems.map((orderItem)=> orderItem.productId);
            console.log("📦 Product IDs to archive:", productIds);
         
            await prismadb.product.updateMany({
                where: {
                    id: {
                        in: productIds
                    }
                },
                data:{
                    isArchived: true
                }
            });

            console.log("✅ Products archived");
        }

        return new NextResponse(null, {status: 200 });
    } catch (error) {
        console.error("❌ Webhook error:", error);
        return new NextResponse(`Webhook Error: ${error}`, {status: 500});
    }
}