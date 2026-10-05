import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const publicPages = ['/login', '/forgot-password'];
  const isPublicPage = publicPages.includes(pathname);

  // /register hanya boleh diakses saat local development
  if (pathname === '/register' && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session) {
    if (isPublicPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  if (!session) {
    if (isPublicPage) {
      return NextResponse.next();
    }

    // /register tetap bisa diakses saat local
    if (pathname === '/register' && process.env.NODE_ENV !== 'production') {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
