import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './config';
import { PLAN_LIMITS } from '@/lib/types';
import type { UsageData } from '@/lib/types';

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function getUserUsage(userId: string): Promise<UsageData> {
  const period = getCurrentPeriod();
  const usageRef = doc(db, 'users', userId, 'usage', period);
  const usageSnap = await getDoc(usageRef);

  if (usageSnap.exists()) {
    return usageSnap.data() as UsageData;
  }

  // Create new period with default limits
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const plan = userSnap.exists() ? (userSnap.data().plan || 'free') : 'free';
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

  const newUsage: UsageData = {
    summaries_used: 0,
    summaries_limit: limits.summaries_limit,
    quizzes_used: 0,
    quizzes_limit: limits.quizzes_limit,
    exam_preps_used: 0,
    exam_preps_limit: limits.exam_preps_limit,
    practice_questions_used: 0,
    practice_questions_limit: limits.practice_questions_limit,
    tokens_consumed: 0,
    period,
  };

  await setDoc(usageRef, newUsage);
  return newUsage;
}

export async function checkUsageLimit(
  userId: string,
  action: 'summaries' | 'quizzes' | 'exam_preps' | 'practice_questions'
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const usage = await getUserUsage(userId);
  const used = usage[`${action}_used`];
  const limit = usage[`${action}_limit`];

  return {
    allowed: limit === -1 || used < limit,
    used,
    limit,
  };
}

export async function incrementUsage(
  userId: string,
  action: 'summaries' | 'quizzes' | 'exam_preps' | 'practice_questions',
  tokens: number = 0
): Promise<void> {
  const period = getCurrentPeriod();
  const usageRef = doc(db, 'users', userId, 'usage', period);

  await updateDoc(usageRef, {
    [`${action}_used`]: increment(1),
    tokens_consumed: increment(tokens),
  });
}
