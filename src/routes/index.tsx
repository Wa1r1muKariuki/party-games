import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useState } from 'react';
import { ArrowLeft, Camera, Heart, LockKeyhole, Music2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Leaderboard, Ransom } from '@/components/party';
import { ROUNDS, EVENT_START, type Question } from '@/lib/game-content';
import { claimBonus, joinGame, myAnswers, submitAnswer } from '@/lib/game.functions';
import { useGameState, useLeaderboard } from '@/lib/use-live';
export const Route=createFileRoute('/')({head:()=>({meta:[
 {title:'Serah x Muraimu — Birthday Games'},
 {name:'description',content:'Celebrate Serah and Muraimu at Location Rooftop, Kilimani, on 9 October. Party games begin at 7 pm Nairobi time.'},
 {property:'og:title',content:'Serah x Muraimu — Birthday Games'},
 {property:'og:description',content:'A birthday night of friendship, wordplay and a little mischief.'},
 {property:'og:type',content:'website'},
 {name:'twitter:card',content:'summary_large_image'},
]}),component:Index});
type Me={id:string;token:string;name:string;dare_key:string};
const KEY='sxm-player';
const capital=(name:string)=>name.replace(/\b\p{L}/gu,c=>c.toUpperCase());
function celebrate(){ if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return; void import('canvas-confetti').then(({default:confetti})=>{void confetti({particleCount:140,spread:110,origin:{y:0.65},disableForReducedMotion:true});}); }
function Index(){
 const [me,setMe]=useState<Me|null>(null);
 const [ready,setReady]=useState(false);
 const [answered,setAnswered]=useState<Record<string,number>>({});
 const [tab,setTab]=useState<string|null>(null);
 const [now,setNow]=useState<number|null>(null);
 const [showWelcome,setShowWelcome]=useState(false);
 const [bonusError,setBonusError]=useState('');
 const players=useLeaderboard(); const {unlocked,preview}=useGameState();
 const restore=useServerFn(myAnswers), bonus=useServerFn(claimBonus);
 const started=now!==null && now>=Date.parse(EVENT_START);
 useEffect(()=>{setNow(Date.now());const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{async function load(){try{const raw=localStorage.getItem(KEY);if(raw){const stored=JSON.parse(raw) as Me;const r=await restore({data:{playerId:stored.id,token:stored.token}});if(r.valid){setMe({...stored,dare_key:r.dare_key});setAnswered(Object.fromEntries(r.answers.map(a=>[a.qkey,a.points])));}else localStorage.removeItem(KEY);}}catch{localStorage.removeItem(KEY);}finally{setReady(true);}}void load();},[restore]);
 useEffect(()=>{if(!started || !me || answered['birthday-bonus']!==undefined)return;let alive=true;void bonus({data:{playerId:me.id,token:me.token}}).then(r=>{if(!alive)return;setAnswered(a=>({...a,'birthday-bonus':r.points}));setBonusError('');if(!r.already)celebrate();}).catch(()=>{if(alive)setBonusError('Your birthday points could not be saved yet.');});return()=>{alive=false;};},[started,me,answered,bonus]);
 useEffect(()=>{if(!started)return;const key='sxm-celebrated';if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'yes');celebrate();}},[started]);
 const current=ROUNDS.find(r=>r.id===tab);
 const score=Math.max(players.find(p=>p.id===me?.id)?.score??0,Object.values(answered).reduce((a,b)=>a+b,0));
 const left=now===null?null:Math.max(0,Math.ceil((Date.parse(EVENT_START)-now)/1000));
 const digits=left===null?'–– : –– : ––':`${String(Math.floor(left/3600)).padStart(2,'0')} : ${String(Math.floor(left%3600/60)).padStart(2,'0')} : ${String(left%60).padStart(2,'0')}`;
 return <main className="mx-auto min-h-screen max-w-md px-4 pb-12 pt-6">
 <header className="text-center"><p className="font-hand text-2xl">it's a joint birthday dinner!</p><h1 className="my-3"><Ransom text="SERAH x MURAIMU" className="party-title"/></h1><p className="sticker inline-block -rotate-1 text-[10px] sm:text-xs">FRI 9 OCT · LOCATION ROOFTOP, KILIMANI</p></header>
 <div className="countdown mt-6 text-center" aria-live="off"><p className="font-hand text-xl">{started?"It's our birthday night! ♡":"The party starts in…"}</p>{!started && <p className="clock-digits my-1" aria-label="Countdown to 7 pm">{digits}</p>}<p className="text-xs text-muted-foreground">{started?'Let the good times begin':'7:00 PM · NAIROBI TIME'}</p></div>
 {(!me || showWelcome) && <><div className="polaroid relative mt-7 -rotate-1"><div className="tape"/><img src="/birthday-collage.jpg" onError={e=>{e.currentTarget.style.display='none';}} alt="Serah and Muraimu’s birthday scrapbook, with photos of the two friends" width={976} height={768} className="event-photo"/><p className="mt-3 text-center font-hand text-2xl">Two birthday girls. One unforgettable night. ♡</p></div>{ready && !me?<Join onJoin={m=>{localStorage.setItem(KEY,JSON.stringify(m));setMe(m);setShowWelcome(false);}}/>:me?<Button variant="party" className="mt-6 w-full" onClick={()=>setShowWelcome(false)}>BACK TO THE PARTY <Heart/></Button>:<p className="mt-6 text-center font-hand text-xl">Getting the party ready…</p>}</>}
 {me && !showWelcome && <>
 <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><p className="min-w-0 truncate font-hand text-3xl">Hey {capital(me.name)}!</p><p className="sticker shrink-0 rotate-2">{score} pts</p></div>
 <Button variant="ghost" className="mt-3 px-0" onClick={()=>{if(tab)setTab(null);else setShowWelcome(true);}}><ArrowLeft/>{tab?'All games':'Back'}</Button>
 {answered['birthday-bonus']!==undefined && <p className="my-3 flex items-center gap-2 font-hand text-2xl text-success"><Sparkles/> +10 birthday points — on us!</p>}
 {bonusError && <div className="text-sm text-destructive">{bonusError}<Button variant="ghost" onClick={async()=>{try{const r=await bonus({data:{playerId:me.id,token:me.token}});setAnswered(a=>({...a,'birthday-bonus':r.points}));setBonusError('');}catch{setBonusError('Please try again shortly.');}}}>Try again</Button></div>}
 {!current?<div className="mt-6 space-y-3">{ROUNDS.map(r=>{const live=(started || preview) && unlocked.includes(r.id);return <Button key={r.id} variant="track" disabled={!live} className="polaroid flex w-full items-center justify-between gap-4 p-4 text-left" onClick={()=>setTab(r.id)}><span className="min-w-0 font-display text-xl">{r.title}</span>{live?<Music2 className="shrink-0"/>:<LockKeyhole className="shrink-0"/>}</Button>;})}</div>:<section className="mt-4"><div className="mb-6 border-b border-dashed pb-4"><h2 className="font-display text-3xl">{current.title}</h2><p className="font-hand text-xl">{current.blurb}</p>{current.id==='friendship' && <p className="mt-2 text-xs text-muted-foreground">OUT LOUD · 5 POINTS EACH</p>}</div>{(started || preview) && unlocked.includes(current.id)?<div className="space-y-5">{current.questions.filter(q=>current.id!=='dares'||q.key===me.dare_key).map((q,i)=><QuestionCard key={q.key} q={q} index={i} me={me} done={answered[q.key]} onDone={pts=>setAnswered(a=>({...a,[q.key]:pts}))}/>)}</div>:<p className="font-hand text-2xl">This round is waiting for the host. ♡</p>}<Button variant="ghost" className="mt-6" onClick={()=>setTab(null)}><ArrowLeft/> All games</Button></section>}
 <div className="mt-10"><Leaderboard players={players} meId={me.id}/></div></>}
 <footer className="mt-10 text-center"><p className="font-hand text-xl">with love, Serah x Muraimu ♡</p><Link to="/host" className="mt-3 inline-block text-xs text-muted-foreground">Host corner</Link></footer>
 </main>;
}
function Join({onJoin}:{onJoin:(m:Me)=>void}){
 const [name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');const join=useServerFn(joinGame);
 return <form className="mt-7" onSubmit={async e=>{e.preventDefault();if(!name.trim())return;setBusy(true);setError('');try{onJoin(await join({data:{name:name.trim()}}));}catch{setError('Could not join just yet. Please try again.');}finally{setBusy(false);}}}><label className="block font-hand text-3xl" htmlFor="name">write your name, love❤</label><input id="name" required autoComplete="given-name" className="field mt-2" maxLength={24} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/><Button variant="party" className="mt-4 w-full" disabled={busy}>{busy?'JOINING…':"LET'S PLAY"}<Heart/></Button>{error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}</form>;
}
function QuestionCard({q,index,me,done,onDone}:{q:Question;index:number;me:Me;done?:number | undefined;onDone:(p:number)=>void}){
 const [value,setValue]=useState(''),[busy,setBusy]=useState(false),[err,setErr]=useState('');const submit=useServerFn(submitAnswer);
 const send=async(v:string)=>{if(!v.trim()||busy)return;setBusy(true);setErr('');try{const r=await submit({data:{playerId:me.id,token:me.token,qkey:q.key,value:v}});onDone(r.points);}catch(e){setErr(e instanceof Error?e.message:'Please try again');}finally{setBusy(false);}};
 return <div className="polaroid"><p className="text-lg"><span className="font-block text-primary">{index+1}. </span>{q.prompt}</p>
 {q.kind==='number' && q.answer===null?<div className="mt-4"><div className="age-placeholder"><div className="text-center"><Camera className="mx-auto mb-3 size-9"/><p className="font-hand text-2xl">Photo coming soon ♡</p></div></div><p className="mt-2 text-center text-xs text-muted-foreground">Waiting for the birthday girl’s photo & age</p></div>:done!==undefined?<p className={`mt-3 font-hand text-2xl ${done>0?'text-success':'text-hot'}`}>{done>0?`+${done} pts ✓`:'Not this time! 0 pts'}</p>:q.kind==='choice'?<div className="mt-3 grid grid-cols-2 gap-2">{q.options.map((o,i)=><Button variant="choice" key={o} disabled={busy} onClick={()=>void send(String(i))} className="min-h-12 px-2 py-2 font-type">{o}</Button>)}</div>:q.kind==='done'?<Button variant="party" disabled={busy} onClick={()=>void send('done')} className="mt-4">{busy?'SAVING…':`DONE IT · +${q.points}`}</Button>:<form className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2" onSubmit={e=>{e.preventDefault();void send(value);}}><input className="field min-w-0 uppercase" aria-label={`Answer: ${q.prompt}`} inputMode={q.kind==='number'?'numeric':'text'} value={value} onChange={e=>setValue(e.target.value)} placeholder={q.kind==='number'?'Age':'Your answer'} maxLength={q.kind==='text'?q.answer.length+4:3} required/><Button variant="party" disabled={busy}>GO</Button></form>}
 {q.kind==='text' && done===undefined && <div className="mt-3 flex gap-1" aria-label={`${q.answer.length} letters`}>{q.answer.split('').map((_,i)=><span key={i} className="h-6 w-6 border bg-paper text-center text-sm">{value[i]?.toUpperCase()}</span>)}</div>}
 {err && <p role="alert" className="mt-3 text-sm text-destructive">{err}</p>}</div>;
}
