import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getColorById, updateColor, deleteColor, addColor } from "@/lib/memory/colors";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    try {
      const color = await (prismadb as any).color.findFirst({
        where: { id: params.colorId, storeId: params.storeId },
        select: { id: true, name: true, value: true, createdAt: true, updatedAt: true },
      });
      if (!color) return new NextResponse('Not found', { status: 404 });
      return NextResponse.json(color);
    } catch (e) {
      const fallback = getColorById(params.storeId, params.colorId);
      if (!fallback) return new NextResponse('Not found', { status: 404 });
      return NextResponse.json(fallback as any);
    }
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const body = await req.json();
    try {
      const updated = await (prismadb as any).color.update({
        where: { id: params.colorId },
        data: { name: body.name, value: body.value },
        select: { id: true, name: true, value: true, createdAt: true, updatedAt: true },
      });
      return NextResponse.json(updated);
    } catch (e) {
      const existed = getColorById(params.storeId, params.colorId);
      if (existed) {
        const upd = updateColor(params.storeId, params.colorId, { name: body.name, value: body.value });
        return NextResponse.json(upd as any);
      }
      const now = new Date().toISOString();
      const created = addColor(params.storeId, { id: params.colorId, storeId: params.storeId, name: body.name, value: body.value, createdAt: now, updatedAt: now });
      return NextResponse.json(created as any);
    }
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    try {
      await (prismadb as any).color.delete({ where: { id: params.colorId } });
      return new NextResponse('OK');
    } catch (e) {
      const deleted = deleteColor(params.storeId, params.colorId);
      if (!deleted) return new NextResponse('Not found', { status: 404 });
      return new NextResponse('OK');
    }
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}


