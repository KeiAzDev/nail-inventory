import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key'
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')
    const storeId = request.headers.get('store-id')

    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token.value, secret)

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      include: { store: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // storeIdの検証
    if (storeId && user.storeId !== storeId) {
      return NextResponse.json({ error: '店舗へのアクセス権がありません' }, { status: 403 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.storeId,
        storeName: user.store.name
      }
    })

  } catch (error) {
    return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 })
  }
}