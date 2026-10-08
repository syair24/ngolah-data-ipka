import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Daftar halaman publik yang TIDAK BOLEH diakses jika user sudah login
  const publicPages = ['/login', '/forgot-password', '/register'];
  const isPublicPage = publicPages.includes(pathname);

  // KONDISI 1: JIKA USER SUDAH LOGIN (Mempunyai Session)
  if (session) {
    // Jika mencoba akses /login, /register, atau /forgot-password
    if (isPublicPage) {
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      // Hancurkan cache halaman login/register
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    // Perbaikan Penting: Untuk halaman internal (/dashboard, /pengaturan, dll)
    // Kita pasang header anti-cache agar browser tidak menyimpan riwayat halaman
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // KONDISI 2: JIKA USER BELUM LOGIN (Tidak ada Session)
  if (!session) {
    // 1. Amankan halaman /register agar TIDAK BISA diakses sama sekali di server Production
    if (pathname === '/register' && process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Jika mengakses halaman publik seperti /login atau /forgot-password, izinkan masuk
    if (isPublicPage) {
      // Hancurkan cache agar halaman login selalu memeriksa cookie terbaru
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }

    // 3. Jika mencoba mengakses halaman rahasia tanpa login, paksa ke halaman login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }

  return NextResponse.next();
}

// Konfigurasi matcher standar Next.js untuk mengecualikan file statis, gambar, dan API
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
