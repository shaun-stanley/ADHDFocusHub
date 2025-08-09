import React from 'react';
export function Textarea(props) {
  return <textarea {...props} className={['w-full rounded-2xl px-4 py-3 text-[15px]',
   'bg-white/90 dark:bg-white/5 border border-black/10 dark:border-white/10',
   'placeholder:text-slate-400 dark:placeholder:text-slate-500',
   'focus:outline-none focus:ring-2 focus:ring-sky-300/60',
   props.className||''].join(' ')} />;
}
