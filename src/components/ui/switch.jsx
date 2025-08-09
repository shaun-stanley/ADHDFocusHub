import React from 'react';
export function Switch({ checked, onCheckedChange }){
  return (<label className="inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={e=>onCheckedChange?.(e.target.checked)} className="sr-only"/>
    <span className={'w-12 h-7 rounded-full transition '+(checked?'bg-sky-500':'bg-slate-300/70 dark:bg-white/20')}>
      <span className={'block w-5 h-5 bg-white rounded-full transform transition translate-y-1 '+(checked?'translate-x-6':'translate-x-1')}></span>
    </span></label>);
}
