import { DEMO_ACCOUNTS } from '../data/demo.ts'
import { generateDemoPassword, isStrongDemoPassword } from '../data/passwords.ts'
import type {
  Account,
  AccountFilter,
  AppAction,
  AppState,
  SecuritySummary,
} from '../types/index.ts'

export function getSecuritySummary(accounts: readonly Account[]): SecuritySummary {
  const summary: SecuritySummary = {
    total: accounts.length,
    safe: 0,
    reused: 0,
    weak: 0,
    needsAttention: 0,
  }
  for (const account of accounts) summary[account.status] += 1
  summary.needsAttention = summary.reused + summary.weak
  return summary
}

export function filterAccounts(accounts: readonly Account[], filter: AccountFilter): Account[] {
  return accounts.filter((account) => filter === 'all' || account.status === filter)
}

export function getRelatedAccounts(accounts: readonly Account[], accountId: string): Account[] {
  const selected = accounts.find((account) => account.id === accountId)
  if (!selected || selected.status !== 'reused' || !selected.reusedGroupId) return []
  return accounts.filter((account) =>
    account.id !== selected.id && account.status === 'reused' &&
    account.reusedGroupId === selected.reusedGroupId,
  )
}

/** Reuse is an explicit relationship, never inferred from an email or strength. */
export function normalizeReusedGroups(accounts: readonly Account[]): Account[] {
  const groupSizes = new Map<string, number>()
  for (const account of accounts) {
    if (account.status === 'reused' && account.reusedGroupId) {
      groupSizes.set(account.reusedGroupId, (groupSizes.get(account.reusedGroupId) ?? 0) + 1)
    }
  }
  return accounts.map((account) => {
    if (
      account.status === 'reused' &&
      (!account.reusedGroupId || (groupSizes.get(account.reusedGroupId) ?? 0) < 2)
    ) {
      return clearReuse(account)
    }
    return account
  })
}

/** Removing reuse does not erase a separate strength issue on the remaining account. */
function clearReuse(account: Account): Account {
  if (account.passwordStrength === 'weak') {
    return {
      ...account,
      status: 'weak',
      issueType: 'weak',
      reusedGroupId: null,
    }
  }
  return makeSafe(account)
}

function makeSafe(account: Account, demoPassword = account.demoPassword): Account {
  return {
    ...account,
    status: 'safe',
    issueType: 'none',
    passwordStrength: 'strong',
    reusedGroupId: null,
    demoPassword,
  }
}

/** A collision receives a deterministic ID without changing existing accounts. */
function appendAccounts(existing: readonly Account[], incoming: readonly Account[]): Account[] {
  const usedIds = new Set(existing.map((account) => account.id))
  const additions = incoming.map((account) => {
    const baseId = account.id.trim() || 'account'
    let id = baseId
    let suffix = 2
    while (usedIds.has(id)) id = `${baseId}-${suffix++}`
    usedIds.add(id)
    return { ...account, id }
  })
  return normalizeReusedGroups([...existing, ...additions])
}

export function createInitialState(accounts: readonly Account[] = DEMO_ACCOUNTS): AppState {
  return {
    accounts: normalizeReusedGroups(accounts.map((account) => ({ ...account }))),
    filter: 'all',
    settings: { autoLock: true, securityGuidance: true },
    onboardingComplete: false,
    isReturningUser: false,
    lastResolution: null,
  }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'resolve-issue': {
      const account = state.accounts.find((item) => item.id === action.accountId)
      if (!account || account.status === 'safe') return state
      const existingPasswords = state.accounts.map((item) => item.demoPassword)
      const supplied = action.demoPassword
      const demoPassword = supplied && isStrongDemoPassword(supplied) &&
        !existingPasswords.includes(supplied)
        ? supplied
        : generateDemoPassword(existingPasswords, account.demoPassword)
      const accounts = state.accounts.map((item) =>
        item.id === action.accountId ? makeSafe(item, demoPassword) : item,
      )
      const normalized = normalizeReusedGroups(accounts)
      return {
        ...state,
        accounts: normalized,
        lastResolution: {
          accountId: account.id,
          serviceName: account.serviceName,
          issueType: account.issueType,
          relatedServiceNames: getRelatedAccounts(state.accounts, account.id).map((item) => item.serviceName),
          before: getSecuritySummary(state.accounts),
          after: getSecuritySummary(normalized),
        },
      }
    }
    case 'clear-resolution':
      return state.lastResolution ? { ...state, lastResolution: null } : state
    case 'add-account':
      return { ...state, accounts: appendAccounts(state.accounts, [action.account]) }
    case 'import-accounts':
      return { ...state, accounts: appendAccounts(state.accounts, action.accounts) }
    case 'set-filter':
      return { ...state, filter: action.filter }
    case 'update-settings':
      return { ...state, settings: { ...state.settings, ...action.settings } }
    case 'complete-onboarding':
      return { ...state, onboardingComplete: true }
    case 'set-returning-user':
      return { ...state, isReturningUser: action.value }
  }
}

export function selectSecuritySummary(state: AppState): SecuritySummary {
  return getSecuritySummary(state.accounts)
}

export function selectFilteredAccounts(state: AppState): Account[] {
  return filterAccounts(state.accounts, state.filter)
}

export function selectAccountById(state: AppState, accountId: string): Account | undefined {
  return state.accounts.find((account) => account.id === accountId)
}
