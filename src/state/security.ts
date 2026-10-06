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

export function getRecommendedAccount(accounts: readonly Account[]): Account | undefined {
  return accounts.find((account) => account.id === 'spotify' && account.status !== 'safe') ??
    accounts.find((account) => account.status === 'reused') ??
    accounts.find((account) => account.status === 'weak')
}

/** Exact comparisons are limited to fictitious examples, never real password analysis. */
export function getDemoPasswordMatches(accounts: readonly Account[], value: string): Account[] {
  if (!value.startsWith('DEMO-')) return []
  return accounts.filter((account) => account.demoPassword === value)
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

/** Only the deliberate Add Account demo path opts into matching fake examples. */
function appendWithDemoReuse(existing: readonly Account[], incoming: Account): Account[] {
  const appended = appendAccounts(existing, [incoming])
  const matches = getDemoPasswordMatches(existing, incoming.demoPassword)
  if (!matches.length) return appended
  const added = appended[appended.length - 1]!
  let groupId = matches.find((account) => account.status === 'reused' && account.reusedGroupId)?.reusedGroupId
  if (!groupId) {
    const usedGroupIds = new Set(existing.map((account) => account.reusedGroupId))
    const baseGroupId = `demo-reuse-${added.id}`
    groupId = baseGroupId
    let suffix = 2
    while (usedGroupIds.has(groupId)) groupId = `${baseGroupId}-${suffix++}`
  }
  const memberIds = new Set([...matches.map((account) => account.id), added.id])
  return normalizeReusedGroups(appended.map((account) => memberIds.has(account.id)
    ? { ...account, status: 'reused', issueType: 'reused', reusedGroupId: groupId! }
    : account,
  ))
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
      const related = getRelatedAccounts(state.accounts, account.id)
      const relatedAccountIds = related.map((item) => item.id)
      return {
        ...state,
        accounts: normalized,
        lastResolution: {
          accountId: account.id,
          serviceName: account.serviceName,
          issueType: account.issueType,
          relatedServiceNames: related.map((item) => item.serviceName),
          relatedAccountIds,
          relatedAccountsAfter: normalized.filter((item) => relatedAccountIds.includes(item.id))
            .map(({ id, serviceName, status, reusedGroupId }) => ({ id, serviceName, status, reusedGroupId })),
          before: getSecuritySummary(state.accounts),
          after: getSecuritySummary(normalized),
        },
      }
    }
    case 'clear-resolution':
      return state.lastResolution ? { ...state, lastResolution: null } : state
    case 'add-account':
      return {
        ...state,
        accounts: action.detectDemoReuse
          ? appendWithDemoReuse(state.accounts, action.account)
          : appendAccounts(state.accounts, [action.account]),
      }
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
