import assert from 'node:assert/strict'
import test from 'node:test'
import { DEMO_ACCOUNTS } from '../data/demo.ts'
import type { Account } from '../types/index.ts'
import {
  appReducer,
  createInitialState,
  filterAccounts,
  getSecuritySummary,
  selectAccountById,
  selectSecuritySummary,
} from './security.ts'

test('the fixed demo has exactly 24 accounts and four issues', () => {
  assert.deepEqual(getSecuritySummary(DEMO_ACCOUNTS), {
    total: 24,
    safe: 20,
    reused: 3,
    weak: 1,
    needsAttention: 4,
  })
  assert.equal(new Set(DEMO_ACCOUNTS.map((account) => account.id)).size, 24)
  assert.deepEqual(DEMO_ACCOUNTS.slice(0, 4).map((account) => account.id), [
    'ju-student-web', 'canvas', 'google', 'spotify',
  ])
  assert.ok(DEMO_ACCOUNTS.every((account) => !('password' in account)))
})

test('resolving reuse leaves two related accounts and preserves the weak issue', () => {
  const before = createInitialState()
  const after = appReducer(before, { type: 'resolve-issue', accountId: 'google' })
  assert.deepEqual(selectSecuritySummary(after), {
    total: 24, safe: 21, reused: 2, weak: 1, needsAttention: 3,
  })
  assert.equal(selectAccountById(after, 'google')?.reusedGroupId, null)
  assert.equal(selectAccountById(after, 'spotify')?.reusedGroupId, 'demo-shared-1')
  assert.deepEqual(selectAccountById(after, 'instagram'), selectAccountById(before, 'instagram'))
})

test('the last remaining member of a reused group becomes safe automatically', () => {
  let state = createInitialState()
  state = appReducer(state, { type: 'resolve-issue', accountId: 'google' })
  state = appReducer(state, { type: 'resolve-issue', accountId: 'spotify' })
  assert.deepEqual(selectSecuritySummary(state), {
    total: 24, safe: 23, reused: 0, weak: 1, needsAttention: 1,
  })
  assert.equal(selectAccountById(state, 'netflix')?.status, 'safe')
  assert.equal(selectAccountById(state, 'netflix')?.issueType, 'none')
  assert.equal(selectAccountById(state, 'netflix')?.reusedGroupId, null)
})

test('resolving a weak issue keeps unrelated reuse and account identity intact', () => {
  const before = createInitialState()
  const after = appReducer(before, { type: 'resolve-issue', accountId: 'instagram' })
  const instagram = selectAccountById(after, 'instagram')!
  assert.equal(instagram.status, 'safe')
  assert.equal(instagram.issueType, 'none')
  assert.equal(instagram.passwordStrength, 'strong')
  assert.equal(instagram.username, selectAccountById(before, 'instagram')?.username)
  assert.equal(instagram.serviceName, 'Instagram')
  assert.equal(selectSecuritySummary(after).reused, 3)
})

test('clearing reuse preserves weak strength on the last remaining group member', () => {
  const google = DEMO_ACCOUNTS.find((account) => account.id === 'google')!
  const spotify = DEMO_ACCOUNTS.find((account) => account.id === 'spotify')!
  const initial = createInitialState([google, { ...spotify, passwordStrength: 'weak' }])
  const resolved = appReducer(initial, { type: 'resolve-issue', accountId: 'google' })
  assert.deepEqual(selectSecuritySummary(resolved), {
    total: 2, safe: 1, reused: 0, weak: 1, needsAttention: 1,
  })
  const remaining = selectAccountById(resolved, 'spotify')!
  assert.equal(remaining.status, 'weak')
  assert.equal(remaining.issueType, 'weak')
  assert.equal(remaining.passwordStrength, 'weak')
  assert.equal(remaining.reusedGroupId, null)
  assert.equal(remaining.username, spotify.username)
  assert.equal(selectAccountById(initial, 'spotify')?.status, 'reused')
})

test('shared usernames do not imply password reuse', () => {
  const state = createInitialState()
  assert.equal(selectAccountById(state, 'ju-student-web')?.status, 'safe')
  assert.equal(selectAccountById(state, 'canvas')?.status, 'safe')
  assert.equal(filterAccounts(state.accounts, 'reused').length, 3)
  assert.equal(filterAccounts(state.accounts, 'weak')[0]?.id, 'instagram')
  assert.equal(filterAccounts(state.accounts, 'all').length, 24)
})

test('adding and importing colliding IDs never overwrites existing accounts', () => {
  const original = createInitialState()
  const incoming: Account = { ...original.accounts[0]! }
  const added = appReducer(original, { type: 'add-account', account: incoming })
  const imported = appReducer(added, {
    type: 'import-accounts',
    accounts: [incoming, { ...incoming, id: 'ju-student-web-2' }, { ...incoming, id: '' }],
  })
  assert.equal(imported.accounts.length, 28)
  assert.equal(new Set(imported.accounts.map((account) => account.id)).size, 28)
  assert.deepEqual(imported.accounts.slice(0, 24), original.accounts)
  assert.deepEqual(imported.accounts.slice(24).map((account) => account.id), [
    'ju-student-web-2', 'ju-student-web-3', 'ju-student-web-2-2', 'account',
  ])
  assert.equal(incoming.id, 'ju-student-web')
})

test('importing a related group preserves its explicit reuse relationship', () => {
  const template = DEMO_ACCOUNTS.find((account) => account.id === 'google')!
  const state = appReducer(createInitialState([]), {
    type: 'import-accounts',
    accounts: [
      { ...template, id: 'imported-a', reusedGroupId: 'import-group' },
      { ...template, id: 'imported-b', reusedGroupId: 'import-group' },
    ],
  })
  assert.equal(selectSecuritySummary(state).reused, 2)
  const resolved = appReducer(state, { type: 'resolve-issue', accountId: 'imported-a' })
  assert.equal(selectSecuritySummary(resolved).safe, 2)
})

test('state updates do not mutate the demo, previous state, or action inputs', () => {
  const demoSnapshot = structuredClone(DEMO_ACCOUNTS)
  const state = createInitialState()
  const snapshot = structuredClone(state)
  const incoming = { ...state.accounts[0]!, id: 'new-account' }
  const incomingSnapshot = { ...incoming }
  let next = appReducer(state, { type: 'resolve-issue', accountId: 'google' })
  next = appReducer(next, { type: 'add-account', account: incoming })
  next = appReducer(next, { type: 'update-settings', settings: { autoLock: false } })
  next = appReducer(next, { type: 'set-filter', filter: 'weak' })
  assert.deepEqual(state, snapshot)
  assert.deepEqual(DEMO_ACCOUNTS, demoSnapshot)
  assert.deepEqual(incoming, incomingSnapshot)
  assert.equal(next.settings.autoLock, false)
  assert.equal(next.settings.securityGuidance, true)
  assert.equal(next.filter, 'weak')
})

test('an unknown or already safe account leaves state unchanged', () => {
  const state = createInitialState()
  assert.equal(appReducer(state, { type: 'resolve-issue', accountId: 'missing' }), state)
  assert.equal(appReducer(state, { type: 'resolve-issue', accountId: 'canvas' }), state)
})
