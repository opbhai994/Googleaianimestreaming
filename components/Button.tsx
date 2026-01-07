import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20",
    secondary: "bg-slate-800 text-white hover:bg-slate-700",
    outline: "border-2 border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20",
    ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};