import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { billboardId: string } }
) {
    try {
        const { userId: authedUserId } = await auth();

        const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user';

        if (!params.billboardId) {
            return new NextResponse('Billboard id is required', { status: 400 });
        }
       
        const billboard = await prismadb.billboard.findUnique({
            where: {
                id: params.billboardId,
            }
        });

        return NextResponse.json(billboard);
    } catch (error) {
        console.log('[BILLBOARD_GET]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, billboardId: string } }
) {
    try {
        const { userId: authedUserId } = await auth();
        const body = await req.json();
        const { label, imageUrl } = body;

        const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user';

         if (!userId) {
            return new NextResponse('Unauthenticated', { status: 400 });
        }

        if (!label) {
            return new NextResponse('Label is required', { status: 400 });
        }

         if (!imageUrl) {
            return new NextResponse('Image URL is required', { status: 400 });
        }

        if (!params.billboardId) {
            return new NextResponse('Billboard id is required', { status: 400 });
        }
 
          const storeRecord = await prismadb.store.findFirst({
        where:{
            id: params.storeId,
            ...(process.env.NODE_ENV === 'production' ? { userId } : {})
        }
       });
       if (!storeRecord) {
        return new NextResponse(process.env.NODE_ENV === 'production' ? 'Unauthorized' : 'Store not found', {status: 403});
       }
        // Ensure the billboard exists and belongs to this store
        const existing = await prismadb.billboard.findFirst({
          where: { id: params.billboardId, storeId: params.storeId }
        });
        if (!existing) {
          return new NextResponse('Billboard not found', { status: 404 });
        }

        const billboard = await prismadb.billboard.update({
          where: { id: params.billboardId },
          data: { label, imageUrl }
        });

        return NextResponse.json(billboard);
    } catch (error) {
        console.log('[BILLBOARD_PATCH]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, billboardId: string } }
) {
    try {
        const { userId: authedUserId } = await auth();

        const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user';

          if (!userId) {
            return new NextResponse('Unauthenticated', { status: 400 });
        }

        if (!params.billboardId) {
            return new NextResponse('Billboard id is required', { status: 400 });
        }
       const storeRecord = await prismadb.store.findFirst({
        where:{
            id: params.storeId,
            ...(process.env.NODE_ENV === 'production' ? { userId } : {})
        }
       });
       if (!storeRecord) {
        return new NextResponse(process.env.NODE_ENV === 'production' ? 'Unauthorized' : 'Store not found', {status: 403});
       }
        const billboard = await prismadb.billboard.deleteMany({
            where: {
                id: params.billboardId,
            }
        });

        return NextResponse.json(billboard);
    } catch (error) {
        console.log('[BILLBOARD_DELETE]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}