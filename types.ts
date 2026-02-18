export enum HSKLevel {
  HSK1 = 1,
  HSK2 = 2,
  HSK3 = 3,
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export interface Word {
  id: string;
  char: string;
  pinyin: string;
  en: string;
  level: HSKLevel;
  difficulty?: Difficulty;
}

export interface UserProgress {
  masteredWords: string[]; // array of word IDs
  seenWords: string[];     // array of word IDs
}

export interface User {
  username: string;
  password?: string; // In a real app, this would be hashed.
}

export enum AppMode {
  FLASHCARDS = 'FLASHCARDS', // Renamed from VOCAB for clarity, though logic will map VOCAB -> FLASHCARDS
  WORDLIST = 'WORDLIST',     // New mode
  GRAMMAR = 'GRAMMAR',
}

export interface GrammarTopic {
  id: string;
  title: string;
  level: HSKLevel;
  description: string; // Brief description
}

export interface GrammarExplanation {
  markdown: string;
}