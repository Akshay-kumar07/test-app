# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A React + TypeScript shopping cart demo app: product listing with size filters, floating cart with add/remove, instant total calculation. State is managed with React Context (no Redux), styled with styled-components. Built on Create React App (`react-scripts`).

## Commands

```bash
npm install          # install deps (Node version pinned in .nvmrc: 14.17.3)
npm start            # dev server
npm run build        # production build
npm test             # run all tests (react-scripts test --silent, watch mode by default)
npm run test:watch   # explicit watch mode
npm run test:coverage # run once with coverage report (--watchAll false semantics via CI flag not set, forces watchAll)
npm run lint         # eslint ./src
npm run format       # prettier --write across ts/tsx/js/json/css
```

To run a single test file or test name with CRA's Jest runner:

```bash
npx react-scripts test src/components/Cart/Cart.test.tsx --watchAll=false
npx react-scripts test -t "test name substring" --watchAll=false
```

Snapshot tests live alongside components in `__snapshots__/` directories — update with `-u` when a component's rendered output intentionally changes (`npx react-scripts test -u --watchAll=false`).

## Architecture

**State management**: Two independent React Contexts, each following the same pattern — a context object, a `use*Context` hook that throws if used outside its provider, and a `*Provider` component:

- `src/contexts/cart-context/` — cart open/closed state, cart products, cart total. Exposes derived hooks `useCart`, `useCartProducts`, `useCartTotal` (in addition to the raw `useCartContext`) — prefer these derived hooks over reaching into the raw context.
- `src/contexts/products-context/` — product list, loading state, active size filters.

Both providers wrap the app in `src/components/App`. There is no global store beyond these two contexts.

**Data fetching**: `src/services/products.ts` branches on `NODE_ENV`: in production it fetches from a Firebase-hosted JSON endpoint, in development/test it `require`s the static fixture at `src/static/json/products.json`. Any change to the product shape must be reflected in both the static fixture and `src/models`.

**Component convention**: each component lives in its own folder with a consistent set of files: `Component.tsx`, `style.ts` (styled-components definitions), `index.ts` (barrel re-export), `Component.test.tsx`, and a generated `__snapshots__/` directory. Follow this layout for new components rather than colocating everything in one file.

**Path aliasing**: `tsconfig.json` sets `baseUrl: src`, so imports are absolute from `src` (e.g. `import { IProduct } from 'models'`, `import { useCart } from 'contexts/cart-context'`) rather than relative (`../../models`).

**Styling**: styled-components only, with a shared theme at `src/commons/style/theme.ts` and global styles in `src/commons/style/global-style.tsx`. Don't introduce another CSS approach (CSS modules, plain CSS files, etc.).

**Types**: shared interfaces (`IProduct`, `ICartProduct`, `ICartTotal`, `IGetProductsResponse`, etc.) are centralized in `src/models/index.ts`.

## Enforced constraints

- **Coverage thresholds** (`package.json` → `jest.coverageThreshold`): global 50% branches, 85% functions, 88% lines, 88% statements. Falling below these fails `npm run test:coverage`.
- **Commit messages** must follow Conventional Commits (`@commitlint/config-conventional`), enforced by a Husky `commit-msg` hook.
- **Pre-commit**: Husky runs `lint-staged`, which runs `prettier --write` on staged `*.{js,json,css,md}` files.
