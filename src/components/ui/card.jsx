import React from 'react';
export function Card({ className='', children }) {
  return <div className={['card', className].join(' ')}>{children}</div>;
}
export function CardHeader({ className='', children }) {
  return <div className={['p-4 md:p-5', className].join(' ')}>{children}</div>;
}
export function CardTitle({ className='', children }) {
  return <h3 className={['text-lg md:text-xl font-semibold tracking-tight', className].join(' ')}>{children}</h3>;
}
export function CardContent({ className='', children }) {
  return <div className={['p-4 md:p-5', className].join(' ')}>{children}</div>;
}
