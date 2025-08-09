import React from 'react';
export function Progress({ value=0, className='' }) {
  return (
    <div className={['w-full h-2 rounded-full overflow-hidden bg-slate-200/70 dark:bg-white/10', className].join(' ')}>
      <div className="h-full bg-sky-500" style={{width: `${Math.max(0, Math.min(100, value))}%`}}></div>
    </div>
  );
}
