import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get('storeId');

  const products = await prisma.product.findMany({
    where: { storeId: storeId! },
  });
  return NextResponse.json(products);
}