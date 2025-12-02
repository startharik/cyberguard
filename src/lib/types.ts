export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  isAdmin?: boolean;
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
}

export interface QuizResult {
    id: string;
    userId: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
    quizTitle?: string;
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
