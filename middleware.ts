import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // ==========================================
  // HALAMAN YANG BOLEH DIAKSES TANPA LOGIN
  // ==========================================
  const publicPages = ['/login', '/register', '/forgot-password'];

  const isPublicPage = publicPages.includes(pathname);

  // ==========================================
  // JIKA SUDAH LOGIN
  // ==========================================
  if (session) {
    // User yang sudah login tidak boleh kembali
    // ke halaman login/register/forgot-password
    if (isPublicPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Semua halaman aplikasi boleh diakses
    return NextResponse.next();
  }

  // ==========================================
  // JIKA BELUM LOGIN
  // ==========================================
  if (!session) {
    // Halaman public tetap boleh diakses
    if (isPublicPage) {
      return NextResponse.next();
    }

    // Semua halaman lainnya wajib login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// ==========================================
// MIDDLEWARE BERLAKU UNTUK SEMUA PAGE
// KECUALI API DAN FILE STATIC
// ==========================================
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
