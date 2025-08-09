import React from 'react'; export function Textarea(p){return <textarea {...p} className={['input',p.className||''].join(' ')}/> }
