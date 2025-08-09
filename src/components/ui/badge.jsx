import React from 'react';
export function Badge({ children, variant='tinted', className='' }){
  const v={solid:'bg-slate-900 text-white dark:bg-white dark:text-slate-900',tinted:'glass hairline',outline:'hairline'}[variant]||'';
  return <span className={['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs',v,className].join(' ')}>{children}</span>;
}
