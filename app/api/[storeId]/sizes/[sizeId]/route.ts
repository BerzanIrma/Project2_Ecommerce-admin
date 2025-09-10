import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getSizeById, updateSize, deleteSize, addSize } from "@/lib/memory/sizes";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    try {
      const size = await (prismadb as any).size.findFirst({
        where: { id: params.sizeId, storeId: params.storeId },
        select: { id: true, name: true, value: true, createdAt: true, updatedAt: true },
      });
      if (!size) return new NextResponse('Not found', { status: 404 });
      return NextResponse.json(size);
    } catch (e) {
      const fallback = getSizeById(params.storeId, params.sizeId);
      if (!fallback) return new NextResponse('Not found', { status: 404 });
      return NextResponse.json(fallback as any);
    }
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const body = await req.json();
    try {
      const updated = await (prismadb as any).size.update({
        where: { id: params.sizeId },
        data: { name: body.name, value: body.value },
        select: { id: true, name: true, value: true, createdAt: true, updatedAt: true },
      });
      return NextResponse.json(updated);
    } catch (e) {
      const existed = getSizeById(params.storeId, params.sizeId);
      if (existed) {
        const upd = updateSize(params.storeId, params.sizeId, { name: body.name, value: body.value });
        return NextResponse.json(upd as any);
      }
      const now = new Date().toISOString();
      const created = addSize(params.storeId, { id: params.sizeId, storeId: params.storeId, name: body.name, value: body.value, createdAt: now, updatedAt: now });
      return NextResponse.json(created as any);
    }
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    try {
      await (prismadb as any).size.delete({ where: { id: params.sizeId } });
    } catch (e) {
      try { deleteSize(params.storeId, params.sizeId); } catch {}
    }
    return new NextResponse('OK');
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}


