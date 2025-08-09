import React from 'react';
export function Button({ children, variant='default', size='md', className='', ...props }) {
  const v = {
    default: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    ghost: 'bg-transparent hover:bg-slate-100',
  }[variant] || '';
  const s = {
    md: 'h-10 px-4 rounded-2xl',
    sm: 'h-8 px-3 rounded-xl text-sm',
    icon: 'h-9 w-9 rounded-xl inline-grid place-items-center'
  }[size] || '';
  return <button className={`${v} ${s} border border-slate-200 shadow-sm ${className}`} {...props}>{children}</button>;
}