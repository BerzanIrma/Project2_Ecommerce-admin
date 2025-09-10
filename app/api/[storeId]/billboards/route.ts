import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        if (!params.storeId) {
            return new NextResponse('Store id is required', { status: 400 });
        }

        // Return compact list without large image data URIs
        const billboards = await prismadb.billboard.findMany({
            where: {
                storeId: params.storeId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                label: true,
                createdAt: true,
                updatedAt: true,
                // Exclude imageUrl to avoid huge base64 payloads in list view
            }
        });

        return NextResponse.json(billboards);
    } catch (error) {
        console.log('[BILLBOARDS_GET]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        console.log('[BILLBOARDS_POST] Starting...');
        const { userId: authedUserId } = auth();
        const body = await req.json();
        const { label, imageUrl } = body;

        console.log('[BILLBOARDS_POST] Data received:', { label, imageUrl, storeId: params.storeId });

        const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user';
        console.log('[BILLBOARDS_POST] User ID:', userId);

        if (!label) {
            console.log('[BILLBOARDS_POST] Label missing');
            return new NextResponse('Label is required', { status: 400 });
        }

        if (!imageUrl) {
            console.log('[BILLBOARDS_POST] Image URL missing');
            return new NextResponse('Image URL is required', { status: 400 });
        }

        if (!params.storeId) {
            console.log('[BILLBOARDS_POST] Store ID missing');
            return new NextResponse('Store id is required', { status: 400 });
        }

        console.log('[BILLBOARDS_POST] Checking store ownership...');
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            }
        });

        if (!storeByUserId) {
            console.log('[BILLBOARDS_POST] Store not found or unauthorized');
            return new NextResponse('Unauthorized', { status: 403 });
        }

        console.log('[BILLBOARDS_POST] Creating billboard...');
        const billboard = await prismadb.billboard.create({
            data: {
                label,
                imageUrl,
                storeId: params.storeId,
            }
        });

        console.log('[BILLBOARDS_POST] Billboard created successfully:', billboard);
        return NextResponse.json(billboard);
    } catch (error) {
        console.error('[BILLBOARDS_POST] Error:', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}