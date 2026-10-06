import React from 'react';

export function ActionButton({ 
  children, 
  onClick, 
  disabled, 
  variant = 'primary',
  className = '',
  testId
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  testId?: string;
}) {
  const baseStyles = "px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm active:scale-95";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border border-transparent shadow-blue-500/20",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300",
    danger: "bg-rose-600 hover:bg-rose-700 text-white border border-transparent shadow-rose-500/20",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 border border-transparent shadow-none"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      data-testid={testId}
    >
      {children}
    </button>
  );
}
