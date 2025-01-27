import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, note } = body;
    const date = new Date();

    // トランザクションで使用記録と在庫更新を実行
    const result = await prisma.$transaction(async (tx) => {
      // 商品情報を取得
      const product = await tx.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.quantity <= 0) {
        throw new Error('Product out of stock');
      }

      // 使用記録を作成
      const usage = await tx.usage.create({
        data: {
          date,
          productId,
          note
        }
      });

      // 商品情報を更新
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          quantity: product.quantity - 1,
          usageCount: product.usageCount + 1,
          lastUsed: date,
          // 平均使用回数を計算（月間）
          averageUsesPerMonth: {
            set: calculateAverageUsesPerMonth(product.usageCount + 1, product.createdAt)
          },
          // 残り日数を推定
          estimatedDaysLeft: {
            set: calculateEstimatedDaysLeft(
              product.quantity - 1,
              calculateAverageUsesPerMonth(product.usageCount + 1, product.createdAt)
            )
          }
        }
      });

      return { usage, updatedProduct };
    });

    return Response.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'Failed to record usage' }, { status: 500 });
  }
}

// Helper functions
function calculateAverageUsesPerMonth(totalUses: number, createdAt: Date): number {
  const monthsSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return totalUses / Math.max(monthsSinceCreation, 1);
}

function calculateEstimatedDaysLeft(currentQuantity: number, averageUsesPerMonth: number): number {
  const usesPerDay = averageUsesPerMonth / 30;
  return Math.round(currentQuantity / usesPerDay);
}

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('productId');
    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    const usages = await prisma.usage.findMany({
      where: { productId },
      orderBy: { date: 'desc' },
      include: { product: true }
    });

    return NextResponse.json({ usages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch usages' }, { status: 500 });
  }
}