import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle2, Clock, Coffee, Focus, ListChecks, Plus, Rocket, Settings, Star, Target, Trash2, Volume2, X, Flame, Gift, Play, Pause, RefreshCcw, Maximize2, Minimize2, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const useLocal = (key, initial) => { const [val, setVal] = useState(()=>{ try{const s=localStorage.getItem(key);return s?JSON.parse(s):initial}catch{return initial}}); useEffect(()=>{ try{localStorage.setItem(key,JSON.stringify(val))}catch{} },[key,val]); return [val,setVal]; };
const niceTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const suggestionsByEnergy = (e)=> e<=2?["15‑min focus","Low-stim task","Hydrate"]: e<=4?["25/5 Pomodoro","2‑min tidy","One small win"]: e<=7?["45/10 deep work","Batch tasks","White noise"] : ["Stretch goal","Hardest task first","Reward after"];

const useWhiteNoise=()=>{ const ctxRef=useRef(null); const noiseRef=useRef(null); const [on,setOn]=useState(false);
  const toggle=async()=>{ if(on){ try{noiseRef.current?.stop?.()}catch{} noiseRef.current=null; setOn(false); return; }
    try{ const Ctx=window.AudioContext||window.webkitAudioContext; const ctx=ctxRef.current||new Ctx(); ctxRef.current=ctx; if(ctx.state==='suspended') await ctx.resume();
      const N=2*ctx.sampleRate; const buf=ctx.createBuffer(1,N,ctx.sampleRate); const out=buf.getChannelData(0); for(let i=0;i<N;i++) out[i]=Math.random()*2-1;
      const src=ctx.createBufferSource(); src.buffer=buf; const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=1000; src.connect(f); f.connect(ctx.destination); src.loop=true; src.start(); noiseRef.current=src; setOn(true);
    }catch{} };
  useEffect(()=>()=>{ try{noiseRef.current?.stop?.()}catch{} },[]);
  return {on,toggle};
};
const beep=()=>{ try{ const Ctx=window.AudioContext||window.webkitAudioContext; const ctx=new Ctx(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(880,ctx.currentTime); g.gain.setValueAtTime(0.001,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.2,ctx.currentTime+0.02); g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+0.3); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.35);}catch{} };
const isDocActive=()=>{ if(typeof document==='undefined')return false; const vis=document.visibilityState==='visible'; const foc=typeof document.hasFocus==='function'?document.hasFocus():true; return vis&&foc; };
const requestFullscreenSafe=async(el)=>{ try{ if(!el?.requestFullscreen||!isDocActive())return; await el.requestFullscreen(); }catch{} };
const exitFullscreenSafe=async()=>{ try{ if(!document?.exitFullscreen||!document.fullscreenElement||!isDocActive())return; await document.exitFullscreen(); }catch{} };

export default function App(){
  const [tasks,setTasks]=useLocal('adhd.tasks',[]);
  const [taskInput,setTaskInput]=useState(''); const [priority,setPriority]=useState('M'); const [eta,setEta]=useState(15);
  const [dump,setDump]=useLocal('adhd.dump','');
  const [focusSec,setFocusSec]=useLocal('adhd.focusSec',25*60); const [breakSec,setBreakSec]=useLocal('adhd.breakSec',5*60);
  const [remaining,setRemaining]=useState(focusSec); const [isRunning,setIsRunning]=useState(false); const [onBreak,setOnBreak]=useState(false); const [completedPomos,setCompletedPomos]=useLocal('adhd.pomos',0);
  const [energy,setEnergy]=useLocal('adhd.energy',5);
  const [focusMode,setFocusMode]=useState(false); const [fullscreen,setFullscreen]=useState(false);
  const [theme,setTheme]=useState(()=>document.documentElement.classList.contains('dark')?'dark':'light');
  const [habits,setHabits]=useLocal('adhd.habits',[{id:1,name:'Medicate / Vitamins',streak:0,history:{}},{id:2,name:'Move 10 min',streak:0,history:{}},{id:3,name:'Inbox Zero Sweep',streak:0,history:{}}]);
  const [rewards,setRewards]=useLocal('adhd.rewards',['Watch one funny clip','Make a fancy tea/coffee','5‑min game break','Text a friend a meme','Stretch on the floor']);
  const todayKey=useMemo(()=>new Date().toISOString().slice(0,10),[]);
  const {on:whiteNoiseOn,toggle:toggleNoise}=useWhiteNoise();

  useEffect(()=>setRemaining(onBreak?breakSec:focusSec),[focusSec,breakSec,onBreak]);
  useEffect(()=>{ if(!isRunning) return; const id=setInterval(()=>{ setRemaining(r=>{ if(r<=1){ clearInterval(id); beep(); if(!onBreak) setCompletedPomos(p=>p+1); setOnBreak(!onBreak); setIsRunning(false); return onBreak?focusSec:breakSec; } return r-1;})},1000); return ()=>clearInterval(id)},[isRunning,onBreak,focusSec,breakSec,setCompletedPomos]);
  useEffect(()=>{ const onVis=()=>{ if(document.visibilityState!=='visible') setIsRunning(false)}; addEventListener('visibilitychange',onVis); addEventListener('blur',onVis); return ()=>{ removeEventListener('visibilitychange',onVis); removeEventListener('blur',onVis);} },[]);
  useEffect(()=>{ const el=document.documentElement; if(fullscreen) requestFullscreenSafe(el); else exitFullscreenSafe();},[fullscreen]);
  useEffect(()=>{ const onChange=()=>{ const isFs=!!document.fullscreenElement; setFullscreen(p=>p!==isFs?isFs:p)}; document.addEventListener('fullscreenchange',onChange); return ()=>document.removeEventListener('fullscreenchange',onChange)},[]);

  const energyIdeas=suggestionsByEnergy(energy);
  const progress=useMemo(()=>{ const d=tasks.filter(t=>t.done).length; return tasks.length?Math.round((d/tasks.length)*100):0 },[tasks]);
  const addTask=()=>{ if(!taskInput.trim()) return; const t={id:uid(),text:taskInput.trim(),priority,eta,done:false,createdAt:Date.now(),subtasks:[]}; setTasks([t,...tasks]); setTaskInput(''); };
  const toggleTask=(id)=>setTasks(tasks.map(t=>t.id===id?{...t,done:!t.done}:t));
  const removeTask=(id)=>setTasks(tasks.filter(t=>t.id!==id));
  const markHabit=(id)=>{ setHabits(hs=>hs.map(h=>{ if(h.id!==id) return h; const hist={...h.history,[todayKey]:true}; const y=new Date(Date.now()-86400000).toISOString().slice(0,10); const streak=hist[todayKey]?(h.history[y]?h.streak+1:1):h.streak; return {...h,history:hist,streak}; }))};
  const weekData=useMemo(()=>Array.from({length:7},(_,i)=>{ const d=new Date(Date.now()-(6-i)*86400000); const k=d.toISOString().slice(0,10); return {name:d.toLocaleDateString(undefined,{weekday:'short'}),value:habits.reduce((a,h)=>a+(h.history[k]?1:0),0)}; }),[habits]);
  const randomReward=()=>rewards[Math.floor(Math.random()*rewards.length)];
  const toggleTheme=()=>{ const n=theme==='dark'?'light':'dark'; setTheme(n); document.documentElement.classList.toggle('dark',n==='dark'); localStorage.setItem('adhd.theme',n); };

  return (<div className="min-h-screen text-slate-900 dark:text-slate-100">
    <header className="sticky top-0 z-30 glass hairline">
      <div className="max-w-5xl mx-auto px-3 md:px-4 py-3 flex items-center gap-2">
        <Rocket className="w-5 h-5"/><div className="font-semibold tracking-tight">ADHD Hub</div>
        <Badge className="ml-1" variant="tinted">Beta</Badge>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={()=>setFocusMode(true)} aria-label="Focus"><Focus className="w-4 h-4"/></Button>
          <Button variant="tinted" size="icon" onClick={toggleNoise} aria-label="Noise"><Volume2 className="w-4 h-4"/></Button>
          <Button variant="ghost" size="icon" onClick={()=>setFullscreen(f=>!f)} aria-label="Fullscreen">{fullscreen?<Minimize2 className="w-5 h-5"/>:<Maximize2 className="w-5 h-5"/>}</Button>
          <Button variant="tinted" size="icon" onClick={toggleTheme} aria-label="Theme">{theme==='dark'?<Sun className="w-5 h-5"/>:<Moon className="w-5 h-5"/>}</Button>
          <Button variant="ghost" size="icon" aria-label="Settings"><Settings className="w-5 h-5"/></Button>
        </div>
      </div>
    </header>

    <main className="max-w-5xl mx-auto px-3 md:px-4 py-6 grid gap-6 md:grid-cols-12">
      <section className="md:col-span-7 grid gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5"/>Brain Dump</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={dump} onChange={(e)=>setDump(e.target.value)} placeholder="Type everything swirling in your head. No order needed." className="min-h-[110px]"/>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button variant="tinted" size="md" fluid onClick={()=>setDump('')}>Clear</Button>
              <Button variant="primary" size="md" fluid onClick={()=>{ if(!dump.trim()) return; const newTasks=dump.split(/\n+/).map(l=>l.trim()).filter(Boolean).map(l=>({id:uid(),text:l,priority:'M',eta:15,done:false,createdAt:Date.now(),subtasks:[]})); setTasks(ts=>[...newTasks,...ts]); setDump(''); }}>Send to Tasks</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5"/>Task Sprint</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col md:flex-row gap-2">
              <Input value={taskInput} onChange={(e)=>setTaskInput(e.target.value)} placeholder="Add a task (keep it tiny!)" className="w-full"/>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <select className="input w-full sm:w-36" value={priority} onChange={(e)=>setPriority(e.target.value)}>
                  <option value="H">High</option><option value="M">Medium</option><option value="L">Low</option>
                </select>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Clock className="w-4 h-4 shrink-0"/><Input type="number" className="w-full sm:w-24" value={eta} onChange={(e)=>setEta(Number(e.target.value||15))}/><span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">min</span>
                </div>
                <Button variant="primary" size="md" fluid className="sm:w-auto" onClick={addTask}><Plus className="w-4 h-4 mr-1"/>Add</Button>
              </div>
            </div>
            <div className="flex items-center gap-3"><Progress value={progress} className="h-2"/><span className="text-xs text-slate-500 dark:text-slate-400">{progress}% done</span></div>
            <div className="space-y-2 max-h-[320px] overflow-auto pr-1 md:pr-2">
              {tasks.length===0 && (<p className="text-sm text-slate-500 dark:text-slate-400">No tasks yet. Add one, or send items from Brain Dump ↑</p>)}
              {tasks.map((t)=>(
                <motion.div key={t.id} layout className="glass hairline rounded-[16px] p-3 flex items-start gap-3">
                  <Switch checked={t.done} onCheckedChange={()=>toggleTask(t.id)}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={t.priority==='H'?'solid':'tinted'}>{t.priority}</Badge>
                      <p className={'font-medium '+(t.done?'line-through text-slate-400 dark:text-slate-500':'')}>{t.text}</p>
                      <Badge variant="outline" className="ml-1">~{t.eta}m</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="icon" variant="ghost" onClick={()=>removeTask(t.id)}><Trash2 className="w-4 h-4"/></Button>
                    <Button size="icon" variant="tinted"><Target className="w-4 h-4"/></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="md:col-span-5 grid gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Coffee className="w-5 h-5"/>Pomodoro</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500 dark:text-slate-400">{onBreak?'Break':'Focus'} time</p><div className="text-4xl font-bold tabular-nums">{niceTime(remaining)}</div></div>
              <div className="flex items-center gap-2">
                <Button variant="primary" size="md" onClick={()=>setIsRunning(r=>!r)}>{isRunning?<> <Pause className='w-4 h-4 mr-1'/>Pause</>:<> <Play className='w-4 h-4 mr-1'/>Start</>}</Button>
                <Button variant="tinted" size="md" onClick={()=>{setIsRunning(false);setOnBreak(false);setRemaining(focusSec);}}><RefreshCcw className="w-4 h-4 mr-1"/>Reset</Button>
              </div>
            </div>
            <Separator className="my-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Focus minutes: {Math.round(focusSec/60)}</p><Slider value={[Math.round(focusSec/60)]} onValueChange={(v)=>setFocusSec(v[0]*60)} min={5} max={90}/></div>
              <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Break minutes: {Math.round(breakSec/60)}</p><Slider value={[Math.round(breakSec/60)]} onValueChange={(v)=>setBreakSec(v[0]*60)} min={3} max={30}/></div>
            </div>
            <div className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"><Flame className="w-4 h-4"/> Pomodoros today: <span className="font-semibold">{completedPomos}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5"/>Energy</CardTitle></CardHeader>
          <CardContent>
            <Slider value={[energy]} onValueChange={(v)=>setEnergy(v[0])} min={1} max={10}/>
            <div className="mt-3 flex flex-wrap gap-2">{energyIdeas.map((i,idx)=>(<Badge key={idx} variant="tinted">{i}</Badge>))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/>Habits</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {habits.map((h)=>(
                <div key={h.id} className="glass hairline rounded-[16px] p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={!!h.history[todayKey]} onCheckedChange={()=>markHabit(h.id)}/>
                    <div><div className="font-medium">{h.name}</div><div className="text-xs text-slate-500 dark:text-slate-400">Streak: {h.streak} 🔥</div></div>
                  </div>
                  <Badge variant="tinted">Today</Badge>
                </div>
              ))}
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%"><BarChart data={weekData}><XAxis dataKey="name"/><Tooltip/><Bar dataKey="value"/></BarChart></ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Gift className="w-5 h-5"/>Dopamine Vault</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <RewardManager rewards={rewards} setRewards={setRewards}/>
            <Button variant="tinted" onClick={()=>alert(`Reward idea: ${randomReward()}`)}>Random treat</Button>
          </CardContent>
        </Card>
      </section>
    </main>

    <Dialog open={focusMode} onOpenChange={setFocusMode}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Focus className="w-5 h-5"/>Focus Mode</DialogTitle></DialogHeader>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Minimal UI. Timer + one task. Timer end = quick break.</p>
          <FocusPanel remaining={remaining} onBreak={onBreak} niceTime={niceTime} onStart={()=>setIsRunning(true)} onPause={()=>setIsRunning(false)}/>
        </div>
        <DialogFooter><Button variant="tinted" onClick={()=>setFocusMode(false)}><X className="w-4 h-4 mr-1"/>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>

    <footer className="max-w-5xl mx-auto px-3 md:px-4 pb-10"><div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">Little wins compound. Keep it tiny. ✨</div></footer>
  </div>);
}

function FocusPanel({ onStart, onPause, remaining, onBreak, niceTime }){
  return (<div className="glass hairline rounded-[18px] p-6">
    <div className="text-sm text-slate-500 dark:text-slate-400">{onBreak?'Break':'Focus'} time remaining</div>
    <div className="text-6xl font-bold tabular-nums my-4">{niceTime(remaining)}</div>
    <div className="flex items-center gap-2 w-full">
      <Button variant="primary" size="md" className="btn-fluid" onClick={onStart}><Play className="w-4 h-4 mr-1"/>Start</Button>
      <Button variant="tinted" size="md" className="btn-fluid" onClick={onPause}><Pause className="w-4 h-4 mr-1"/>Pause</Button>
    </div>
  </div>);
}

function RewardManager({ rewards, setRewards }){
  const [val,setVal]=useState('');
  const add=()=>{ if(!val.trim()) return; setRewards([val.trim(),...rewards]); setVal(''); };
  const remove=(i)=>setRewards(rewards.filter((_,x)=>x!==i));
  return (<div>
    <div className="flex gap-2 mb-2"><Input value={val} onChange={e=>setVal(e.target.value)} placeholder="Add a tiny reward"/><Button variant="primary" onClick={add}><Plus className="w-4 h-4 mr-1"/>Add</Button></div>
    <div className="flex flex-wrap gap-2">{rewards.map((r,i)=>(<Badge key={r+i} className="flex items-center gap-1">{r}<button onClick={()=>remove(i)} className="ml-1 opacity-70 hover:opacity-100"><X className="w-3 h-3"/></button></Badge>))}</div>
  </div>);
}
