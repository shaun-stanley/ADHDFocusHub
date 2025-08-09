import React from 'react';

export function Button({
  children,
  variant = 'primary', // primary | tinted | ghost
  size = 'sm',
  fluid = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white border-transparent',
    tinted: 'bg-slate-100/90 text-slate-900 hover:bg-slate-200 border-black/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15 dark:border-white/10',
    ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 border-transparent shadow-none',
  };
  const sizes = {
    sm: 'h-10 px-4 text-sm rounded-2xl md:h-10 md:px-4',
    md: 'h-11 px-5 text-base rounded-2xl',
    lg: 'h-12 px-6 text-base rounded-3xl',
    icon: 'h-10 w-10 rounded-2xl inline-grid place-items-center',
  };
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-medium shadow-elev-1 border',
        'focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:ring-offset-0',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.sm,
        fluid ? 'w-full' : '',
        'max-w-full',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
