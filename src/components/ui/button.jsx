import React from 'react';
export function Button({ children, variant='default', size='sm', fluid=false, className='', ...props }) {
  const variants = {
    default: 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-slate-200',
    ghost: 'bg-transparent hover:bg-slate-100 border-transparent shadow-none',
  };
  const sizes = {
    sm: 'h-9 px-3 text-sm rounded-xl md:h-10 md:px-4',
    md: 'h-10 px-4 text-sm md:text-base rounded-2xl',
    lg: 'h-11 px-5 text-base rounded-2xl',
    icon: 'h-9 w-9 md:h-10 md:w-10 rounded-xl inline-grid place-items-center',
  };
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 border shadow-sm font-medium',
        'focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2',
        variants[variant] ?? variants.default,
        sizes[size] ?? sizes.sm,
        fluid ? 'w-full' : '',
        'max-w-full whitespace-nowrap',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
