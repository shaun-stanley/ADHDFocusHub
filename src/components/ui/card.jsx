import React from 'react';
export function Card({ className='', children }) {
  return <div className={`rounded-2xl border bg-white ${className}`}>{children}</div>;
}
export function CardHeader({ className='', children }) {
  return <div className={`p-3 md:p-4 ${className}`}>{children}</div>;
}
export function CardTitle({ className='', children }) {
  return <h3 className={`text-lg md:text-xl font-semibold ${className}`}>{children}</h3>;
}
export function CardContent({ className='', children }) {
  return <div className={`p-3 md:p-4 ${className}`}>{children}</div>;
}
