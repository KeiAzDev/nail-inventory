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
  const productId = request.nextUrl.pathname.split('/').pop();
  const data = await request.json();

  const product = await prisma.product.update({
    where: { id: productId! },
    data,
  });

  return NextResponse.json(product);
}