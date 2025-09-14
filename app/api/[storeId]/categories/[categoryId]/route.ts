import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getCategoryById, updateCategory, deleteCategory, addCategory } from "@/lib/memory/categories";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    try {
      const category = await (prismadb as any).category.findFirst({
        where: { id: params.categoryId, storeId: params.storeId },
        select: { id: true, name: true, billboardId: true, createdAt: true, updatedAt: true }
         
      });
      if (!category) return new NextResponse('Not found', { status: 404 });
      return NextResponse.json(category);
    } catch (e) {
      const fallback = getCategoryById(params.storeId, params.categoryId);
      if (!fallback) return new NextResponse('Not found', { status: 404 });
      return NextResponse.json(fallback as any);
    }
  } catch (e) {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const body = await req.json();
    try {
      const updated = await (prismadb as any).category.update({
        where: { id: params.categoryId },
        data: { name: body.name, billboardId: body.billboardId },
        select: { id: true, name: true, billboardId: true, createdAt: true, updatedAt: true }
      });
      return NextResponse.json(updated);
    } catch (e) {
      // Fallback to memory upsert
      const existed = getCategoryById(params.storeId, params.categoryId);
      if (existed) {
        const upd = updateCategory(params.storeId, params.categoryId, { name: body.name, billboardId: body.billboardId });
        return NextResponse.json(upd as any);
      }
      const now = new Date().toISOString();
      const created = addCategory(params.storeId, {
        id: params.categoryId,
        name: body.name,
        billboardId: body.billboardId,
        storeId: params.storeId,
        createdAt: now,
        updatedAt: now,
      } as any);
      return NextResponse.json(created as any);
    }
  } catch (e) {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    try {
      await (prismadb as any).category.delete({ where: { id: params.categoryId } });
    } catch (e) {
      // Fallback to memory; even if not found, treat as idempotent delete
      try {
        deleteCategory(params.storeId, params.categoryId);
      } catch {}
    }
    // Always return OK to keep UI consistent/idempotent
    return new NextResponse('OK');
  } catch (e) {
    return new NextResponse('Internal error', { status: 500 });
  }
}


