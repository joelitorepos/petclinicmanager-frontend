// src/components/ui/Button.tsx

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  loading = false,
  ...rest
}: ButtonProps) => {
  const baseClasses = `
    inline-flex items-center justify-center rounded-lg font-medium
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer
  `;

  const variants = {
    primary: `
      bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary)/0.9)]
      focus:ring-[rgb(var(--primary))]
    `,
    secondary: `
      bg-[rgb(var(--surface))] text-[rgb(var(--text))] border border-[rgb(var(--border))]
      hover:bg-[rgb(var(--border)/0.5)] focus:ring-[rgb(var(--primary))]
    `,
    danger: `
      bg-[rgb(var(--danger))] text-white hover:bg-[rgb(var(--danger)/0.9)]
      focus:ring-[rgb(var(--danger))]
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
        ${loading ? 'relative text-transparent' : ''} // Oculta el texto si carga
      `}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {children}
    </button>
  );
};

export default Button;