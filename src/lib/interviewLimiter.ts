const LIMIT_KEY = 'interviewDailyUsage';
const MAX_DAILY = 4;

interface DailyUsage {
  date: string;
  count: number;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDailyUsage(): DailyUsage {
  if (typeof window === 'undefined') return { date: getTodayString(), count: 0 };
  try {
    const raw = localStorage.getItem(LIMIT_KEY);
    if (!raw) return { date: getTodayString(), count: 0 };
    const parsed: DailyUsage = JSON.parse(raw);
    if (parsed.date !== getTodayString()) {
      return { date: getTodayString(), count: 0 };
    }
    return parsed;
  } catch {
    return { date: getTodayString(), count: 0 };
  }
}

export function getRemainingInterviews(): number {
  const usage = getDailyUsage();
  return Math.max(0, MAX_DAILY - usage.count);
}

export function canStartInterview(): boolean {
  return getRemainingInterviews() > 0;
}

export function incrementInterviewCount(): void {
  if (typeof window === 'undefined') return;
  const usage = getDailyUsage();
  const updated: DailyUsage = {
    date: getTodayString(),
    count: usage.count + 1,
  };
  localStorage.setItem(LIMIT_KEY, JSON.stringify(updated));
}

export function getMaxDaily(): number {
  return MAX_DAILY;
}
