import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:3001",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
    try {
        console.log("🔄 Checkout request started");
        const { productIds } = await req.json();
        const { storeId } = await params; 
        
        console.log("📦 Product IDs:", productIds);
        console.log("🏪 Store ID:", storeId);

        if(!productIds || productIds.length === 0) {
            console.log("❌ No product IDs provided");
            return new NextResponse("Product ids are required", { status: 400 });
        }

        console.log("🔍 Fetching products from database...");
        const products = await prismadb.product.findMany({
            where: {
                id: { 
                    in: productIds
                }
            }
        });
        console.log("📋 Found products:", products.length);

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    products.forEach((product) => {
        line_items.push({
            quantity: 1,
            price_data: {
                currency: 'USD',
                product_data: {
                    name: product.name,
                },
                unit_amount: Math.round(Number(product.price) * 100)
            }
        });
    });

        console.log("💾 Creating order in database...");
        const order = await prismadb.order.create({
            data: {
                storeId: storeId,
                isPaid: false,
                orderItems: {
                    create: productIds.map((productId: string) => ({
                        product: {
                            connect: {
                                id: productId
                            }
                        }
                    }))
                }
            }
        });
        console.log("✅ Order created:", order.id);

        console.log("💳 Creating Stripe checkout session...");
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            billing_address_collection: "required",
            phone_number_collection: {
                enabled: true,
            },
            success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
            cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?cancelled=1`,
            metadata: {
                orderId: order.id
            }
        });
        console.log("✅ Stripe session created:", session.id);

        return NextResponse.json({ url: session.url }, {
            headers: corsHeaders,
        });
    } catch (error) {
        console.error("❌ Checkout error:", error);
        return new NextResponse(`Internal error: ${error}`, { status: 500 });
    }
}