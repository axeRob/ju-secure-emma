# JU Secure demo architecture

## State

`AppProvider` owns a React reducer and supplies state, dispatch, and derived selectors. State is in memory and resets on reload. Neither localStorage nor a backend stores demo accounts or passwords. Do not add real credentials to this academic prototype.

Each account has `id`, `serviceName`, `username`, `status`, `issueType`, `passwordStrength`, `reusedGroupId`, `initial`, and `demoPassword`. The last field contains a visibly fictitious `DEMO-` example, never a real credential. Each reused group shares one fixed example; initially safe accounts have unique examples; weak accounts have clearly labeled weak demo values.

Initial data contains exactly 24 accounts: **3 safe, 15 reused, 6 weak**, reflecting Emma's current password habits. JU Student Web, Canvas / JU, and University Library are safe. GitHub, Facebook, Apple, Slack, Duolingo, and Student Email are weak.

| Reused group | Accounts |
| --- | --- |
| `demo-shared-a` | Spotify, Google, Netflix, Instagram |
| `demo-shared-b` | Amazon, Booking.com, Microsoft |
| `demo-shared-c` | LinkedIn, Zoom, Notion |
| `demo-shared-d` | Reddit, Discord, Steam |
| `demo-shared-e` | Dropbox, Adobe |

Reuse relationships are explicit IDs, never inferred from names or email addresses. `getSecuritySummary` derives every displayed count from accounts. `getRecommendedAccount` prioritizes unresolved Spotify, then the first reused account, then the first weak account; it returns no recommendation when all accounts are safe. Vault, Security, and optional post-success guidance use this shared selector. Vault can temporarily prioritize an explicitly deferred account so its calm reminder remains relevant. Reuse guidance derives members from the selected account's actual group.

The reducer supports issue resolution, adding/importing demo accounts, filtering, settings updates, onboarding, and returning-user state. Interactive screens dispatch resolution, addition, and preference updates; informational onboarding/import/unlock screens do not perform those operations. Add/import preserve existing accounts and assign deterministic unique IDs on collisions.

`resolve-issue` accepts an optional generated `demoPassword`. A valid fresh supplied example is saved; otherwise `generateDemoPassword` supplies a fresh one. The selected account becomes strong and safe, and leaves its explicit reused group. Other group members retain their original examples. A strong final member becomes safe automatically; a weak final member retains its strength issue. `lastResolution` records the selected account, original issue, related names/IDs, actual before/after summaries, and a snapshot of each original peer's status/group after normalization. Success uses these historical snapshots, so later changes cannot rewrite the displayed result. The number of problems fixed is `before.needsAttention - after.needsAttention`. `clear-resolution` can dismiss metadata without changing accounts.

For the four-member Spotify group, resolving Spotify gives 4 safe / 14 reused / 6 weak; resolving Google next gives 5 / 13 / 6. Resolving Netflix then automatically clears Instagram's final reuse relationship, producing 7 / 11 / 6. Other groups remain unchanged. The interactive journeys use these derived reducer results throughout; display counts are not hardcoded.

`status` and `issueType` represent the primary displayed issue, while `passwordStrength` records strength separately. Removing a final reuse relationship keeps a weak remaining account marked weak; it becomes safe only if its strength is strong. If later prompts introduce further simultaneous issue types, extend this to a typed issue collection and keep unrelated issues when resolving one. Do not infer actual password strength or reuse: all values are supplied by demo fixtures.

## Demo interactions

`data/passwords.ts` generates predictable, in-memory 20-character `DEMO-` examples containing letters, numbers, and symbols. A counter ensures fresh examples while existing/current values are excluded. This is an educational generator, not a cryptographic tool. Generated previews stay in screen state until the simulated change completes; cancellation and “Not now” do not update accounts.

`PasswordDisplay` supports reveal/hide and copying the fictitious value. It uses clipboard access when available, reports simulated copying when unavailable, and resets confirmation after a short delay. A new value or a route remount resets transient reveal/copy feedback.

The reuse and weak journeys explain the concrete consequence using actual accounts and offer one primary “Fix this for me” action. The generated-password screen prepares the recommended example and a safe-default checklist without technical choices. “Use recommended password” runs a short local loading sequence, dispatches one resolution, and opens historical BEFORE/NOW feedback. Copying is optional; generating another remains secondary. Success offers Back to Vault and an optional next recommended fix. Missing accounts and already-safe accounts provide return actions. No account provider, external website, or authentication service is contacted.

“Not now” returns to Vault without dispatching an account change. `App` retains only the deferred account ID for a calm “Still needs attention” recommendation and a working fix action. Preparing or abandoning a generated preview does not alter passwords, statuses, groups, or totals.

Add account accepts made-up service/user details and defaults to a unique generated example. Its alternative selects only existing fictitious values or fixed weak presets. `getDemoPasswordMatches` compares exact `DEMO-` strings; matching accounts appear immediately with the consequence of reuse. “Use a unique password” prepares the safe alternative. “Keep this password” is required before saving a duplicate, and changing the selected value clears confirmation.

This flow opts into `add-account.detectDemoReuse`. Matching fake values join an existing explicit group or form a deterministic, collision-safe `demo-reuse-*` group. Matching safe/weak accounts become primarily reused while their strength fields remain intact. Resolving a newly added reused account therefore leaves a weak final peer weak. Legacy add/import actions do not infer reuse without the opt-in flag. Saving updates derived totals and returns to Vault; added accounts live only for the current visit, so the total can exceed the initial 24.

Automatic lock and helpful guidance switches update `settings` in memory. Their defaults are enabled, but they do not implement actual locking or account security. Short articles in `data/articles.ts` explain unique passwords, 2FA, and passkeys with concrete examples. Reloading restores the initial fixtures and preferences.

## Routes

Hash navigation supports browser history and direct links without server rewrite configuration. `Route` and `ROUTE_PATHS` define the complete screen structure. Unknown or malformed routes fall back to Vault; missing account IDs show a return action.

| Area | Route | Current implementation |
| --- | --- | --- |
| Onboarding | `#/welcome` | Informational welcome |
| Onboarding | `#/create-vault` | Informational demo entry |
| Onboarding | `#/import` | Informational entry; no file import |
| Onboarding | `#/unlock` | Informational entry; no real authentication |
| Vault | `#/vault` | Full reference overview |
| Vault | `#/vault/account/:accountId` | Details, reveal/hide, copy, recommended action |
| Vault | `#/vault/add` | Unique default, immediate reuse guidance, deliberate Keep |
| Security | `#/security` | Derived overview and contextual recommendations |
| Security | `#/security/reused/:accountId` | Actual related accounts and next step |
| Security | `#/security/safer/:accountId` | Generate, copy, cancel, and simulate a change |
| Security | `#/security/weak/:accountId` | Weak demo issue and recommended next step |
| Security | `#/security/success` | Actual demo result and updated summary |
| Learn | `#/learn` | Full basic overview |
| Learn | `#/learn/:articleId` | Short unique-password, 2FA, and passkey articles |
| Settings | `#/settings` | Enabled demo preference switches |

Exactly four primary navigation sections exist. Subscreens inherit their parent section. Onboarding routes are outside primary navigation and provide a return to the demo Vault. Route changes reset document scrolling, update the page title, and focus the main content for keyboard and assistive-technology users.

## Design

`styles/tokens.css` centralizes colors, type, spacing, radii, and app dimensions. The viewport uses a 390px maximum width with normal document scrolling. A fixed bottom navigation aligns with the app. Vault's magenta plus button floats above it in a transparent wrapper without a rectangular background or border; the wrapper does not intercept clicks outside the button. End padding keeps the final account accessible.

Reusable components include buttons, text actions, cards, notices, account/status cards, security summary/issues, password display, page header, navigation, settings rows, toggles, Learn cards, and a floating action. Semantic buttons, worded statuses, visible focus, labeled switches, and live copy/simulation feedback are built into these components.

Password health combines derived totals with a one-account-at-a-time explanation. A separate primary recommendation carries the active fix action; aggregate Security categories stay secondary. The bottom-navigation Security badge derives from `summary.needsAttention`, includes its meaning in the button's accessible label, and disappears at zero.

The internal 15 Emma principles live in `data/emmaPrinciples.ts`. Fogg's motivation, ability, and trigger rationale appears indirectly through personally relevant explanations, one recommended action, and contextual guidance. Neither the principles nor theory are rendered as application screens.

## Internal Fogg audit

| Principle | Implementation |
| --- | --- |
| Motivation: why care? | Actual affected account names, possible consequences, and historical progress show what one change improves. Calm copy avoids blame or exaggerated certainty. |
| Ability: make it easy | One prepared unique example, safe defaults, an explicit checklist, optional copying, and one simulation action remove technical decisions. |
| Trigger: what now? | Vault, Security, account details, issue screens, Add account reuse guidance, the attention badge, and optional next-fix feedback point directly to an available action. |

Audit the loop from Vault through Spotify's explanation, prepared password, simulation, success, optional next fix, and Vault. “Not now” must preserve the unresolved account and its reminder. After normalization, feedback must distinguish still-shared peers, newly unique peers, and peers still needing stronger passwords; the fixed count follows actual attention reduction. With no unresolved issues, recommendations and the badge disappear. Add account must require a new Keep confirmation after any value change, and its unique alternative must avoid every existing demo value.

There are no analytics, scoring, gamification, chatbots, sharing, payments, administration, real auth integrations, browser integrations, backend services, or persistent credential storage. Password values used by the prototype are fictitious examples held in memory.
