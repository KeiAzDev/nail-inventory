import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ProductResponse, ApiError } from "@/types/api";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.pathname.split('/').pop();

  const product = await prisma.product.findUnique({
    where: { id: productId! },
    include: { usages: true }
  });

  return NextResponse.json(product);
}

export async function PUT(request: NextRequest): Promise<NextResponse<ProductResponse | ApiError>> {
  try {
    const productId = request.nextUrl.pathname.split('/').pop();
    const body = await request.json();
    
    // 使用履歴の取得と分析
    const usages = await prisma.usage.findMany({
      where: { productId: productId },
      orderBy: { date: 'desc' }
    });

    // 月間平均使用回数の計算
    const monthlyUsage = calculateMonthlyUsage(usages);
    const estimatedDays = body.quantity > 0 ? Math.floor((body.quantity / monthlyUsage) * 30) : 0;

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...body,
        averageUsesPerMonth: monthlyUsage,
        estimatedDaysLeft: estimatedDays,
        lastUsed: usages[0]?.date || null
      }
    });

    // 在庫アラートの条件確認
    const alertStatus = {
      isLowStock: product.quantity <= product.minStockAlert,
      estimatedDaysLeft: estimatedDays,
      lowStockThreshold: product.minStockAlert
    };

    return NextResponse.json({ product, alertStatus });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<{ message: string } | ApiError>> {
  try {
    const productId = request.nextUrl.pathname.split('/').pop();
    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

function calculateMonthlyUsage(usages: { date: Date }[]): number {
  if (usages.length < 2) return 0;
  
  const firstUsage = new Date(usages[usages.length - 1].date);
  const lastUsage = new Date(usages[0].date);
  const monthsDiff = (lastUsage.getTime() - firstUsage.getTime()) / (30 * 24 * 60 * 60 * 1000);
  
  return monthsDiff > 0 ? usages.length / monthsDiff : 0;
}
