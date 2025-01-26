import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import bcypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, code, adminEmail, password, phone, address } = await request.json();

    const existingStore = await prisma.store.findUnique({
      where: { code }
    });

    if (existingStore) {
      return NextResponse.json(
        {error: '指定された店舗コードはすでに使用されています'},
        {status: 400}
      )
    };

    const result = await prisma.$transaction(async (prisma) => {
      const store = await prisma.store.create({
        data: { name, code, adminEmail, phone, address}
      });
    

    const hashedPassword = await bcypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: `${name}管理者`,
        role: 'ADMIN',
        storeId: store.id
      }
    })
    return store;
  });

  return NextResponse.json({success: true, storeId: result.id});
  }catch (error) {
    return NextResponse.json({error: '登録処理に失敗しました'}, {status: 500})
  }
}