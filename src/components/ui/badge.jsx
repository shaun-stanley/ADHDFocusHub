import React from 'react';
export function Badge({ children, variant='default', className='', ...props }) {
  const v = {
    default: 'bg-slate-900 text-white',
    secondary: 'bg-slate-100 text-slate-900',
    outline: 'border border-slate-300 text-slate-700'
  }[variant] || '';
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full',
        'px-2 py-0.5 text-[11px] md:px-2.5 md:py-1 md:text-xs',
        v, className
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
