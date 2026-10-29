'use client';

import './globals.css';
import React, { useState, createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

// Buat Context global buat status sidebar
const SidebarContext = createContext<{
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isSidebarOpen: true,
  setIsSidebarOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Otomatis tutup sidebar jika dibuka di layar HP / ukuran kecil (< 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Cek saat pertama load
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  return (
    <html lang="id">
      <head>
        <title>Production Control</title>
        <meta name="description" content="Sistem Manajemen dan Kontrol Produksi Terintegrasi" />
      </head>
      <body className="antialiased font-sans text-gray-900 selection:bg-blue-500 selection:text-white">
        <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
          {isAuthPage ? (
            children
          ) : (
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <div
                className={`flex-1 flex flex-col transition-[padding] duration-200 ease-in-out ${
                  isSidebarOpen ? 'md:pl-55' : 'md:pl-17.5'
                }`}
              >
                <main className="flex-1">{children}</main>
              </div>
            </div>
          )}
        </SidebarContext.Provider>
      </body>
    </html>
  );
}
