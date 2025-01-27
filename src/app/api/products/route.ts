import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');
    if (!storeId) return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });

    const products = await prisma.product.findMany({
      where: { storeId },
      orderBy: { updatedAt: 'desc' },
      include: { usages: true }
    });
    
    return NextResponse.json({ products }); // オブジェクトとして返す
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      brand, 
      productName, 
      colorCode, 
      colorName, 
      type, 
      price, 
      quantity, 
      minStockAlert,
      storeId 
    } = body;

    const product = await prisma.product.create({
      data: {
        brand,
        productName,
        colorCode,
        colorName,
        type,
        price,
        quantity,
        minStockAlert,
        storeId
      }
    });
    return Response.json(product);
  } catch (error) {
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }
}