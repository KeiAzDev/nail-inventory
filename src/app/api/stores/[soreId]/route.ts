import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.pathname.split('/').pop()
    
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: '店舗が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(store)
  } catch (error) {
    return NextResponse.json(
      { error: '店舗情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const storeId = request.nextUrl.pathname.split('/').pop()
    const data = await request.json()

    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address
      }
    })

    return NextResponse.json(store)
  } catch (error) {
    return NextResponse.json(
      { error: '店舗情報の更新に失敗しました' },
      { status: 500 }
    )
  }
}