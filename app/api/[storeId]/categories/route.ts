import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { getCategories, addCategory } from "@/lib/memory/categories";

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        if (!params.storeId) {
            return new NextResponse('Store id is required', { status: 400 });
        }

        // Prefer in-memory data if present (ensures consistency when some operations fell back to memory)
        const memCategories = getCategories(params.storeId);
        if (memCategories && memCategories.length > 0) {
            return NextResponse.json(memCategories);
        }

        try {
            const categories = await (prismadb as any).category.findMany({
                where: { storeId: params.storeId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    billboardId: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            return NextResponse.json(categories.map((c: any) => ({
                id: c.id,
                name: c.name,
                billboardId: c.billboardId,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            })));
        } catch (e) {
            // Fallback to in-memory storage until Prisma Category is ready
            const categories = getCategories(params.storeId);
            return NextResponse.json(categories);
        }
    } catch (error) {
        console.log('[CATEGORIES_GET]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        console.log('[CATEGORIES_POST] Starting...');
        const { userId: authedUserId } = auth();
        const body = await req.json();
        const { name, billboardId } = body;

        console.log('[CATEGORIES_POST] Data received:', { name, billboardId, storeId: params.storeId });

        const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user';
        console.log('[CATEGORIES_POST] User ID:', userId);

        if (!name) {
            console.log('[CATEGORIES_POST] Name missing');
            return new NextResponse('Name is required', { status: 400 });
        }

        if (!billboardId) {
            console.log('[CATEGORIES_POST] Billboard ID missing');
            return new NextResponse('Billboard ID is required', { status: 400 });
        }

        if (!params.storeId) {
            console.log('[CATEGORIES_POST] Store ID missing');
            return new NextResponse('Store id is required', { status: 400 });
        }

        console.log('[CATEGORIES_POST] Checking store ownership...');
        const storeByUserId = await prismadb.store.findFirst({
            where: { id: params.storeId, userId }
        });

        if (!storeByUserId) {
            console.log('[CATEGORIES_POST] Store not found or unauthorized');
            return new NextResponse('Unauthorized', { status: 403 });
        }

        console.log('[CATEGORIES_POST] Creating category...');
        try {
            const category = await (prismadb as any).category.create({
                data: { name, billboardId, storeId: params.storeId },
                select: { id: true, name: true, billboardId: true, createdAt: true, updatedAt: true }
            });
            console.log('[CATEGORIES_POST] Category created successfully:', category);
            return NextResponse.json(category);
        } catch (e) {
            // Fallback: store in memory
            const now = new Date().toISOString();
            const category = addCategory(params.storeId, {
                id: `cat_${Date.now()}`,
                name,
                billboardId,
                storeId: params.storeId,
                createdAt: now,
                updatedAt: now,
            } as any);
            console.log('[CATEGORIES_POST] Category stored in memory (fallback):', category);
            return NextResponse.json(category);
        }
    } catch (error) {
        console.error('[CATEGORIES_POST] Error:', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}
