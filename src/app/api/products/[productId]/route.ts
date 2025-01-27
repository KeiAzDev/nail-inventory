import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.pathname.split('/').pop();

  const product = await prisma.product.findUnique({
    where: { id: productId! },
  });

  return NextResponse.json(product);
}

export async function PUT(request: NextRequest) {
  try {
    const productId = request.nextUrl.pathname.split('/').pop();
    const body = await request.json();
    const { 
      brand, 
      productName, 
      colorCode, 
      colorName, 
      type, 
      price, 
      quantity,
      minStockAlert 
    } = body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        brand,
        productName,
        colorCode,
        colorName,
        type,
        price,
        quantity,
        minStockAlert
      }
    });
    return Response.json(product);
  } catch (error) {
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const productId = request.nextUrl.pathname.split('/').pop();
    await prisma.product.delete({
      where: { id: productId }
    });
    return Response.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}