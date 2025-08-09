import React from 'react';
export function Textarea(props) {
  return <textarea {...props} className={`border rounded-xl px-3 py-2 outline-none focus:ring w-full ${props.className||''}`} />;
}