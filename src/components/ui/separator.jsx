import React from 'react';
export function Separator({ className='' }) {
  return <div className={['w-full h-px bg-black/5 dark:bg-white/10', className].join(' ')}></div>;
}
