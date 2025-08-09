import React from 'react'; export function Input(p){return <input {...p} className={['input',p.className||''].join(' ')}/> }
