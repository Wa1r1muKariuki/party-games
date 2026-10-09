export type Question =
 | { key:string; kind:'text'; prompt:string; answer:string }
 | { key:string; kind:'choice'; prompt:string; options:string[]; answer:number }
 | { key:string; kind:'number'; prompt:string; answer:number | null; image?:string }
 | { key:string; kind:'done'; prompt:string; points:number };
export type Round = { id:string; title:string; blurb:string; questions:Question[] };
export const EVENT_START = '2026-10-09T19:00:00+03:00';
const choices = (key:string,prompt:string,answer:number,options=['Serah','Muraimu']):Question => ({key,kind:'choice',prompt,options,answer});
const words: [string, string, string][] = [
 ['cw1',"The rooftop we're on tonight",'LOCATION'],
 ['cw6','Where Serah and Muraimu first met','GILGIL'],
 ['cw10','Animal that says meow','CAT'],
 ['cw11',"Number of years they've been friends",'TEN'],
 ['cw12','Sweet thing with candles on top','CAKE'],
 ['cw13','Hit this floor when the DJ drops the beat','DANCE'],
 ['cw14',"Muraimu's nickname among friends",'MEISH'],
 ['cw29',"Swahili word for 'apple'",'TUFAHA'],
 ['cw15',"Serah's favourite fruit",'BANANAS'],
 ['cw16','Kwani mi huu?','DO'],
 ['cw22','A book of maps','ATLAS'],
 ['cw23',"Muraimu's favourite colour",'PINK'],
 ['cw24',"Serah's star sign",'LIBRA'],
 ['cw30','Word for an animal active mainly at night','NOCTURNAL'],
];
export const DARES:Question[] = [
 {key:'d5',kind:'done',prompt:'Do your best runway walk to the bar and back',points:20},
 ...['Give each birthday girl a real compliment','Take a selfie with someone you just met tonight','Make a birthday toast in your best dramatic voice','Do a ten-second happy dance','Sing one line of Happy Birthday to the table','Give your best celebrity impression','Pose like a magazine cover for a photo','Introduce yourself to someone new at the table','Tell your best harmless dad joke','Invent a birthday handshake with the person next to you','Give a pretend award speech thanking Serah and Muraimu','Show the table your best dance-floor move','Describe the birthday girls using three lovely words','Make up a two-line birthday rhyme','Strike three red-carpet poses','Lead the table in a birthday cheer','Give your most dramatic wink to the camera','Tell a funny, kind memory about tonight','Do your best slow-motion entrance','Name a song that reminds you of the birthday girls'].map((prompt,i):Question=>({key:`d${i+10}`,kind:'done',prompt,points:15}))
];
export const ROUNDS:Round[] = [
 {id:'friendship',title:'Friendship Questions',blurb:'A little love, said out loud.',questions:[
 {key:'f1',kind:'done',prompt:'Your favourite memory with Serah or Muraimu',points:5},
 {key:'f2',kind:'done',prompt:'One word to describe their friendship',points:5},
 ]},
 {id:'crossword',title:'The Crossword',blurb:'A little wordplay, a lot of us. ♡',questions:words.map(([key,prompt,answer])=>({key,kind:'text',prompt:`${prompt} (${answer.length})`,answer}))},
 {id:'whoknows',title:'Who Knows Us Best',blurb:'How well do you really know us?',questions:[
 choices('wk13','Who is the better cook?',1),
 choices('wk14','Who would say yes first to a last-minute trip?',1),
 choices('wk15','Who is the most forgetful?',0),
 choices('wk6','Who would start a fight with a goose and lose?',2,['Serah','Muraimu','Both, the goose wins']),
 choices('wk16','Who planted a sausage and watered it thinking it would grow?',0),
 choices('wk17','Who is the deep sleeper?',1),
 choices('wk18','Who only watches movies for the sex scenes? 🤣',1),
 choices('wk19',"Who can't lie?",0),
 choices('wk20','Whose celebrity crush is Jason Momoa?',0),
 ]},
 {id:'howold',title:'How Old Was She?',blurb:'A trip down memory lane.',questions:[
 // Put the real age in place of null (for example answer:24). Photos live in the "public" folder.
 {key:'ho1',kind:'number',prompt:'How old was Serah in this photo?',answer:null,image:'/serah-1.jpg'},
 {key:'ho2',kind:'number',prompt:'How old was Serah in this photo?',answer:null,image:'/serah-2.jpg'},
 {key:'ho3',kind:'number',prompt:'How old was Muraimu in this photo?',answer:null,image:'/muraimu-1.jpg'},
 {key:'ho4',kind:'number',prompt:'How old was Muraimu in this photo?',answer:null,image:'/muraimu-2.jpg'},
 ]},
 {id:'dares',title:'Random Dares',blurb:'Nothing crazy — we are watching. ♡',questions:DARES},
];
export function findQuestion(key:string) { for(const round of ROUNDS) { const q=round.questions.find(q=>q.key===key); if(q)return {round,q}; } return null; }
const norm=(s:string)=>s.toUpperCase().replace(/[^A-Z0-9]/g,'');
export function grade(q:Question,value:string):{points:number;correct:boolean} {
 if(q.kind==='done') return {points:q.points,correct:true};
 if(q.kind==='number') { if(q.answer===null)throw new Error('This photo is not ready yet'); const diff=Math.abs(Number(value)-q.answer); return {points:diff===0?10:diff<=2?5:0,correct:diff===0}; }
 const correct=q.kind==='text'?norm(value)===norm(q.answer):Number(value)===q.answer;
 return {points:correct?10:0,correct};
}
