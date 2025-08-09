import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle2, Clock, Coffee, Focus, ListChecks, Plus, Rocket, Settings, Star, Target, Trash2, Volume2, X, Flame, Gift, Play, Pause, RefreshCcw, Maximize2, Minimize2, Bug, Moon, Sun } from "lucide-react";
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

/********************* Utilities *********************/
const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const useLocal = (key, initial) => {
  const [val, setVal] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]); return [val, setVal];
};
const niceTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const suggestionsByEnergy = (energy) => { if (energy <= 2) return ["Short 15-min focus", "Low-stim task", "Hydrate & snack"]; if (energy <= 4) return ["Standard 25/5 Pomodoro", "Tidy workspace 2 min", "Pick one small win"]; if (energy <= 7) return ["Deep work 45/10", "Batch similar tasks", "Turn on white noise"]; return ["Stretch goal sprint", "Tackle hardest task first", "Celebrate with a reward"]; };

/********************* WebAudio *********************/
const useWhiteNoise = () => {
  const ctxRef = useRef(null); const noiseRef = useRef(null); const [on, setOn] = useState(false);
  const toggle = async () => { if (on) { try { noiseRef.current?.stop?.(); } catch {}; noiseRef.current = null; setOn(false); return; }
    try { const Ctx = window.AudioContext || window.webkitAudioContext; const ctx = ctxRef.current || new Ctx(); ctxRef.current = ctx; if (ctx.state === "suspended") await ctx.resume();
      const bufferSize = 2 * ctx.sampleRate; const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate); const output = noiseBuffer.getChannelData(0); for (let i=0;i<bufferSize;i++) output[i] = Math.random()*2-1;
      const whiteNoise = ctx.createBufferSource(); whiteNoise.buffer = noiseBuffer; const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 1000;
      whiteNoise.connect(filter); filter.connect(ctx.destination); whiteNoise.loop = true; whiteNoise.start(); noiseRef.current = whiteNoise; setOn(true);
    } catch {} };
  useEffect(()=>()=>{ try { noiseRef.current?.stop?.(); } catch {} }, []);
  return { on, toggle };
};
const beep = () => { try { const Ctx = window.AudioContext || window.webkitAudioContext; const ctx = new Ctx(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.type="sine"; o.frequency.setValueAtTime(880, ctx.currentTime); g.gain.setValueAtTime(0.001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.35);} catch {} };

/********************* Fullscreen guards *********************/
const isDocActive = () => { if (typeof document === "undefined") return false; const visible = document.visibilityState === "visible"; const focused = typeof document.hasFocus === "function" ? document.hasFocus() : true; return visible && focused; };
const requestFullscreenSafe = async (el) => { try { if (!el?.requestFullscreen) return; if (!isDocActive()) return; await el.requestFullscreen(); } catch {} };
const exitFullscreenSafe = async () => { try { if (!document?.exitFullscreen) return; if (!document.fullscreenElement) return; if (!isDocActive()) return; await document.exitFullscreen(); } catch {} };

/********************* App *********************/
export default function ADHDFocusHub() {
  const [tasks, setTasks] = useLocal("adhd.tasks", []);
  const [taskInput, setTaskInput] = useState(""); const [priority, setPriority] = useState("M"); const [eta, setEta] = useState(15); const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [dump, setDump] = useLocal("adhd.dump", "");
  const [focusSec, setFocusSec] = useLocal("adhd.focusSec", 25*60); const [breakSec, setBreakSec] = useLocal("adhd.breakSec", 5*60); const [remaining, setRemaining] = useState(focusSec); const [isRunning, setIsRunning] = useState(false); const [onBreak, setOnBreak] = useState(false); const [completedPomos, setCompletedPomos] = useLocal("adhd.pomos", 0);
  const [energy, setEnergy] = useLocal("adhd.energy", 5); const [focusMode, setFocusMode] = useState(false); const [fullscreen, setFullscreen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [habits, setHabits] = useLocal("adhd.habits", [{id:1,name:"Medicate / Vitamins",streak:0,history:{}},{id:2,name:"Move 10 min",streak:0,history:{}},{id:3,name:"Inbox Zero Sweep",streak:0,history:{}}]);
  const [rewards, setRewards] = useLocal("adhd.rewards", ["Watch one funny clip","Make a fancy tea/coffee","5-min game break","Text a friend a meme","Stretch on the floor"]);
  const { on: whiteNoiseOn, toggle: toggleNoise } = useWhiteNoise();

  useEffect(()=>setRemaining(onBreak?breakSec:focusSec),[focusSec,breakSec,onBreak]);
  useEffect(()=>{ if(!isRunning) return; const id=setInterval(()=>{ setRemaining(r=>{ if(r<=1){ clearInterval(id); beep(); if(!onBreak) setCompletedPomos(p=>p+1); setOnBreak(!onBreak); setIsRunning(false); return onBreak?focusSec:breakSec; } return r-1;}); },1000); return ()=>clearInterval(id);},[isRunning,onBreak,focusSec,breakSec,setCompletedPomos]);
  useEffect(()=>{ const onVis=()=>{ if(document.visibilityState!=='visible') setIsRunning(false)}; window.addEventListener('visibilitychange',onVis); window.addEventListener('blur',onVis); return ()=>{window.removeEventListener('visibilitychange',onVis); window.removeEventListener('blur',onVis)};},[]);
  useEffect(()=>{ const el=document.documentElement; if(fullscreen) requestFullscreenSafe(el); else exitFullscreenSafe();},[fullscreen]);
  useEffect(()=>{ const onChange=()=>{ const isFs=!!document.fullscreenElement; setFullscreen(prev=>prev!==isFs?isFs:prev)}; document.addEventListener('fullscreenchange',onChange); return ()=>document.removeEventListener('fullscreenchange',onChange);},[]);

  const todayKey = useMemo(()=>new Date().toISOString().slice(0,10),[]);
  const energyIdeas = suggestionsByEnergy(energy);
  const progress = useMemo(()=>{ const done=tasks.filter(t=>t.done).length; return tasks.length?Math.round((done/tasks.length)*100):0; },[tasks]);

  const addTask=()=>{ if(!taskInput.trim()) return; const t={id:uid(),text:taskInput.trim(),priority,eta,done:false,createdAt:Date.now(),subtasks:[]}; setTasks([t,...tasks]); setTaskInput(''); };
  const toggleTask=(id)=>setTasks(tasks.map(t=>t.id===id?{...t,done:!t.done}:t));
  const removeTask=(id)=>setTasks(tasks.filter(t=>t.id!==id));

  const markHabit=(id)=>{ setHabits(hs=>hs.map(h=>{ if(h.id!==id) return h; const history={...h.history,[todayKey]:true}; const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10); const streak=history[todayKey]?(h.history[yesterday]?h.streak+1:1):h.streak; return {...h,history,streak}; }))};
  const weekData=useMemo(()=>{ const days=Array.from({length:7},(_,i)=>{ const d=new Date(Date.now()-(6-i)*86400000); const k=d.toISOString().slice(0,10); return {name:d.toLocaleDateString(undefined,{weekday:'short'}), value:habits.reduce((acc,h)=>acc+(h.history[k]?1:0),0)};}); return days;},[habits]);
  const randomReward=()=>rewards[Math.floor(Math.random()*rewards.length)];

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('adhd.theme', next);
  };

  return (<div className="min-h-screen">
    {/* Glass header */}
    <header className="sticky top-0 z-30 glass border-b border-black/5 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 flex items-center gap-3">
        <Rocket className="w-6 h-6" />
        <h1 className="text-xl font-semibold tracking-tight">ADHD Hub</h1>
        <Badge className="ml-1" variant="tinted">Beta</Badge>

        <div className="ml-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Focus mode */}
          <Button variant="ghost" size="icon" aria-label="Focus mode" onClick={()=>setFocusMode(true)}><Focus className="w-4 h-4" /></Button>
          {/* Noise */}
          <Button variant="tinted" size="icon" aria-label="Toggle white noise" onClick={toggleNoise}><Volume2 className="w-4 h-4" /></Button>
          {/* Fullscreen */}
          <Button variant="ghost" size="icon" onClick={()=>setFullscreen(f=>!f)} title="Toggle fullscreen">
            {fullscreen? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
          {/* Theme */}
          <Button variant="tinted" size="icon" onClick={toggleTheme} title="Toggle theme">
            {theme==='dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" title="Settings"><Settings className="w-5 h-5" /></Button>
        </div>
      </div>
    </header>

    <main className="max-w-6xl mx-auto px-3 md:px-4 py-6 grid gap-6 md:grid-cols-12">
      {/* Left column */}
      <section className="md:col-span-7 grid gap-6">
        {/* Brain Dump */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5"/>Brain Dump</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={dump} onChange={(e)=>setDump(e.target.value)} placeholder="Type everything swirling in your head. No order needed." className="min-h-[120px]"/>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button size="md" fluid onClick={()=>setDump('')}>Clear</Button>
              <Button size="md" variant="tinted" fluid onClick={()=>{
                if(!dump.trim()) return;
                const newTasks=dump.split(/\n+/).map(l=>l.trim()).filter(Boolean).map(l=>({id:uid(),text:l,priority:'M',eta:15,done:false,createdAt:Date.now(),subtasks:[]}));
                setTasks(ts=>[...newTasks,...ts]); setDump('');
              }}>Send to Tasks</Button>
              <Badge variant="outline" className="sm:ml-auto self-start sm:self-auto">Tip: messy is okay</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5"/>Task Sprint</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col md:flex-row gap-2">
              <Input value={taskInput} onChange={(e)=>setTaskInput(e.target.value)} placeholder="Add a task (keep it tiny!)" className="w-full"/>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <select className="w-full sm:w-36 rounded-2xl px-4 py-3 bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10" value={priority} onChange={(e)=>setPriority(e.target.value)}>
                  <option value="H">High</option><option value="M">Medium</option><option value="L">Low</option>
                </select>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Clock className="w-4 h-4 shrink-0"/>
                  <Input type="number" className="w-full sm:w-24" value={eta} onChange={(e)=>setEta(Number(e.target.value||15))}/>
                  <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">min</span>
                </div>
                <Button variant="primary" size="md" fluid className="sm:w-auto" onClick={addTask}>
                  <Plus className="w-4 h-4 mr-1"/>Add
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Progress value={progress} className="h-2"/>
              <span className="text-xs text-slate-500 dark:text-slate-400">{progress}% done</span>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-auto pr-1 md:pr-2">
              {tasks.length===0 && (<p className="text-sm text-slate-500 dark:text-slate-400">No tasks yet. Add one, or send items from Brain Dump ↑</p>)}
              {tasks.map((t)=>(
                <motion.div key={t.id} layout className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-3 flex items-start gap-3">
                  <Switch checked={t.done} onCheckedChange={()=>toggleTask(t.id)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={t.priority==='H'?'solid':'tinted'}>{t.priority}</Badge>
                      <p className={'font-medium ' + (t.done?'line-through text-slate-400 dark:text-slate-500':'')}>{t.text}</p>
                      <Badge variant="outline" className="ml-1">~{t.eta}m</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="icon" variant="ghost" onClick={()=>removeTask(t.id)}><Trash2 className="w-4 h-4"/></Button>
                    <Button size="icon" variant="tinted" title="Focus on this"><Target className="w-4 h-4"/></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Right column */}
      <section className="md:col-span-5 grid gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Coffee className="w-5 h-5"/>Pomodoro</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500 dark:text-slate-400">{onBreak ? "Break" : "Focus"} time</p><div className="text-4xl font-bold tabular-nums">{niceTime(remaining)}</div></div>
              <div className="flex items-center gap-2">
                <Button variant="primary" size="md" onClick={()=>setIsRunning(r=>!r)}>{isRunning ? <><Pause className="w-4 h-4 mr-1"/>Pause</> : <><Play className="w-4 h-4 mr-1"/>Start</>}</Button>
                <Button variant="tinted" size="md" onClick={()=>{setIsRunning(false); setOnBreak(false); setRemaining(focusSec);}}><RefreshCcw className="w-4 h-4 mr-1"/>Reset</Button>
              </div>
            </div>
            <Separator className="my-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Focus minutes: {Math.round(focusSec/60)}</p><Slider value={[Math.round(focusSec/60)]} onValueChange={(v)=>setFocusSec(v[0]*60)} min={5} max={90}/></div>
              <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Break minutes: {Math.round(breakSec/60)}</p><Slider value={[Math.round(breakSec/60)]} onValueChange={(v)=>setBreakSec(v[0]*60)} min={3} max={30}/></div>
            </div>
            <div className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"><Flame className="w-4 h-4"/> Pomodoros completed today: <span className="font-semibold">{completedPomos}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5"/>Energy Check-in</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">How charged do you feel?</div>
            <Slider value={[energy]} onValueChange={(v)=>setEnergy(v[0])} min={1} max={10}/>
            <div className="mt-3 flex flex-wrap gap-2">{energyIdeas.map((i, idx) => (<Badge key={idx} variant="outline">{i}</Badge>))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/>Daily Habits</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {habits.map((h)=>(
                <div key={h.id} className="flex items-center justify-between border border-black/10 dark:border-white/10 rounded-2xl p-3 bg-white/70 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <Switch checked={!!h.history[todayKey]} onCheckedChange={()=>markHabit(h.id)}/>
                    <div><div className="font-medium">{h.name}</div><div className="text-xs text-slate-500 dark:text-slate-400">Streak: {h.streak} 🔥</div></div>
                  </div>
                  <Badge variant="tinted">Today</Badge>
                </div>
              ))}
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}><XAxis dataKey="name"/><Tooltip/><Bar dataKey="value"/></BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Gift className="w-5 h-5"/>Dopamine Vault</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <RewardManager rewards={rewards} setRewards={setRewards} />
            <Button variant="tinted" onClick={()=>alert(`Reward idea: ${randomReward()}`)}>Gimme a random treat</Button>
          </CardContent>
        </Card>
      </section>
    </main>

    {/* Focus Mode */}
    <Dialog open={focusMode} onOpenChange={setFocusMode}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Focus className="w-5 h-5"/>Focus Mode</DialogTitle></DialogHeader>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Minimal UI. Timer + one task. When the timer ends, stand up, breathe, then resume.</p>
          <FocusPanel task={tasks.find(t=>t.id===selectedTaskId)}
            onClose={()=>setFocusMode(false)} onStart={()=>setIsRunning(true)} onPause={()=>setIsRunning(false)}
            remaining={remaining} onBreak={onBreak} niceTime={niceTime} />
        </div>
        <DialogFooter><Button variant="tinted" onClick={()=>setFocusMode(false)}><X className="w-4 h-4 mr-1"/>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>

    <DevTests />
    <footer className="max-w-6xl mx-auto px-3 md:px-4 pb-10">
      <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">Little wins compound. Keep it tiny. ✨</div>
    </footer>
  </div>);
}

/********************* Subcomponents *********************/
function FocusPanel({ task, onClose, onStart, onPause, remaining, onBreak, niceTime }){
  return (<div className="rounded-3xl glass p-6 border border-black/10 dark:border-white/10">
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Current Task</div>
        <div className="text-2xl font-semibold mt-1">{task?.text || "Pick a task from the list"}</div>
        {task && (<div className="mt-2 flex items-center gap-2 flex-wrap"><Badge variant={task.priority==='H'?'solid':'tinted'}>{task.priority}</Badge><Badge variant="outline">~{task.eta}m</Badge></div>)}
      </div>
      <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5"/></Button>
    </div>
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 flex flex-col items-center justify-center">
        <div className="text-sm text-slate-500 dark:text-slate-400">{onBreak ? "Break" : "Focus"} time remaining</div>
        <div className="text-6xl font-bold tabular-nums my-4">{niceTime(remaining)}</div>
        <div className="flex items-center gap-2 w-full"><Button variant="primary" size="md" fluid onClick={onStart}><Play className="w-4 h-4 mr-1"/>Start</Button><Button variant="tinted" size="md" fluid onClick={onPause}><Pause className="w-4 h-4 mr-1"/>Pause</Button></div>
      </div>
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Break prompts</div>
        <ul className="list-disc ml-5 text-sm space-y-1"><li>Stand, stretch, sip water</li><li>Look far away 20s (rest eyes)</li><li>Note one win in your day</li><li>Pick a tiny next step</li></ul>
      </div>
    </div>
  </div>);
}

function RewardManager({ rewards, setRewards }){
  const [val, setVal] = useState("");
  const add = ()=>{ if(!val.trim()) return; setRewards([val.trim(), ...rewards]); setVal(""); };
  const remove = (idx)=>setRewards(rewards.filter((_,i)=>i!==idx));
  return (<div>
    <div className="flex gap-2 mb-2">
      <Input value={val} onChange={(e)=>setVal(e.target.value)} placeholder="Add a tiny reward"/>
      <Button variant="primary" onClick={add}><Plus className="w-4 h-4 mr-1"/>Add</Button>
    </div>
    <div className="flex flex-wrap gap-2">
      {rewards.map((r,i)=>(<Badge key={`${r}-${i}`} className="flex items-center gap-1">{r}<button onClick={()=>remove(i)} className="ml-1 opacity-70 hover:opacity-100"><X className="w-3 h-3"/></button></Badge>))}
    </div>
  </div>);
}

/********************* Dev Tests *********************/
function _nextTick(remaining,onBreak,focusSec,breakSec){ if(remaining<=1) return {remaining:onBreak?focusSec:breakSec,onBreak:!onBreak,flipped:true}; return {remaining:remaining-1,onBreak,flipped:false}; }
function _canFullscreenAction({visible,focused,isFullscreen,wantExit}){ const active=visible&&focused; if(wantExit) return active&&isFullscreen; return active; }
function runSelfTests(){ const out=[]; const nt=[{s:0,want:"00:00"},{s:5,want:"00:05"},{s:65,want:"01:05"}]; nt.forEach(({s,want})=>out.push({name:`niceTime(${s})`,pass:niceTime(s)===want,details:niceTime(s)})); const s2=suggestionsByEnergy(2)[0]==="Short 15-min focus"; const s3=suggestionsByEnergy(3)[0]==="Standard 25/5 Pomodoro"; const s7=suggestionsByEnergy(7)[0]==="Deep work 45/10"; const s8=suggestionsByEnergy(8)[0]==="Stretch goal sprint"; out.push({name:"energy=2 bucket",pass:s2}); out.push({name:"energy=3 bucket",pass:s3}); out.push({name:"energy=7 bucket",pass:s7}); out.push({name:"energy=8 bucket",pass:s8}); const a=_nextTick(1,false,1500,300); out.push({name:"flip to break",pass:a.flipped&&a.onBreak===true&&a.remaining===300}); const b=_nextTick(1,true,1500,300); out.push({name:"flip to focus",pass:b.flipped&&b.onBreak===false&&b.remaining===1500}); const c=_nextTick(42,false,1500,300); out.push({name:"tick down",pass:!c.flipped&&c.remaining===41}); out.push({name:"can request FS when active",pass:_canFullscreenAction({visible:true,focused:true,isFullscreen:false,wantExit:false})}); out.push({name:"cannot request FS when hidden",pass:!_canFullscreenAction({visible:false,focused:true,isFullscreen:false,wantExit:false})}); out.push({name:"can safely exit only if active + in FS",pass:_canFullscreenAction({visible:true,focused:true,isFullscreen:true,wantExit:true})}); out.push({name:"won't exit if not in FS",pass:!_canFullscreenAction({visible:true,focused:true,isFullscreen:false,wantExit:true})}); return out; }
function DevTests(){ const [open,setOpen]=useState(false); const tests=useMemo(()=>runSelfTests(),[]); const passed=tests.every(t=>t.pass); return (<div className="max-w-6xl mx-auto px-3 md:px-4 my-6"><button onClick={()=>setOpen(o=>!o)} className="text-xs inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur hover:bg-white/80"><Bug className="w-3.5 h-3.5"/> {open?"Hide":"Show"} self-tests {passed?"✅":"⚠️"}</button>{open&&(<div className="mt-3 grid gap-2">{tests.map((t,i)=>(<div key={i} className={`text-xs p-2 rounded border ${t.pass?"bg-emerald-50/60 border-emerald-300/50 dark:bg-emerald-500/10 dark:border-emerald-500/30":"bg-rose-50/60 border-rose-300/50 dark:bg-rose-500/10 dark:border-rose-500/30"}`}><div className="font-medium">{t.name}</div><div>{t.pass?"PASS":"FAIL"}</div></div>))}</div>)}</div>); }
