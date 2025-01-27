import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');

export async function POST(request: NextRequest) {
  try {
    const {email, password} = await request.json();

    const user = await prisma.user.findUnique({
      where: {email},
      include: {store: true}
    })

    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json(
        {error: 'メールアドレスまたはパスワードが違います'},
        {status: 401}
      )
    }

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      storeId: user.storeId,
      role: user.role
    })
      .setProtectedHeader({alg: 'HS256'})
      .setExpirationTime('24h')
      .sign(secret);

      const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        store: user.storeId,
        storeName: user.store.name
      }
    })
  } catch (error) {
    return NextResponse.json(
      {error: 'ログインに失敗しました'},
      {status: 500}
    )
  }
}