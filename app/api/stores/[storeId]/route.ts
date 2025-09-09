import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId: authedUserId } = auth();
        const body = await req.json();
        const { name } = body;

        const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user';

        if (!name) {
            return new NextResponse('Name is required', { status: 400 });
        }

        if (!params.storeId) {
            return new NextResponse('Store id is required', { status: 400 });
        }

        const store = await prismadb.store.updateMany({
            where: {
                id: params.storeId,
                userId,
            },
            data: {
                name,
            }
        });

        return NextResponse.json(store);
    } catch (error) {
        console.log('[STORES_PATCH]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId: authedUserId } = auth();

        const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user';

        if (!params.storeId) {
            return new NextResponse('Store id is required', { status: 400 });
        }

        const store = await prismadb.store.deleteMany({
            where: {
                id: params.storeId,
                userId,
            }
        });

        return NextResponse.json(store);
    } catch (error) {
        console.log('[STORES_DELETE]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}