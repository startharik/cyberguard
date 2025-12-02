

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  isAdmin?: boolean;
  streak?: number;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  quizId?: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: Difficulty;
}

export interface Quiz {
  id:string;
  title: string;
  questions: Question[];
  questionCount?: number;
  bestScore?: number;
  prerequisiteQuizId?: string;
  prerequisiteScore?: number;
  isLocked?: boolean;
  prerequisiteQuizTitle?: string;
}

export interface QuizResult {
    id: string;
    userId: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
    quizTitle?: string;
    userName?: string;
}

export interface QuizFeedback {
    id: string;
    userId: string;
    quizId: string;
    feedback: string;
    submittedAt: string;
    userName?: string;
    userEmail?: string;
    quizTitle?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  earnedAt?: string;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: string;
}

export interface AttemptedQuizStat {
    title: string;
    attempts: number;
}
  
export interface FailedQuestionStat {
    text: string;
    failCount: number;
}
