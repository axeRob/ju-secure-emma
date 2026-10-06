import type { Account, AccountStatus, LearnTopic } from '../types/index.ts'

const REUSED_DEMO_PASSWORDS: Record<string, string> = {
  'demo-shared-a': 'DEMO-GroupA!0001xY7#',
  'demo-shared-b': 'DEMO-GroupB!0001xY7#',
  'demo-shared-c': 'DEMO-GroupC!0001xY7#',
  'demo-shared-d': 'DEMO-GroupD!0001xY7#',
  'demo-shared-e': 'DEMO-GroupE!0001xY7#',
}

const SAFE_DEMO_PASSWORDS: Record<string, string> = {
  'ju-student-web': 'DEMO-Safe!000001xY7#',
  canvas: 'DEMO-Safe!000002xY7#',
  'university-library': 'DEMO-Safe!000003xY7#',
}

function demoAccount(
  id: string,
  serviceName: string,
  initial: string,
  username = 'emma@example.com',
  status: AccountStatus = 'safe',
  reusedGroupId: string | null = null,
): Account {
  return {
    id,
    serviceName,
    username,
    status,
    issueType: status === 'safe' ? 'none' : status,
    passwordStrength: status === 'weak' ? 'weak' : 'strong',
    reusedGroupId: status === 'reused' ? reusedGroupId : null,
    initial,
    demoPassword: status === 'weak'
      ? `DEMO-weak-${id}`
      : status === 'reused'
        ? REUSED_DEMO_PASSWORDS[reusedGroupId!]!
        : SAFE_DEMO_PASSWORDS[id]!,
  }
}

/** Fixed, fictitious accounts for the interactive prototype. */
export const DEMO_ACCOUNTS: Account[] = [
  demoAccount('ju-student-web', 'JU Student Web', 'JU', 'emma@student.ju.se'),
  demoAccount('canvas', 'Canvas / JU', 'C', 'emma@student.ju.se'),
  demoAccount('google', 'Google', 'G', 'emma.personal@gmail.com', 'reused', 'demo-shared-a'),
  demoAccount('spotify', 'Spotify', 'S', 'emma.personal@gmail.com', 'reused', 'demo-shared-a'),
  demoAccount('netflix', 'Netflix', 'N', 'emma@example.com', 'reused', 'demo-shared-a'),
  demoAccount('instagram', 'Instagram', 'I', 'emma@example.com', 'reused', 'demo-shared-a'),
  demoAccount('microsoft-365', 'Microsoft', 'M', 'emma@student.ju.se', 'reused', 'demo-shared-b'),
  demoAccount('github', 'GitHub', 'G', 'emma@example.com', 'weak'),
  demoAccount('linkedin', 'LinkedIn', 'in', 'emma@example.com', 'reused', 'demo-shared-c'),
  demoAccount('facebook', 'Facebook', 'f', 'emma@example.com', 'weak'),
  demoAccount('apple-id', 'Apple', 'A', 'emma@example.com', 'weak'),
  demoAccount('amazon', 'Amazon', 'a', 'emma@example.com', 'reused', 'demo-shared-b'),
  demoAccount('zoom', 'Zoom', 'Z', 'emma@student.ju.se', 'reused', 'demo-shared-c'),
  demoAccount('discord', 'Discord', 'D', 'emma@example.com', 'reused', 'demo-shared-d'),
  demoAccount('dropbox', 'Dropbox', 'D', 'emma@example.com', 'reused', 'demo-shared-e'),
  demoAccount('adobe', 'Adobe', 'A', 'emma@example.com', 'reused', 'demo-shared-e'),
  demoAccount('notion', 'Notion', 'N', 'emma@example.com', 'reused', 'demo-shared-c'),
  demoAccount('slack', 'Slack', 'S', 'emma@student.ju.se', 'weak'),
  demoAccount('booking-com', 'Booking.com', 'B', 'emma@example.com', 'reused', 'demo-shared-b'),
  demoAccount('university-library', 'University Library', 'UL', 'emma@student.example'),
  demoAccount('duolingo', 'Duolingo', 'D', 'emma@example.com', 'weak'),
  demoAccount('steam', 'Steam', 'S', 'emma@example.com', 'reused', 'demo-shared-d'),
  demoAccount('reddit', 'Reddit', 'R', 'emma@example.com', 'reused', 'demo-shared-d'),
  demoAccount('student-email', 'Student Email', 'E', 'emma@student.example', 'weak'),
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
