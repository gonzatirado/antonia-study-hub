import { describe, it, expect } from 'vitest';
import { calcWeightedAverage, CATEGORY_LABELS } from '@/lib/utils/grade-helpers';
import type { Grade } from '@/lib/types';

function makeGrade(score: number, weight: number): Grade {
  return {
    id: '1',
    userId: 'u1',
    subjectId: 's1',
    name: 'Test',
    score,
    maxScore: 7,
    weight,
    category: 'solemne',
    date: new Date(),
    createdAt: new Date(),
  };
}

describe('calcWeightedAverage', () => {
  it('returns 0 for empty array', () => {
    expect(calcWeightedAverage([])).toBe(0);
  });

  it('calculates simple average when all weights are 0', () => {
    const grades = [makeGrade(6, 0), makeGrade(4, 0)];
    expect(calcWeightedAverage(grades)).toBe(5);
  });

  it('calculates weighted average correctly', () => {
    const grades = [makeGrade(7, 60), makeGrade(5, 40)];
    // (7*60 + 5*40) / (60+40) = (420+200)/100 = 6.2
    expect(calcWeightedAverage(grades)).toBeCloseTo(6.2);
  });

  it('handles a single grade', () => {
    const grades = [makeGrade(5.5, 100)];
    expect(calcWeightedAverage(grades)).toBe(5.5);
  });
});

describe('CATEGORY_LABELS', () => {
  it('exports all expected categories', () => {
    expect(CATEGORY_LABELS).toHaveProperty('solemne', 'Solemne');
    expect(CATEGORY_LABELS).toHaveProperty('examen', 'Examen');
    expect(CATEGORY_LABELS).toHaveProperty('tarea', 'Tarea');
  });
});
