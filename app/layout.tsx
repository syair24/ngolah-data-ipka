'use client';

import './globals.css'; // <-- SATU-SATUNYA TEMPAT IMPOR CSS
import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Memeriksa apakah user sedang membuka halaman login atau register
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  return (
    <html lang="en">
      <body className="antialiased">
        {isAuthPage ? (
          // Jika di halaman auth, render polos tanpa sidebar
          children
        ) : (
          // Jika di halaman dashboard aplikasi, bungkus dengan Sidebar & Navbar
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col md:pl-55">
              <main className="p-6 flex-1">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
