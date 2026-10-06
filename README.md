# JU Secure — Emma prototype

A mobile-first educational password manager prototype for a university Human Aspects of Cybersecurity project. This first step establishes the design system, demo model, navigation, and screen shells. All displayed accounts and addresses are fictitious demo data. The application contains no password values, backend, real authentication, or credential persistence.

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
npm test            # Ten domain tests using Node's test runner
npm run preview     # Serve the production build
```

## GitHub Pages

The Vite base path is `/ju-secure-emma/`, matching the repository site. After deployment, the app is available at **https://axerob.github.io/ju-secure-emma/**. Hash routes such as `/ju-secure-emma/#/learn` and `/ju-secure-emma/#/vault/account/spotify` keep navigation and direct reloads working without server rewrites.

In the repository's **Settings → Pages → Build and deployment → Source**, select **GitHub Actions** if it is not already selected. GitHub Actions must also be enabled for the repository. No `gh-pages` branch, custom domain, manual `dist` commit, or routing fallback is needed.

`.github/workflows/deploy-pages.yml` runs on pushes to `main` and can also be started manually. It uses the pinned Node version, installs with `npm ci`, runs the existing tests, builds the production app, uploads `dist`, and deploys it to the `github-pages` environment. Tests and the build must succeed before deployment. The deployment job has the required Pages write and OIDC permissions.

If the first run fails because Pages was not configured yet, select **GitHub Actions** as the source, then rerun **Deploy JU Secure to GitHub Pages** from the Actions tab. To check the production output locally, run `npm run build` followed by `npm run preview`, then open `/ju-secure-emma/` on the preview server.

## What works in this step

- Vault, Security, Learn, and Settings navigation, including browser back/forward.
- A polished Vault with all 24 demo accounts: **20 safe, 3 reused, 1 weak**. Account cards open details; the recommendation and plus button open their respective screen shells.
- Learn overview, an account-based example, and two clearly marked future topics.
- Consistent Security and Settings shells. Settings show safe defaults as disabled controls marked “Coming next.” They do not perform locking or other security operations.
- Direct routes for onboarding, account details/add, security guidance/success, and learning articles. Incomplete workflows explain their scope and provide a working return action. The success shell does not claim that an action occurred.

Password change, password generation, import, account creation, settings interaction, complete articles, and returning-user unlock are intentionally deferred.

## Structure

```text
src/
  components/    Reusable semantic UI components
  data/          Fixed demo accounts, Learn copy, internal Emma principles
  screens/       Vault, Learn, Security, Settings and future workflow shells
  state/         React context, pure reducer, selectors and domain tests
  styles/        Central tokens and responsive component styles
  types/         Shared account, state, issue and learning types
  routes.ts      Typed hash routes and active-section mapping
```

`docs/architecture.md` explains the route map, state invariants, and boundaries for later implementation. The app uses React and TypeScript on Vite, with Lucide for simple icons. No router, backend, state framework, or browser extension is required.

## Manual visual checks

Check the four tabs at 390 × 844, and widths 360, 375, 393, and 430. Verify visible focus, keyboard navigation, readable status pills, no horizontal overflow, and access to the final account when scrolling. Desktop keeps the mobile app centered at 390px on a dark background. The bottom navigation and Vault action area remain accessible; the document uses one normal vertical scrollbar.
