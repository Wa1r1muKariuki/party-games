// All party content lives here. Edit freely — scoring reads from this file.
export type Question =
  | { key: string; kind: "text"; prompt: string; answer: string; hint?: string }
  | { key: string; kind: "choice"; prompt: string; options: string[]; answer: number }
  | { key: string; kind: "number"; prompt: string; answer: number }
  | { key: string; kind: "done"; prompt: string; points: number };

export type Round = {
  id: string;
  title: string;
  tag: string;
  blurb: string;
  questions: Question[];
};

export const ROUNDS: Round[] = [
  {
    id: "crossword",
    title: "The Crossword",
    tag: "side A · track 1",
    blurb: "Fill in the blanks about the birthday girls. 10 pts a word.",
    questions: [
      { key: "cw1", kind: "text", prompt: "The rooftop we're on tonight (7)", answer: "LOCATIO" },
      { key: "cw2", kind: "text", prompt: "Neighbourhood of tonight's dinner (8)", answer: "KILIMANI" },
      { key: "cw3", kind: "text", prompt: "Birthday month (7)", answer: "OCTOBER" },
      { key: "cw4", kind: "text", prompt: "Serah's go-to drink (?)", answer: "WINE" },
      { key: "cw5", kind: "text", prompt: "Muraimu's favourite food (?)", answer: "PIZZA" },
      { key: "cw6", kind: "text", prompt: "City where they first met (?)", answer: "NAIROBI" },
    ],
  },
  {
    id: "whoknows",
    title: "Who Knows Us Best",
    tag: "side A · track 2",
    blurb: "Pick the right answer. 10 pts each.",
    questions: [
      { key: "wk1", kind: "choice", prompt: "Who is always late?", options: ["Serah", "Muraimu", "Both, equally", "Neither (lies)"], answer: 2 },
      { key: "wk2", kind: "choice", prompt: "Who cries at movies?", options: ["Serah", "Muraimu"], answer: 0 },
      { key: "wk3", kind: "choice", prompt: "Who plans the trips?", options: ["Serah", "Muraimu"], answer: 1 },
      { key: "wk4", kind: "choice", prompt: "Who takes the most selfies?", options: ["Serah", "Muraimu"], answer: 0 },
      { key: "wk5", kind: "choice", prompt: "Who would survive a zombie apocalypse?", options: ["Serah", "Muraimu", "Neither"], answer: 1 },
    ],
  },
  {
    id: "howold",
    title: "How Old Was She?",
    tag: "side A · track 3",
    blurb: "Guess her age. Exact = 10 pts, within 2 years = 5.",
    questions: [
      { key: "ho1", kind: "number", prompt: "Serah lost her first tooth", answer: 6 },
      { key: "ho2", kind: "number", prompt: "Muraimu had her first crush", answer: 12 },
      { key: "ho3", kind: "number", prompt: "Serah got her first phone", answer: 14 },
      { key: "ho4", kind: "number", prompt: "Muraimu learned to drive", answer: 19 },
    ],
  },
  {
    id: "wouldshe",
    title: "Would She Rather",
    tag: "side B · track 1",
    blurb: "Guess what she picked. 10 pts each.",
    questions: [
      { key: "ws1", kind: "choice", prompt: "Serah: beach holiday or city break?", options: ["Beach", "City"], answer: 0 },
      { key: "ws2", kind: "choice", prompt: "Muraimu: brunch or late-night dinner?", options: ["Brunch", "Late dinner"], answer: 1 },
      { key: "ws3", kind: "choice", prompt: "Serah: never sleep in again or never dessert again?", options: ["No lie-ins", "No dessert"], answer: 1 },
      { key: "ws4", kind: "choice", prompt: "Muraimu: karaoke or dance floor?", options: ["Karaoke", "Dance floor"], answer: 1 },
    ],
  },
  {
    id: "dares",
    title: "Random Dares",
    tag: "side B · track 2",
    blurb: "Do it, tap done. Honour system — the girls are watching.",
    questions: [
      { key: "d1", kind: "done", prompt: "Toast the birthday girls in your best accent", points: 15 },
      { key: "d2", kind: "done", prompt: "Take a selfie with someone you just met tonight", points: 15 },
      { key: "d3", kind: "done", prompt: "Sing one line of a birthday song to a stranger", points: 20 },
      { key: "d4", kind: "done", prompt: "Give each birthday girl a real compliment", points: 10 },
      { key: "d5", kind: "done", prompt: "Do your best runway walk to the bar and back", points: 20 },
    ],
  },
  {
    id: "friendship",
    title: "Friendship Questions",
    tag: "side B · track 3",
    blurb: "Answer out loud at the table, then tap done. 5 pts each.",
    questions: [
      { key: "f1", kind: "done", prompt: "Your favourite memory with Serah or Muraimu", points: 5 },
      { key: "f2", kind: "done", prompt: "One word to describe their friendship", points: 5 },
      { key: "f3", kind: "done", prompt: "What should they do together before next birthday?", points: 5 },
      { key: "f4", kind: "done", prompt: "When did you know they were your people?", points: 5 },
    ],
  },
];

export function findQuestion(qkey: string) {
  for (const r of ROUNDS) {
    const q = r.questions.find((x) => x.key === qkey);
    if (q) return { round: r, q };
  }
  return null;
}

const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

export function grade(q: Question, value: string): { points: number; correct: boolean } {
  switch (q.kind) {
    case "text": {
      const ok = norm(value) === norm(q.answer);
      return { points: ok ? 10 : 0, correct: ok };
    }
    case "choice": {
      const ok = Number(value) === q.answer;
      return { points: ok ? 10 : 0, correct: ok };
    }
    case "number": {
      const diff = Math.abs(Number(value) - q.answer);
      if (diff === 0) return { points: 10, correct: true };
      if (diff <= 2) return { points: 5, correct: false };
      return { points: 0, correct: false };
    }
    case "done":
      return { points: q.points, correct: true };
  }
}
