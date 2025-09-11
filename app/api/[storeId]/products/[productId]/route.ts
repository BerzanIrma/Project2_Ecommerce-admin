import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from '@clerk/nextjs/server'
import { getProductById } from "@/lib/memory/products";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    try {
      const product = await (prismadb as any).product.findUnique({
        where: { id: params.productId },
        include: { images: true, category: true, size: true, color: true },
      });
      if (!product) return new NextResponse('Not found', { status: 404 });
      return NextResponse.json(product);
    } catch {}
    const fallback = getProductById(params.storeId, params.productId);
    if (!fallback) return new NextResponse('Not found', { status: 404 });
    return NextResponse.json(fallback as any);
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId: authedUserId } = await auth();
    const body = await req.json();
    const { storeId, productId } = params;

    const {
      name,
      price,
      categoryId,
      colorId,
      sizeId,
      images,
      isFeatured,
      isArchived
    } = body;

    const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? 'dev-user';

    if (!productId) return new NextResponse("Product id is required", { status: 400 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!price) return new NextResponse("Price is required", { status: 400 });
    if (!categoryId) return new NextResponse("Category id is required", { status: 400 });
    if (!colorId) return new NextResponse("Color id is required", { status: 400 });
    if (!sizeId) return new NextResponse("Size id is required", { status: 400 });
    if (!images || !images.length) return new NextResponse("Image is required", { status: 400 });

    try {
      const storeByUserId = await prismadb.store.findFirst({ where: { id: storeId, userId } });
      if (!storeByUserId && process.env.NODE_ENV === 'production') return new NextResponse('Unauthorized', { status: 403 });
    } catch {}

    await prismadb.product.update({
      where: { id: productId },
      data: {
        name,
        price: typeof price === 'number' ? price : parseFloat(String(price)),
        isFeatured: !!isFeatured,
        isArchived: !!isArchived,
        categoryId,
        sizeId,
        colorId,
        storeId,
        images: { deleteMany: {} },
      }
    });

    const normalizedImages = (images || []).map((im: any) => ({ url: typeof im === 'string' ? im : String(im?.url || '') })).filter((x) => !!x.url);
    const product = await prismadb.product.update({
      where: { id: productId },
      data: {
        images: {
          createMany: {
            data: normalizedImages,
          }
        }
      },
      include: { images: true, category: true, size: true, color: true },
    });

    return NextResponse.json(product);
  } catch (e) {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    await prismadb.product.delete({ where: { id: params.productId } });
    return new NextResponse('OK');
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}


