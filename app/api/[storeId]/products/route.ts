import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const sizeId = searchParams.get('sizeId') || undefined;
    const colorId = searchParams.get('colorId') || undefined;
    const isFeatured = searchParams.get('isFeatured');

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400});
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (e) {
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { userId: authedUserId } = await auth();
    const body = await req.json();
    console.log('[PRODUCTS_POST] body', body);
    const { storeId } = await params;

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
    if (!name) {
      return new NextResponse("Name is required", { status: 400});
    }
    if (!price) {
      return new NextResponse("Price is required", { status: 400});
    }
    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400});
    }
    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400});
    }
    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400});
    }
    if (!images || !images.length) {
      return new NextResponse("Image is required", { status: 400});
    }
    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400});
    }

    const storeByUserId = await prismadb.store.findFirst({ where: { id: storeId, userId } });
    if (!storeByUserId) {
      if (process.env.NODE_ENV === 'production') {
        return new NextResponse("Unauthorized", { status: 403 });
      }
      // In dev, skip ownership check to allow quick testing
    }

    try {
      const createImages = (images || []).map((img: any) => ({ url: typeof img === 'string' ? img : String(img?.url || '') })).filter((x) => !!x.url);
      const product = await prismadb.product.create({
        data : {
          name,
          images: {
            createMany: {
              data: createImages,
            }
          },
          price: typeof price === 'number' ? price : parseFloat(String(price)),
          isFeatured: !!isFeatured,
          isArchived: !!isArchived,
          categoryId,
          sizeId,
          colorId,
          storeId: storeId
        }
      });
      console.log('[PRODUCTS_POST] created', product.id);
      return NextResponse.json(product);
    } catch (e: any) {
      console.error('[PRODUCTS_POST] prisma error', e?.message, e);
      return new NextResponse('Failed to create product', { status: 500 });
    }

  } catch (e) {
    console.error('[PRODUCTS_POST] unexpected', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}


