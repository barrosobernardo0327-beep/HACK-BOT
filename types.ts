export enum Difficulty {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado'
}

export enum GameState {
  WELCOME = 'WELCOME',
  HOME = 'HOME',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
  INSTRUCTIONS = 'INSTRUCTIONS',
  RANKING = 'RANKING',
  AWARDS = 'AWARDS',
  WITHDRAW_METHOD = 'WITHDRAW_METHOD',
  WITHDRAW_BANK = 'WITHDRAW_BANK',
  WITHDRAW_FORM = 'WITHDRAW_FORM',
  WITHDRAW_CONFIRM = 'WITHDRAW_CONFIRM',
  VERIFY_TAX = 'VERIFY_TAX'
}

export enum WithdrawMethod {
  MULTICAIXA = 'MULTICAIXA',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  method: string;
  bank?: string;
  code: string;
  name?: string;
  status: 'pendente' | 'concluido' | 'reservado';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  curiosity: string;
  category: string;
}

export interface UserStats {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  bestScoreKz: number;
  accumulatedKz: number;
}

export interface SessionResult {
  date: string;
  points: number;
  kz: number;
}

export interface Province {
  id: string;
  name: string;
  capital: string;
  culture: string;
  attraction: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}