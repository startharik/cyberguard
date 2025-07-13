export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  isAdmin?: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id:string;
  title: string;
  questions: Question[];
}
