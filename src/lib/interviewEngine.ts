export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export interface Question {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  followUps: string[];
}

export interface AnsweredQuestion {
  questionId: number;
  question: string;
  answer: string;
  isFollowUp: boolean;
  parentQuestion?: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  difficulty: Difficulty;
  startedAt: string;
  completedAt?: string;
  questions: Question[];
  answers: AnsweredQuestion[];
  totalQuestions: number;
  currentIndex: number;
  currentFollowUpIndex: number;
  isShowingFollowUp: boolean;
}

export interface SavedInterview {
  id: string;
  role: string;
  difficulty: Difficulty;
  completedAt: string;
  totalQuestions: number;
  answersCount: number;
  analytics?: InterviewAnalytics;
}

export interface InterviewAnalytics {
  overall_score: number;
  communication: number;
  technical_knowledge: number;
  confidence: number;
  grammar: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

const ROLE_FILE_MAP: Record<string, string> = {
  'software-engineer': '/data/questions/software-engineer.json',
  'technical-support': '/data/questions/technical-support.json',
  'qa-tester': '/data/questions/qa-tester.json',
  'vlsi-engineer': '/data/questions/vlsi-engineer.json',
  'data-analyst': '/data/questions/data-analyst.json',
  'java-developer': '/data/questions/java-developer.json',
  'full-stack-java': '/data/questions/full-stack-java.json',
};

const QUESTIONS_PER_INTERVIEW = 10;

export async function loadQuestions(role: string): Promise<Question[]> {
  const path = ROLE_FILE_MAP[role];
  if (!path) throw new Error(`Unknown role: ${role}`);
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load questions for ${role}`);
  return res.json();
}

export function filterAndSelectQuestions(
  allQuestions: Question[],
  difficulty: Difficulty,
  count: number = QUESTIONS_PER_INTERVIEW
): Question[] {
  let pool: Question[];

  if (difficulty === 'mixed') {
    const easy = allQuestions.filter(q => q.difficulty === 'easy');
    const medium = allQuestions.filter(q => q.difficulty === 'medium');
    const hard = allQuestions.filter(q => q.difficulty === 'hard');
    pool = [
      ...shuffle(easy).slice(0, Math.ceil(count * 0.35)),
      ...shuffle(medium).slice(0, Math.ceil(count * 0.40)),
      ...shuffle(hard).slice(0, Math.ceil(count * 0.25)),
    ];
  } else {
    pool = allQuestions.filter(q => q.difficulty === difficulty);
  }

  return shuffle(pool).slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createSession(
  role: string,
  difficulty: Difficulty,
  questions: Question[]
): InterviewSession {
  return {
    id: `interview_${Date.now()}`,
    role,
    difficulty,
    startedAt: new Date().toISOString(),
    questions,
    answers: [],
    totalQuestions: questions.length,
    currentIndex: 0,
    currentFollowUpIndex: -1,
    isShowingFollowUp: false,
  };
}

export function saveSessionToStorage(session: InterviewSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`session_${session.id}`, JSON.stringify(session));
  sessionStorage.setItem('currentInterviewId', session.id);
}

export function loadSessionFromStorage(id: string): InterviewSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(`session_${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCompletedInterview(
  session: InterviewSession,
  analytics: InterviewAnalytics
): void {
  if (typeof window === 'undefined') return;

  const saved: SavedInterview = {
    id: session.id,
    role: session.role,
    difficulty: session.difficulty,
    completedAt: new Date().toISOString(),
    totalQuestions: session.questions.length,
    answersCount: session.answers.length,
    analytics,
  };

  const existing = getAllSavedInterviews();

  const userEmail = localStorage.getItem("userEmail") || "guest";
  const storageKey = `savedInterviews_${userEmail}`;

  existing.unshift(saved);

  localStorage.setItem(
    storageKey,
    JSON.stringify(existing.slice(0, 20))
  );

  localStorage.setItem(
    `analytics_${userEmail}_${session.id}`,
    JSON.stringify(analytics)
  );
}

export function getAllSavedInterviews(): SavedInterview[] {
  if (typeof window === "undefined") return [];

  try {
    const userEmail = localStorage.getItem("userEmail") || "guest";
    const storageKey = `savedInterviews_${userEmail}`;

    // new user data
    const userData = localStorage.getItem(storageKey);

    if (userData) {
      return JSON.parse(userData);
    }

    // old shared data
    const oldData = localStorage.getItem("savedInterviews");

    if (oldData) {
      const parsed = JSON.parse(oldData);

      // migrate old data
      localStorage.setItem(storageKey, JSON.stringify(parsed));

      return parsed;
    }

    return [];
  } catch {
    return [];
  }
}

export function getAnalyticsById(
  id: string
): InterviewAnalytics | null {

  if (typeof window === "undefined") return null;

  try {
    const userEmail =
      localStorage.getItem("userEmail") || "guest";

    // new user-specific analytics
    const newAnalytics = localStorage.getItem(
      `analytics_${userEmail}_${id}`
    );

    if (newAnalytics) {
      return JSON.parse(newAnalytics);
    }

    // fallback old analytics
    const oldAnalytics = localStorage.getItem(
      `analytics_${id}`
    );

    if (oldAnalytics) {
      const parsed = JSON.parse(oldAnalytics);

      // migrate old data
      localStorage.setItem(
        `analytics_${userEmail}_${id}`,
        JSON.stringify(parsed)
      );

      return parsed;
    }

    return null;

  } catch {
    return null;
  }
}
