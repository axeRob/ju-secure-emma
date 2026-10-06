export type AccountStatus = 'safe' | 'reused' | 'weak'
export type AccountIssue = 'none' | 'reused' | 'weak'

/** Deliberately contains no password or credential value. */
export interface Account {
  id: string
  serviceName: string
  username: string
  status: AccountStatus
  issueType: AccountIssue
  passwordStrength: 'strong' | 'weak'
  reusedGroupId: string | null
  initial: string
}

export type AccountFilter = 'all' | 'safe' | 'reused' | 'weak'

export interface SecuritySummary {
  total: number
  safe: number
  reused: number
  weak: number
  needsAttention: number
}

export interface AppSettings {
  autoLock: boolean
  securityGuidance: boolean
}

export interface AppState {
  accounts: Account[]
  filter: AccountFilter
  settings: AppSettings
  onboardingComplete: boolean
  isReturningUser: boolean
}

export type AppAction =
  | { type: 'resolve-issue'; accountId: string }
  | { type: 'add-account'; account: Account }
  | { type: 'import-accounts'; accounts: Account[] }
  | { type: 'set-filter'; filter: AccountFilter }
  | { type: 'update-settings'; settings: Partial<AppSettings> }
  | { type: 'complete-onboarding' }
  | { type: 'set-returning-user'; value: boolean }

export interface LearnTopic {
  id: 'unique-passwords' | 'two-factor' | 'passkeys'
  title: string
  description: string
  available: boolean
  example?: string
}
