import React from 'react';
export function Badge({ children, variant='tinted', className='', ...props }) {
  const v = {
    solid: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
    tinted: 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-slate-100',
    outline: 'border border-black/10 text-slate-700 dark:text-slate-200 dark:border-white/15'
  }[variant] || '';
  return (
    <span className={['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs', v, className].join(' ')} {...props}>
      {children}
    </span>
  );
}
