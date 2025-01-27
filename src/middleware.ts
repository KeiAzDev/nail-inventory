import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')
  const pathname = request.nextUrl.pathname

  if (!authToken && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/api/products')) {
    if (!authToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const storeId = request.nextUrl.searchParams.get('storeId')
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 })
    }

    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/check`, {
        headers: {
          'Cookie': `auth-token=${authToken.value}`,
          'store-id': storeId
        }
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'Store access denied' }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Authorization failed' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/login',
    '/api/products/:path*'
  ]
}