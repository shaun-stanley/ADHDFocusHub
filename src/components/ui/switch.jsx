import React from 'react';
export function Switch({ checked, onCheckedChange }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e=>onCheckedChange?.(e.target.checked)} className="sr-only"/>
      <span className={`w-10 h-6 rounded-full transition ${checked?'bg-slate-900':'bg-slate-300'}`}>
        <span className={`block w-4 h-4 bg-white rounded-full transform transition translate-y-1 ${checked?'translate-x-5':'translate-x-1'}`}></span>
      </span>
    </label>
  );
}