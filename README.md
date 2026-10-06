# JU Secure — Emma prototype

A mobile-first educational password manager prototype for a university Human Aspects of Cybersecurity project. Explore demo accounts, practise improving weak or reused passwords, and read short explanations. All account details and `DEMO-` password examples are fictitious. Changes live in memory for the current visit; the app has no backend, real authentication, service connections, or persistent credential storage.

## Run locally

Use Node.js 24 (the cloud environment currently has 24.19.0) and npm.

```sh
cd /workspace/ju-secure-emma
npm ci --cache .npm
npm run dev
```

Outside the cloud environment, use your checkout directory instead. The development command binds Vite to `0.0.0.0:5173` and fails if that port is occupied instead of silently choosing another port. Dependencies are locked in `package-lock.json` and the npm cache is ignored.

For Web Preview, select the running development server on port **5173**, with `/ju-secure-emma/` as the entry path. Do not select the source `index.html` as a static file: it imports TypeScript/JSX that Vite must transform, so opening the file directly will leave React unmounted. The `npm run preview` command serves a production build on a separate port and is not the development command.

```sh
npm run build       # TypeScript check and production build
npm run typecheck   # TypeScript only
npm test            # Domain tests using Node's test runner
npm run preview     # Serve the production build
```

## GitHub Pages

The Vite base path is `/ju-secure-emma/`, matching the repository site. After deployment, the app is available at **https://axerob.github.io/ju-secure-emma/**. Hash routes such as `/ju-secure-emma/#/learn` and `/ju-secure-emma/#/vault/account/spotify` keep navigation and direct reloads working without server rewrites.

In the repository's **Settings → Pages → Build and deployment → Source**, select **GitHub Actions** if it is not already selected. GitHub Actions must also be enabled for the repository. No `gh-pages` branch, custom domain, manual `dist` commit, or routing fallback is needed.

`.github/workflows/deploy-pages.yml` runs on pushes to `main` and can also be started manually. It uses the pinned Node version, installs with `npm ci`, runs the existing tests, builds the production app, uploads `dist`, and deploys it to the `github-pages` environment. Tests and the build must succeed before deployment. The deployment job has the required Pages write and OIDC permissions.

If the first run fails because Pages was not configured yet, select **GitHub Actions** as the source, then rerun **Deploy JU Secure to GitHub Pages** from the Actions tab. To check the production output locally, run `npm run build` followed by `npm run preview`, then open `/ju-secure-emma/` on the preview server.

## What works

- Vault, Security, Learn, and Settings navigation, including browser back/forward. Security has a subtle accessible badge showing the current number of accounts needing attention; it disappears when none remain.
- Vault starts with **24 demo accounts: 3 safe, 15 reused, 6 weak** across five explicit reuse groups. Password health explains that 21 accounts need attention while offering one manageable action. The shared recommendation prioritizes unresolved Spotify, then another reused account, then a weak account.
- Account details show a fictitious password example with reveal/hide and copy controls. Copy feedback resets after a short confirmation; unavailable clipboard access is clearly reported as a demo simulation.
- Reuse and weak-password journeys name affected accounts, explain the consequence, and offer “Fix this for me.” A unique 20-character demo example and safe-default checklist are prepared automatically. “Use recommended password” completes the local simulation; copying is optional. “Not now” returns to Vault with a calm reminder and leaves accounts unchanged. No external service opens.
- Success shows historical BEFORE/NOW account relationships, actual summary changes, and the number of problems fixed. Still-shared or weak peers retain their correct status. An optional next fix and Back to Vault keep progress voluntary.
- The magenta plus button opens Add account. A unique generated example is selected by default. Choosing an existing demo value immediately shows matching accounts and recommends a unique alternative. Reuse requires a deliberate “Keep this password”; changing the selection clears that confirmation. Saving reused examples joins or creates an explicit group while retaining weak-strength issues.
- Learn opens short articles about unique passwords, 2FA, and passkeys, each with a concrete example and benefit.
- Settings switches update demo preferences for automatic lock and helpful guidance, with safe defaults enabled. These are in-memory preferences, not real locking or authentication services.

Onboarding, Create vault, Import, and Unlock remain informational entry screens with a working route into the demo. No real master password or account credentials are collected, and no files are imported. Reloading resets accounts, generated changes, added accounts, settings, and progress to the initial fixtures.

For the four-member Spotify group, fixing Spotify gives **4 safe / 14 reused / 6 weak**; fixing Google next gives **5 / 13 / 6**. Fixing Netflix then clears Instagram's final reuse relationship too, giving **7 / 11 / 6**. Other groups and weak issues stay unchanged.

## Structure

```text
src/
  components/    Reusable semantic UI components
  data/          Demo accounts/examples, short articles, internal Emma principles
  screens/       Main tabs, interactive demo journeys and entry screens
  state/         React context, reducer, selectors and domain tests
  styles/        Central tokens and responsive component styles
  types/         Shared account, state, issue and learning types
  routes.ts      Typed hash routes and active-section mapping
```

`docs/architecture.md` explains the route map, state invariants, and boundaries for later implementation. The app uses React and TypeScript on Vite, with Lucide for simple icons. No router, backend, state framework, or browser extension is required.

## Manual visual checks

Check the four tabs at 390 × 844, and widths 360, 375, 393, and 430. Verify visible focus, keyboard navigation, readable status pills, no horizontal overflow, and access to the final account when scrolling. Desktop keeps the mobile app centered at 390px on a dark background. The bottom navigation stays visible; the floating plus button uses a transparent wrapper without a rectangular overlay. The document uses one normal vertical scrollbar.

Try reveal/copy, generating another example, cancelling with “Not now,” completing reused and weak simulations, and the optional next fix. In Add account, verify immediate reuse guidance, the unique alternative, deliberate Keep, and confirmation reset after a selection change. Check updated recommendations/badges, settings, and all Learn articles. Reload and confirm that the initial 3 / 15 / 6 profile and default settings return.
