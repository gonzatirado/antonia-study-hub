import { GRADE_CATEGORY_LABELS } from '@/lib/types';
import type { Grade } from '@/lib/types';

export { GRADE_CATEGORY_LABELS as CATEGORY_LABELS };

export function calcWeightedAverage(grades: Grade[]): number {
  if (grades.length === 0) return 0;
  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  if (totalWeight === 0) return grades.reduce((sum, g) => sum + g.score, 0) / grades.length;
  return grades.reduce((sum, g) => sum + g.score * g.weight, 0) / totalWeight;
}
