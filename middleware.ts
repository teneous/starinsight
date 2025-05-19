import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/starinsight/auth');
  const isPublicPage = request.nextUrl.pathname === '/starinsight';

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/starinsight/dashboard', request.url));
    }
    return null;
  }

  if (!isAuth && !isPublicPage) {
    return NextResponse.redirect(new URL('/starinsight', request.url));
  }

  return null;
}

export const config = {
  matcher: ['/starinsight', '/starinsight/dashboard/:path*', '/starinsight/auth/:path*'],
};
