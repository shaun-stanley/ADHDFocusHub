import React,{useEffect,useRef} from 'react';
export function Dialog({open,onOpenChange,children}){const ref=useRef();useEffect(()=>{if(!ref.current)return;open?ref.current.showModal?.():ref.current.close?.()},[open]);return <dialog ref={ref} className="glass hairline rounded-[20px] p-0 w-[92vw] max-w-xl" onClose={()=>onOpenChange?.(false)}>{children}</dialog>}
export function DialogContent({className='',children}){return <div className={className}>{children}</div>}
export function DialogHeader({children}){return <div className="p-5 border-b border-black/5 dark:border-white/10">{children}</div>}
export function DialogTitle({className='',children}){return <div className={['text-lg font-semibold',className].join(' ')}>{children}</div>}
export function DialogFooter({children}){return <div className="p-5 border-t border-black/5 dark:border-white/10">{children}</div>}
