
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function POST(
    req: Request,
) {
    try {
      const { userId: authedUserId } = auth();
      const body = await req.json();
      const { name } = body;

        const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user';

       if (!name) {
        return new NextResponse('Name is required', {status: 400});
       }

        const store = await prismadb.store.create({
            data: {
                name,
                userId,
            }
        });

        return NextResponse.json(store);
    } catch (error) {
     console.log('[STORES_POST]', error);
     return new NextResponse('Internal error', {status: 500});
    }
}

export async function GET() {
    try {
        // DEV: listare publică pentru debug
        const stores = await prismadb.store.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(stores);
    } catch (error) {
        console.log('[STORES_GET]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}