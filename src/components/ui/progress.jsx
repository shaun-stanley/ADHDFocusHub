import React from 'react';
export function Progress({ value=0, className='' }) {
  return (
    <div className={`w-full h-2 bg-slate-200 rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-slate-900" style={{width: `${Math.max(0, Math.min(100, value))}%`}}></div>
    </div>
  );
}