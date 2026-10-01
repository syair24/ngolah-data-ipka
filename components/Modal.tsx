'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '10xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '10xl': 'max-w-[90rem]',
  };

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs sm:p-6"
      onClick={handleOverlayClick}
    >
      <div
        className={`flex max-h-[85vh] w-full ${sizes[size]} flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        {(title || showCloseButton) && (
          <div className="flex h-[73px] shrink-0 items-center justify-between border-b border-gray-200 px-6">
            {title ? <h2 className="text-base font-semibold text-gray-900">{title}</h2> : <div />}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* MAIN */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-auto
            p-6
            text-gray-900

            [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-gray-50
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
            [&::-webkit-scrollbar-button]:hidden
          "
        >
          {children}
        </div>

        {/* FOOTER */}
        {footer && <div className="shrink-0 border-t border-gray-200 bg-white p-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
