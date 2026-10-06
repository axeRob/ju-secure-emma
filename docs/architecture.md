# Foundation and later implementation

## State

`AppProvider` owns a React reducer and supplies state, dispatch, and derived selectors. State is in memory and resets on reload. Neither localStorage nor a backend stores demo accounts or passwords. Do not add real credentials to this academic prototype.

Each account has `id`, `serviceName`, `username`, `status`, `issueType`, `passwordStrength`, `reusedGroupId`, and `initial`. There is deliberately no password value. `PasswordDisplay` renders fixed demonstration bullets.

Initial data contains exactly 24 accounts: **3 safe, 15 reused, 6 weak**, reflecting Emma's current password habits. JU Student Web, Canvas / JU, and University Library are safe. GitHub, Facebook, Apple, Slack, Duolingo, and Student Email are weak.

| Reused group | Accounts |
| --- | --- |
| `demo-shared-a` | Spotify, Google, Netflix, Instagram |
| `demo-shared-b` | Amazon, Booking.com, Microsoft |
| `demo-shared-c` | LinkedIn, Zoom, Notion |
| `demo-shared-d` | Reddit, Discord, Steam |
| `demo-shared-e` | Dropbox, Adobe |

Reuse relationships are explicit IDs, never inferred from names or email addresses. `getSecuritySummary` derives every displayed count from accounts. Vault recommends Spotify first, while Security keeps one prioritized issue and two aggregate categories. Reuse guidance derives the displayed members from the selected account's actual group.

The reducer has actions for resolving an issue, adding/importing demo accounts, filtering, updating future settings, finishing onboarding, and returning-user state. These actions prepare later implementation; unfinished UI flows do not dispatch them. Resolving one reused account leaves the remaining group related. When only one member remains, that member becomes safe too. Add/import preserve existing accounts and assign deterministic unique IDs on collisions.

For the four-member Spotify group, resolving Spotify gives 4 safe / 14 reused / 6 weak; resolving Google next gives 5 / 13 / 6. Resolving Netflix then automatically clears Instagram's final reuse relationship, producing 7 / 11 / 6. Other groups remain unchanged. These are examples of derived reducer results, not hardcoded display values or newly implemented UI actions.

`status` and `issueType` represent the primary displayed issue, while `passwordStrength` records strength separately. Removing a final reuse relationship keeps a weak remaining account marked weak; it becomes safe only if its strength is strong. If later prompts introduce further simultaneous issue types, extend this to a typed issue collection and keep unrelated issues when resolving one. Do not infer actual password strength or reuse: all values are supplied by demo fixtures.

## Routes

Hash navigation supports browser history and direct links without server rewrite configuration. `Route` and `ROUTE_PATHS` define the complete screen structure. Unknown or malformed routes fall back to Vault; missing account IDs show a return action.

| Area | Route | Current implementation |
| --- | --- | --- |
| Onboarding | `#/welcome` | Welcome shell |
| Onboarding | `#/create-vault` | Create Vault shell |
| Onboarding | `#/import` | Import shell |
| Onboarding | `#/unlock` | Unlock shell |
| Vault | `#/vault` | Full reference overview |
| Vault | `#/vault/account/:accountId` | Demo account details |
| Vault | `#/vault/add` | Add Account shell |
| Security | `#/security` | Overview shell with contextual explanations |
| Security | `#/security/reused/:accountId` | Reused Password shell |
| Security | `#/security/safer/:accountId` | Safer Password shell |
| Security | `#/security/weak/:accountId` | Weak Password shell |
| Security | `#/security/success` | Future feedback shell; no success claim |
| Learn | `#/learn` | Full basic overview |
| Learn | `#/learn/:articleId` | Article shell |
| Settings | `#/settings` | Settings shell with inactive safe defaults |

Exactly four primary navigation sections exist. Subscreens inherit their parent section. Onboarding routes are outside primary navigation and provide a return to the demo Vault. Route changes reset document scrolling, update the page title, and focus the main content for keyboard and assistive-technology users.

## Design

`styles/tokens.css` centralizes colors, type, spacing, radii, and app dimensions. The viewport uses a 390px maximum width with normal document scrolling. A fixed bottom navigation aligns with the app; Vault reserves a separate bottom surface for its floating action, keeping the button off visible account labels. The body leaves enough end padding to access the last item.

Reusable components include buttons, text actions, cards, notices, account/status cards, security summary/issues, password display, page header, navigation, settings rows, toggles, Learn cards, and a floating action. Semantic buttons, worded statuses, visible focus, and labeled switches are built into these components. Disabled future switches are explicitly marked in Settings.

The internal 15 Emma principles live in `data/emmaPrinciples.ts`. Fogg's motivation, ability, and trigger rationale appears indirectly through personally relevant explanations, one recommended action, and contextual guidance. Neither the principles nor theory are rendered as application screens.

There are no analytics, scoring, gamification, chatbots, sharing, payments, administration, real auth integrations, browser integrations, or actual password storage.
