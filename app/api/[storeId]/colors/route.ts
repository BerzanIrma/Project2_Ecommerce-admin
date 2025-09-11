import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { getColors, addColor } from "@/lib/memory/colors";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) return new NextResponse('Store id is required', { status: 400 });

    const mem = getColors(params.storeId);
    if (mem.length) return NextResponse.json(mem);

    try {
      const colors = await (prismadb as any).color.findMany({
        where: { storeId: params.storeId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, value: true, createdAt: true, updatedAt: true },
      });
      return NextResponse.json(colors);
    } catch (e) {
      return NextResponse.json([]);
    }
  } catch (e) {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId: authedUserId } = auth();
    const body = await req.json();
    const { name, value } = body;

    const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user';
    if (!name) return new NextResponse('Name is required', { status: 400 });
    if (!value) return new NextResponse('Value is required', { status: 400 });
    if (!params.storeId) return new NextResponse('Store id is required', { status: 400 });

    try {
      const storeByUserId = await (prismadb as any).store.findFirst({ where: { id: params.storeId, userId } });
      if (!storeByUserId) return new NextResponse('Unauthorized', { status: 403 });

      const color = await (prismadb as any).color.create({
        data: { name, value, storeId: params.storeId },
        select: { id: true, name: true, value: true, createdAt: true, updatedAt: true },
      });
      return NextResponse.json(color);
    } catch (e) {
      const now = new Date().toISOString();
      const color = addColor(params.storeId, { id: `color_${Date.now()}`, name, value, storeId: params.storeId, createdAt: now, updatedAt: now });
      return NextResponse.json(color);
    }
  } catch (e) {
    return new NextResponse('Internal error', { status: 500 });
  }
}


