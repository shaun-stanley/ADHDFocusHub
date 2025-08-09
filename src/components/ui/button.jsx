import React from 'react';
export function Button({ children, variant='primary', size='sm', fluid=false, className='', ...props }){
  const v={primary:'btn btn-primary',tinted:'btn btn-tinted',ghost:'btn btn-ghost'}[variant]||'btn';
  const s={sm:'h-10 px-4 rounded-[14px]',md:'h-11 px-5 rounded-[16px]',lg:'h-12 px-6 rounded-[18px]',icon:'btn-icon'}[size]||'';
  return <button className={[v,s,fluid?'btn-fluid':'',className].join(' ')} {...props}>{children}</button>;
}
