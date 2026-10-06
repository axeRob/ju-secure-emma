import type { Account, AccountStatus, LearnTopic } from '../types/index.ts'

function demoAccount(
  id: string,
  serviceName: string,
  initial: string,
  username = 'emma@example.com',
  status: AccountStatus = 'safe',
): Account {
  return {
    id,
    serviceName,
    username,
    status,
    issueType: status === 'safe' ? 'none' : status,
    passwordStrength: status === 'weak' ? 'weak' : 'strong',
    reusedGroupId: status === 'reused' ? 'demo-shared-1' : null,
    initial,
  }
}

/** Fixed, fictitious accounts for the interactive prototype. */
export const DEMO_ACCOUNTS: Account[] = [
  demoAccount('ju-student-web', 'JU Student Web', 'JU', 'emma@student.ju.se'),
  demoAccount('canvas', 'Canvas / JU', 'C', 'emma@student.ju.se'),
  demoAccount('google', 'Google', 'G', 'emma.personal@gmail.com', 'reused'),
  demoAccount('spotify', 'Spotify', 'S', 'emma.personal@gmail.com', 'reused'),
  demoAccount('netflix', 'Netflix', 'N', 'emma@example.com', 'reused'),
  demoAccount('instagram', 'Instagram', 'I', 'emma@example.com', 'weak'),
  demoAccount('microsoft-365', 'Microsoft', 'M', 'emma@student.ju.se'),
  demoAccount('github', 'GitHub', 'G'),
  demoAccount('linkedin', 'LinkedIn', 'in'),
  demoAccount('facebook', 'Facebook', 'f'),
  demoAccount('apple-id', 'Apple', 'A'),
  demoAccount('amazon', 'Amazon', 'a'),
  demoAccount('zoom', 'Zoom', 'Z', 'emma@student.ju.se'),
  demoAccount('discord', 'Discord', 'D'),
  demoAccount('dropbox', 'Dropbox', 'D'),
  demoAccount('adobe', 'Adobe', 'A'),
  demoAccount('notion', 'Notion', 'N'),
  demoAccount('slack', 'Slack', 'S', 'emma@student.ju.se'),
  demoAccount('booking-com', 'Booking.com', 'B'),
  demoAccount('university-library', 'University Library', 'UL', 'emma@student.example'),
  demoAccount('duolingo', 'Duolingo', 'D'),
  demoAccount('steam', 'Steam', 'S'),
  demoAccount('reddit', 'Reddit', 'R'),
  demoAccount('student-email', 'Student Email', 'E', 'emma@student.example'),
]

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: 'unique-passwords',
    title: 'Why unique passwords matter',
    description: 'A password manager is most useful when every account has a different password. You remember the master password; the vault handles the rest.',
    available: true,
    example: 'If Spotify leaks a unique password, your Google and JU accounts still use different passwords.',
  },
  {
    id: 'two-factor',
    title: 'What is 2FA?',
    description: 'Add an extra layer of protection to your accounts.',
    available: false,
  },
  {
    id: 'passkeys',
    title: 'What is a passkey?',
    description: 'A simpler way to sign in securely.',
    available: false,
  },
]
