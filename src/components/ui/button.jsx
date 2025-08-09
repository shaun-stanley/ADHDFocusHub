import React from 'react';

export function Button({
  children,
  variant = 'default',
  size = 'sm',                // default to smaller
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-slate-200',
    ghost: 'bg-transparent hover:bg-slate-100 border-transparent shadow-none',
  };

  const sizes = {
    sm: 'h-8 px-2.5 text-sm rounded-xl',
    md: 'h-9 px-3 text-sm rounded-xl',
    lg: 'h-10 px-4 text-base rounded-2xl',
    icon: 'h-8 w-8 rounded-xl inline-grid place-items-center',
  };

  return (
    <button
      className={[
        'inline-flex items-center gap-2 border shadow-sm font-medium',
        'focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2',
        variants[variant] ?? variants.default,
        sizes[size] ?? sizes.sm,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
