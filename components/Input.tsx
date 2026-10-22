import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export default function Input({ icon, className = '', type = 'text', ...props }: InputProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
      )}

      <input
        {...props}
        type={type}
        className={`w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-xl py-3.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200 ${
          icon ? 'pl-12 pr-4' : 'px-4'
        } ${className}`}
      />
    </div>
  );
}
