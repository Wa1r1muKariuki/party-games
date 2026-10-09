import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { DARES, EVENT_START, findQuestion, grade, ROUNDS } from './game-content';
const credential=z.object({playerId:z.string().uuid(),token:z.string().uuid()});
export const joinGame=createServerFn({method:'POST'}).inputValidator((d:unknown)=>z.object({name:z.string().trim().min(1).max(24)}).parse(d)).handler(async({data})=>{
 const {db}=await import('./game.server');
 const {data:row,error}=await db.rpc('party_join',{player_name:data.name,dare_keys:DARES.map(q=>q.key)}).single();
 if(error || !row)throw new Error('Could not join. Please try again.');
 return row;
});
export const myAnswers=createServerFn({method:'POST'}).inputValidator((d:unknown)=>credential.parse(d)).handler(async({data})=>{
 const {db,player}=await import('./game.server');
 try { const p=await player(data.playerId,data.token); const {data:answers,error}=await db.from('answers').select('qkey,points').eq('player_id',p.id); if(error)throw error; return {valid:true,answers:answers??[],dare_key:p.dare_key}; }catch {return {valid:false,answers:[],dare_key:''};}
});
export const submitAnswer=createServerFn({method:'POST'}).inputValidator((d:unknown)=>credential.extend({qkey:z.string().max(20),value:z.string().min(1).max(100)}).parse(d)).handler(async({data})=>{
 const {db,player,saveAnswer}=await import('./game.server');
 const p=await player(data.playerId,data.token);
  const found=findQuestion(data.qkey); if(!found)throw new Error('Unknown question');
  const {data:state}=await db.from('game_state').select('unlocked,preview').eq('id',1).maybeSingle();
  if(Date.now()<Date.parse(EVENT_START) && !state?.preview)throw new Error('The games start at 7 pm');
  if(!(state?.unlocked??['crossword']).includes(found.round.id))throw new Error('This round is locked');
 if(found.round.id==='dares' && data.qkey!==p.dare_key)throw new Error('That is not your dare');
 const result=grade(found.q,data.value); return {...result,...await saveAnswer(p.id,data.qkey,result.points)};
});
export const claimBonus=createServerFn({method:'POST'}).inputValidator((d:unknown)=>credential.parse(d)).handler(async({data})=>{
 const {player,saveAnswer}=await import('./game.server'); const p=await player(data.playerId,data.token);
 if(Date.now()<Date.parse(EVENT_START))throw new Error('The celebration starts at 7 pm');
 return saveAnswer(p.id,'birthday-bonus',10);
});
export const hostCheckPin=createServerFn({method:'POST'}).inputValidator((d:unknown)=>z.object({pin:z.string().max(20)}).parse(d)).handler(async({data})=>{ const {checkPin}=await import('./game.server');checkPin(data.pin);return {ok:true}; });
export const hostSetRounds=createServerFn({method:'POST'}).inputValidator((d:unknown)=>z.object({pin:z.string().max(20),unlocked:z.array(z.string()).max(ROUNDS.length)}).parse(d)).handler(async({data})=>{
 const {db,checkPin}=await import('./game.server');checkPin(data.pin);
 const {error}=await db.from('game_state').upsert({id:1,unlocked:ROUNDS.map(r=>r.id).filter(id=>data.unlocked.includes(id)),updated_at:new Date().toISOString()});if(error)throw new Error('Could not update rounds');return {ok:true};
});
export const hostSetPreview=createServerFn({method:'POST'}).inputValidator((d:unknown)=>z.object({pin:z.string().max(20),preview:z.boolean()}).parse(d)).handler(async({data})=>{
  const {db,checkPin}=await import('./game.server');checkPin(data.pin);
  const {error}=await db.from('game_state').upsert({id:1,preview:data.preview,updated_at:new Date().toISOString()});if(error)throw new Error('Could not update preview');return {ok:true};
});
export const hostReset=createServerFn({method:'POST'}).inputValidator((d:unknown)=>z.object({pin:z.string().max(20)}).parse(d)).handler(async({data})=>{
  const {db,checkPin}=await import('./game.server');checkPin(data.pin);
  const {error}=await db.from('players').delete().neq('id','00000000-0000-0000-0000-000000000000');if(error)throw new Error('Could not reset game');
  await db.from('game_state').upsert({id:1,unlocked:[],preview:false});return {ok:true};
});
