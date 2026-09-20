import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export default function Input({ icon, className = '', ...props }: InputProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-200">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`w-full bg-transparent border border-blue-400 text-white placeholder-blue-200 text-sm rounded-xl py-3.5 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-200 ${
          icon ? 'pl-12 pr-4' : 'px-4'
        } ${className}`}
      />
    </div>
  );
}
