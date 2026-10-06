import { LEARN_TOPICS } from './demo.ts';

export interface LearnArticleContent {
  title: string;
  introduction: string;
  example: string;
  benefit: string;
}

const uniquePasswords = LEARN_TOPICS.find(topic => topic.id === 'unique-passwords')!;

export const LEARN_ARTICLES: Record<string, LearnArticleContent> = {
  'unique-passwords': {
    title: uniquePasswords.title,
    introduction: uniquePasswords.description,
    example: uniquePasswords.example!,
    benefit: 'Using a different password for each account keeps one problem from spreading to your other accounts.',
  },
  'two-factor': {
    title: 'What is 2FA?',
    introduction: '2FA adds another check when you sign in.',
    example: 'After entering your password, you might confirm the login on your phone.',
    benefit: 'If someone learns your password, they still need the second check.',
  },
  passkeys: {
    title: 'What is a passkey?',
    introduction: 'A passkey lets you sign in using your device instead of typing a password.',
    example: 'You might use Face ID, your fingerprint or your device PIN to sign in.',
    benefit: 'Passkeys can reduce problems caused by weak or reused passwords.',
  },
};
