'use client';

import React from 'react';
import { useSidebar } from '@/app/layout';

interface NavbarProps {
  title: string;
  children?: React.ReactNode;
}

export default function Navbar({ title, children }: NavbarProps) {
  const { isSidebarOpen } = useSidebar();

  return (
    <header
      className={`fixed right-0 top-0 z-40 h-16 border-b border-gray-200 bg-white shadow-sm transition-[left] duration-200 ease-in-out ${
        isSidebarOpen ? 'left-0 md:left-55' : 'left-0 md:left-17.5'
      }`}
    >
      <div className="flex h-full items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

        <div className="flex items-center gap-3">{children}</div>
      </div>
    </header>
  );
}
