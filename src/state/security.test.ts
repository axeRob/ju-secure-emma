import assert from 'node:assert/strict'
import test from 'node:test'
import { DEMO_ACCOUNTS } from '../data/demo.ts'
import { generateDemoPassword, isStrongDemoPassword } from '../data/passwords.ts'
import type { Account } from '../types/index.ts'
import {
  appReducer,
  createInitialState,
  filterAccounts,
  getRelatedAccounts,
  getSecuritySummary,
  selectAccountById,
  selectSecuritySummary,
} from './security.ts'

test('the fixed demo has 24 accounts with exclusive statuses and five explicit reused groups', () => {
  assert.deepEqual(getSecuritySummary(DEMO_ACCOUNTS), {
    total: 24,
    safe: 3,
    reused: 15,
    weak: 6,
    needsAttention: 21,
  })
  assert.equal(new Set(DEMO_ACCOUNTS.map((account) => account.id)).size, 24)
  assert.deepEqual(DEMO_ACCOUNTS.slice(0, 4).map((account) => account.id), [
    'ju-student-web', 'canvas', 'google', 'spotify',
  ])
  assert.ok(DEMO_ACCOUNTS.every((account) => !('password' in account)))

  assert.deepEqual(filterAccounts(DEMO_ACCOUNTS, 'safe').map((account) => account.id), [
    'ju-student-web', 'canvas', 'university-library',
  ])
  assert.deepEqual(filterAccounts(DEMO_ACCOUNTS, 'weak').map((account) => account.id), [
    'github', 'facebook', 'apple-id', 'slack', 'duolingo', 'student-email',
  ])
  const expectedGroups = {
    'demo-shared-a': ['google', 'spotify', 'netflix', 'instagram'],
    'demo-shared-b': ['amazon', 'booking-com', 'microsoft-365'],
    'demo-shared-c': ['linkedin', 'zoom', 'notion'],
    'demo-shared-d': ['reddit', 'discord', 'steam'],
    'demo-shared-e': ['dropbox', 'adobe'],
  }
  assert.deepEqual(
    [...new Set(filterAccounts(DEMO_ACCOUNTS, 'reused').map((account) => account.reusedGroupId))].sort(),
    Object.keys(expectedGroups).sort(),
  )
  for (const [groupId, memberIds] of Object.entries(expectedGroups)) {
    const members = DEMO_ACCOUNTS.filter((account) => account.reusedGroupId === groupId)
    assert.deepEqual(members.map((account) => account.id).sort(), [...memberIds].sort())
    assert.equal(members.length, memberIds.length)
    assert.ok(members.every((account) => account.status === 'reused'))
    assert.equal(new Set(members.map((account) => account.demoPassword)).size, 1)
  }
  for (const account of DEMO_ACCOUNTS) {
    assert.equal(account.issueType, account.status === 'safe' ? 'none' : account.status)
    assert.equal(account.passwordStrength, account.status === 'weak' ? 'weak' : 'strong')
    assert.ok(account.demoPassword.startsWith('DEMO-'))
    if (account.status === 'weak') assert.ok(account.demoPassword.startsWith('DEMO-weak-'))
    else assert.ok(isStrongDemoPassword(account.demoPassword))
    if (account.status === 'reused') assert.ok(account.reusedGroupId)
    else assert.equal(account.reusedGroupId, null)
  }
  assert.equal(new Set(DEMO_ACCOUNTS.map((account) => account.demoPassword)).size, 14)
  assert.deepEqual(getSecuritySummary(createInitialState().accounts), getSecuritySummary(DEMO_ACCOUNTS))
})

test('fixing Spotify removes only its reuse issue and preserves other groups and weak issues', () => {
  const before = createInitialState()
  const previous = selectAccountById(before, 'spotify')!
  const generated = generateDemoPassword(before.accounts.map((account) => account.demoPassword), previous.demoPassword)
  const after = appReducer(before, { type: 'resolve-issue', accountId: 'spotify', demoPassword: generated })
  assert.deepEqual(selectSecuritySummary(after), {
    total: 24, safe: 4, reused: 14, weak: 6, needsAttention: 20,
  })
  assert.equal(selectAccountById(after, 'spotify')?.reusedGroupId, null)
  assert.equal(selectAccountById(after, 'spotify')?.demoPassword, generated)
  assert.notEqual(selectAccountById(after, 'spotify')?.demoPassword, previous.demoPassword)
  assert.equal(selectAccountById(after, 'google')?.reusedGroupId, 'demo-shared-a')
  assert.deepEqual(selectAccountById(after, 'instagram'), selectAccountById(before, 'instagram'))
  assert.deepEqual(
    after.accounts.filter((account) => account.id !== 'spotify'),
    before.accounts.filter((account) => account.id !== 'spotify'),
  )
  assert.deepEqual(after.lastResolution, {
    accountId: 'spotify',
    serviceName: 'Spotify',
    issueType: 'reused',
    relatedServiceNames: ['Google', 'Netflix', 'Instagram'],
    before: getSecuritySummary(before.accounts),
    after: getSecuritySummary(after.accounts),
  })
})

test('Spotify, Google, then Netflix fixes normalize the final strong member without affecting other groups', () => {
  const initial = createInitialState()
  const groupAIds = ['google', 'spotify', 'netflix', 'instagram']
  let state = createInitialState()
  state = appReducer(state, { type: 'resolve-issue', accountId: 'spotify' })
  assert.deepEqual(selectSecuritySummary(state), {
    total: 24, safe: 4, reused: 14, weak: 6, needsAttention: 20,
  })
  state = appReducer(state, { type: 'resolve-issue', accountId: 'google' })
  assert.deepEqual(selectSecuritySummary(state), {
    total: 24, safe: 5, reused: 13, weak: 6, needsAttention: 19,
  })
  assert.equal(selectAccountById(state, 'instagram')?.status, 'reused')
  assert.equal(selectAccountById(state, 'netflix')?.status, 'reused')
  state = appReducer(state, { type: 'resolve-issue', accountId: 'netflix' })
  assert.deepEqual(selectSecuritySummary(state), {
    total: 24, safe: 7, reused: 11, weak: 6, needsAttention: 17,
  })
  assert.deepEqual(state.lastResolution?.before, {
    total: 24, safe: 5, reused: 13, weak: 6, needsAttention: 19,
  })
  assert.deepEqual(state.lastResolution?.after, selectSecuritySummary(state))
  assert.deepEqual(state.lastResolution?.relatedServiceNames, ['Instagram'])
  assert.equal(selectAccountById(state, 'instagram')?.demoPassword, selectAccountById(initial, 'instagram')?.demoPassword)
  for (const id of groupAIds) {
    const account = selectAccountById(state, id)!
    assert.equal(account.status, 'safe')
    assert.equal(account.issueType, 'none')
    assert.equal(account.passwordStrength, 'strong')
    assert.equal(account.reusedGroupId, null)
  }
  assert.deepEqual(
    state.accounts.filter((account) => !groupAIds.includes(account.id)),
    initial.accounts.filter((account) => !groupAIds.includes(account.id)),
  )
})

test('resolving every initial issue preserves totals and valid groups throughout', () => {
  let state = createInitialState()
  function assertInvariants() {
    const summary = selectSecuritySummary(state)
    assert.equal(summary.total, 24)
    assert.equal(state.accounts.length, 24)
    assert.equal(summary.safe + summary.reused + summary.weak, summary.total)
    assert.equal(summary.needsAttention, summary.reused + summary.weak)
    const groupSizes = new Map<string, number>()
    for (const account of state.accounts) {
      if (account.status === 'reused') {
        assert.ok(account.reusedGroupId)
        groupSizes.set(account.reusedGroupId, (groupSizes.get(account.reusedGroupId) ?? 0) + 1)
      } else {
        assert.equal(account.reusedGroupId, null)
      }
      if (account.status === 'weak') {
        assert.equal(account.issueType, 'weak')
        assert.equal(account.passwordStrength, 'weak')
      }
    }
    assert.ok([...groupSizes.values()].every((size) => size >= 2))
  }
  assertInvariants()
  for (const account of DEMO_ACCOUNTS.filter((item) => item.status !== 'safe')) {
    state = appReducer(state, { type: 'resolve-issue', accountId: account.id })
    assertInvariants()
  }
  assert.deepEqual(selectSecuritySummary(state), {
    total: 24, safe: 24, reused: 0, weak: 0, needsAttention: 0,
  })
})

test('resolving a weak issue keeps unrelated reuse and account identity intact', () => {
  const before = createInitialState()
  const after = appReducer(before, { type: 'resolve-issue', accountId: 'github' })
  const github = selectAccountById(after, 'github')!
  assert.equal(github.status, 'safe')
  assert.equal(github.issueType, 'none')
  assert.equal(github.passwordStrength, 'strong')
  assert.equal(github.username, selectAccountById(before, 'github')?.username)
  assert.equal(github.serviceName, 'GitHub')
  assert.notEqual(github.demoPassword, selectAccountById(before, 'github')?.demoPassword)
  assert.ok(isStrongDemoPassword(github.demoPassword))
  assert.equal(after.lastResolution?.issueType, 'weak')
  assert.deepEqual(after.lastResolution?.relatedServiceNames, [])
  assert.deepEqual(selectSecuritySummary(after), {
    total: 24, safe: 4, reused: 15, weak: 5, needsAttention: 20,
  })
  assert.deepEqual(filterAccounts(after.accounts, 'reused'), filterAccounts(before.accounts, 'reused'))
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
  assert.equal(remaining.demoPassword, spotify.demoPassword)
  assert.equal(selectAccountById(initial, 'spotify')?.status, 'reused')
})

test('shared usernames do not imply password reuse', () => {
  const state = createInitialState()
  assert.equal(selectAccountById(state, 'ju-student-web')?.status, 'safe')
  assert.equal(selectAccountById(state, 'canvas')?.status, 'safe')
  assert.equal(selectAccountById(state, 'university-library')?.status, 'safe')
  assert.equal(selectAccountById(state, 'student-email')?.status, 'weak')
  assert.equal(selectAccountById(state, 'student-email')?.reusedGroupId, null)
  assert.equal(filterAccounts(state.accounts, 'safe').length, 3)
  assert.equal(filterAccounts(state.accounts, 'reused').length, 15)
  assert.equal(filterAccounts(state.accounts, 'weak').length, 6)
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

test('two-member demo and imported groups become safe after resolving one member', () => {
  const initial = createInitialState()
  const demoResolved = appReducer(initial, { type: 'resolve-issue', accountId: 'dropbox' })
  assert.deepEqual(selectSecuritySummary(demoResolved), {
    total: 24, safe: 5, reused: 13, weak: 6, needsAttention: 19,
  })
  for (const id of ['dropbox', 'adobe']) {
    assert.equal(selectAccountById(demoResolved, id)?.status, 'safe')
    assert.equal(selectAccountById(demoResolved, id)?.reusedGroupId, null)
  }
  assert.deepEqual(
    demoResolved.accounts.filter((account) => !['dropbox', 'adobe'].includes(account.id)),
    initial.accounts.filter((account) => !['dropbox', 'adobe'].includes(account.id)),
  )
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

test('generated demo examples are strong, twenty characters, and fresh across repeated calls', () => {
  const existing = DEMO_ACCOUNTS.map((account) => account.demoPassword)
  const generated = new Set<string>()
  let current = existing[0]!
  for (let index = 0; index < 100; index += 1) {
    const value = generateDemoPassword(existing, current)
    assert.equal(value.length, 20)
    assert.ok(isStrongDemoPassword(value))
    assert.notEqual(value, current)
    assert.ok(!existing.includes(value))
    assert.ok(!generated.has(value))
    generated.add(value)
    current = value
  }
  const firstWithoutInput = generateDemoPassword()
  assert.notEqual(generateDemoPassword(), firstWithoutInput)
})

test('related accounts come only from active explicit reuse membership', () => {
  const initial = createInitialState()
  assert.deepEqual(getRelatedAccounts(initial.accounts, 'spotify').map((account) => account.id), [
    'google', 'netflix', 'instagram',
  ])
  for (const id of ['canvas', 'github', 'missing']) {
    assert.deepEqual(getRelatedAccounts(initial.accounts, id), [])
  }
  const resolved = appReducer(initial, { type: 'resolve-issue', accountId: 'spotify' })
  assert.deepEqual(getRelatedAccounts(resolved.accounts, 'spotify'), [])
  assert.deepEqual(getRelatedAccounts(resolved.accounts, 'google').map((account) => account.id), [
    'netflix', 'instagram',
  ])
})

test('preparing or abandoning a generated preview without dispatch leaves account state unchanged', () => {
  const state = createInitialState()
  const snapshot = structuredClone(state)
  const spotify = selectAccountById(state, 'spotify')!
  const generated = generateDemoPassword(state.accounts.map((account) => account.demoPassword), spotify.demoPassword)
  assert.ok(isStrongDemoPassword(generated))
  getRelatedAccounts(state.accounts, 'spotify')
  selectSecuritySummary(state)
  assert.deepEqual(state, snapshot)
  assert.equal(state.lastResolution, null)
  assert.equal(selectAccountById(state, 'spotify')?.demoPassword, spotify.demoPassword)
})

test('clearing resolution metadata keeps account changes and the security summary', () => {
  const resolved = appReducer(createInitialState(), { type: 'resolve-issue', accountId: 'spotify' })
  const cleared = appReducer(resolved, { type: 'clear-resolution' })
  assert.equal(cleared.lastResolution, null)
  assert.equal(cleared.accounts, resolved.accounts)
  assert.deepEqual(selectSecuritySummary(cleared), selectSecuritySummary(resolved))
  assert.equal(appReducer(cleared, { type: 'clear-resolution' }), cleared)
  assert.ok(resolved.lastResolution)
})

test('changing settings affects only the requested setting and preserves resolution data', () => {
  const resolved = appReducer(createInitialState(), { type: 'resolve-issue', accountId: 'github' })
  const changed = appReducer(resolved, { type: 'update-settings', settings: { autoLock: false } })
  assert.deepEqual(changed.settings, { autoLock: false, securityGuidance: true })
  assert.equal(changed.accounts, resolved.accounts)
  assert.equal(changed.lastResolution, resolved.lastResolution)
  assert.deepEqual(resolved.settings, { autoLock: true, securityGuidance: true })
})

test('a duplicated or non-demo replacement is regenerated as a fresh fictitious example', () => {
  for (const replacement of [DEMO_ACCOUNTS[0]!.demoPassword, 'not-a-demo-value']) {
    const initial = createInitialState()
    const resolved = appReducer(initial, {
      type: 'resolve-issue', accountId: 'spotify', demoPassword: replacement,
    })
    const saved = selectAccountById(resolved, 'spotify')!.demoPassword
    assert.ok(isStrongDemoPassword(saved))
    assert.notEqual(saved, replacement)
    assert.ok(!initial.accounts.some((account) => account.demoPassword === saved))
    assert.deepEqual(resolved.lastResolution?.after, selectSecuritySummary(resolved))
  }
})
