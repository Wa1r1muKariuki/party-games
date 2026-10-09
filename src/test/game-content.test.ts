import { describe, expect, it } from 'vitest';
import { DARES, EVENT_START, ROUNDS, findQuestion, grade } from '@/lib/game-content';

describe('birthday games', () => {
  it('uses 7 pm Nairobi time on the event day', () => {
    expect(new Date(EVENT_START).toISOString()).toBe('2026-10-09T16:00:00.000Z');
  });
  it('has only two five-point friendship questions and no would-she round', () => {
    expect(ROUNDS.some(r => r.id === 'wouldshe')).toBe(false);
    const qs = ROUNDS.find(r => r.id === 'friendship')?.questions;
    expect(qs).toHaveLength(2);
    expect(qs?.every(q => q.kind === 'done' && q.points === 5)).toBe(true);
  });
  it('lists the friendship questions first', () => {
    expect(ROUNDS[0]?.id).toBe('friendship');
  });
  it('grades corrected answers', () => {
    for (const [key, value] of [['cw6', 'gilgil'], ['cw29', 'tufaha'], ['cw22', 'atlas'], ['cw15', 'bananas'], ['wk13', '1'], ['wk6', '2']]) {
      const found = findQuestion(key ?? '');
      expect(found).not.toBeNull();
      if (found) expect(grade(found.q, value ?? '').points).toBe(10);
    }
  });
  it('keeps the runway dare and does not invent ages', () => {
    expect(DARES.some(q => q.prompt === 'Do your best runway walk to the bar and back')).toBe(true);
    expect(ROUNDS.find(r => r.id === 'howold')?.questions.every(q => q.kind === 'number' && q.answer === null)).toBe(true);
  });
  it('shows correct crossword letter counts', () => {
    const qs = ROUNDS.find(r => r.id === 'crossword')?.questions ?? [];
    for (const q of qs) if (q.kind === 'text') expect(q.prompt.endsWith(`(${q.answer.length})`)).toBe(true);
  });
});