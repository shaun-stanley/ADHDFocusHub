import React, { useEffect, useRef } from 'react';
export function Dialog({ open, onOpenChange, children }) {
  const ref = useRef();
  useEffect(()=>{ if (!ref.current) return; if (open) ref.current.showModal?.(); else ref.current.close?.(); }, [open]);
  return <dialog ref={ref} className="rounded-3xl p-0 glass w-[92vw] max-w-xl border border-black/10 dark:border-white/10" onClose={()=>onOpenChange?.(false)}>{children}</dialog>;
}
export function DialogContent({ className='', children }) { return <div className={className}>{children}</div>; }
export function DialogHeader({ children }) { return <div className="p-5 border-b border-black/5 dark:border-white/10">{children}</div>; }
export function DialogTitle({ className='', children }) { return <div className={['text-lg font-semibold', className].join(' ')}>{children}</div>; }
export function DialogFooter({ children }) { return <div className="p-5 border-t border-black/5 dark:border-white/10">{children}</div>; }
