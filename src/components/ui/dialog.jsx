import React, { useEffect, useRef } from 'react';
export function Dialog({ open, onOpenChange, children }) {
  const ref = useRef();
  useEffect(()=>{
    if (!ref.current) return;
    if (open) ref.current.showModal?.(); else ref.current.close?.();
  }, [open]);
  return <dialog ref={ref} className="rounded-2xl p-0 backdrop:bg-black/40" onClose={()=>onOpenChange?.(false)}>{children}</dialog>;
}
export function DialogContent({ className='', children }) {
  return <div className={className}>{children}</div>;
}
export function DialogHeader({ children }) { return <div className="p-4 border-b bg-white rounded-t-2xl">{children}</div>; }
export function DialogTitle({ className='', children }) { return <div className={`text-lg font-semibold ${className}`}>{children}</div>; }
export function DialogFooter({ children }) { return <div className="p-4 border-t bg-white rounded-b-2xl">{children}</div>; }