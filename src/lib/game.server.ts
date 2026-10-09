import { supabaseAdmin } from '@/integrations/supabase/client.server';
export const db = supabaseAdmin;
export function checkPin(pin:string) {
 const expected=process.env['HOST_PIN'];
 if(!expected || pin!==expected) throw new Error('Wrong PIN');
}
export async function player(id:string,token:string) {
 const {data,error}=await db.from('players').select('id,dare_key').eq('id',id).eq('token',token).maybeSingle();
 if(error || !data)throw new Error('Please join the game again');
 return data;
}
export async function saveAnswer(id:string,key:string,points:number) {
 const {error}=await db.from('answers').insert({player_id:id,qkey:key,points});
 if(error && error.code!=='23505')throw new Error('Could not save your answer. Please try again.');
 const {data}=await db.from('answers').select('points').eq('player_id',id).eq('qkey',key).single();
 return {points:data?.points ?? points,already:!!error};
}
