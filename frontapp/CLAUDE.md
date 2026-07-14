# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Frontend Lyrium** — Next.js 16 (React 19 + TypeScript) multi-role marketplace portal. Talks to a Laravel 12 API at `http://localhost:8000`.

## Commands

```bash
npm run dev       # Dev server on port 3000 (forces --webpack)
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript type check (no output files)
npx playwright test                      # Run all E2E tests
npx playwright test --grep "test name"   # Run a single E2E test
```

> `docker-compose.yml` does not exist in this repo. The `docker-compose up` pattern refers to a full-stack compose file at the parent `PROYECTO_LYRIUM/` level if configured separately.

## Architecture

### App Router Structure

Role-based top-level route groups under `src/app/`:

```
(public)/    — unauthenticated pages (home, products, blog, bioforo, checkout…)
admin/       — administrator dashboard
seller/      — seller dashboard
customer/    — customer dashboard
logistics/   — logistics_operator dashboard
api/         — Next.js API routes (proxy/adapter layer — see below)
```

### Authentication & Middleware

`src/proxy.ts` **is the intended Next.js middleware, but it is currently non-functional.** Two bugs prevent Next.js from activating it: (1) the filename must be `src/middleware.ts`, not `src/proxy.ts`; (2) the exported function must be named `middleware` (or be a default export), but it exports `proxy`. The `config.matcher` in the file is correct, but it never runs. Effectively, **there is no server-side route protection on the frontend right now** — all role checks are client-side only. It:
1. Reads the `auth_token` cookie (httpOnly JWT issued by Laravel Sanctum).
2. Decodes the JWT payload client-side to extract `roles[0]`.
3. Redirects to `/login` if no token or wrong role for the requested path segment (`/admin`, `/seller`, `/logistics`).
4. Forwards the resolved role as `x-user-role` request header.

**Known bugs in proxy.ts:**
- Checks `userRole !== 'logistics'` but the backend role is `'logistics_operator'` — logistics users are incorrectly redirected to login.
- `/customer/*` routes have no role enforcement — any authenticated user can access them.

The token is stored in two places for different consumers:
- `auth_token` cookie → read by `proxy.ts` (middleware, no JS access)
- `laravel_token` localStorage → read by `src/lib/api/apiClient.ts` for fetch calls

`useAuthStore.validate()` (in `src/shared/hooks/useAuthstore.ts`) exchanges the httpOnly cookie for a token via the `GET /api/auth-token` Next.js route handler, then calls `GET /auth/validate` on the Laravel API with a Bearer token to confirm the session is alive. Call this on app boot / layout mount.

### API Layer

Three API utility locations coexist — understand which to use:

| Location | Pattern | When to use |
|----------|---------|-------------|
| `src/lib/api/apiClient.ts` | Thin `fetch` wrapper, reads token from `localStorage` | Existing direct calls in older feature code |
| `src/shared/lib/api/` | Repository pattern — one file per domain (`orderRepository.ts`, `productRepository.ts`, …) | New code; preferred for all server-side and shared calls |
| `src/shared/lib/api/base-client.ts` | Base class for repository pattern | Extend when creating a new repository |

There are 55+ repository files in `src/shared/lib/api/`. Notable ones: `rankingRepository.ts` (product/store rankings), `operationsRepository.ts` (suppliers, expenses, operational roles, audit logs), `nubefactRepository.ts` (SUNAT invoicing), `settingsRepository.ts` (user/seller settings), `liriosRepository.ts` (Lirios wallet — calls `/lirios/*` endpoints that **are connected** in the backend), `Specialistrepository.ts` (note capital `S`, inconsistent naming). See Backend CLAUDE.md "Unconnected Controllers" for the full list of 404-prone endpoints.

Prefer `src/shared/lib/api/` repositories for new work. Do not add a new `src/lib/api/` file unless matching an existing one.

**Axios + TanStack React Query v5** are used for client-side data fetching in feature hooks. The repositories above are the data-access layer; hooks wrap them with `useQuery` / `useMutation`.

**Next.js API routes** (`src/app/api/`) act as a BFF/adapter layer for:
- `api/auth-token/` — exchanges credentials, sets the httpOnly cookie
- `api/auth/session/` — session validation
- `api/auth/token/` — token handling (distinct from `auth-token/`)
- `api/broadcasting/auth/` — proxies Reverb channel auth to Laravel
- `api/blog/`, `api/forum/` — wraps static data files in `src/data/`
- `api/webhooks/woocommerce/`, `api/woocommerce/`, `api/health/woocommerce/` — WooCommerce integration (in progress)

#### Feature flags
`src/features/seller/plans/lib/flags.ts` exports `USE_MOCKS`. It is always `false` — all API calls are real. Do not add mock branches.

#### Admin Plans — Dual API system (important)
The admin planes panel has two parallel API files. Only ONE is actually wired up:

| File | Status | Used by |
|------|--------|---------|
| `features/seller/plans/lib/api.ts` | **Active** | `usePlanesAdmin.ts`, all admin plans hooks |
| `features/admin/planes/api/planesAdminApi.ts` | **Stub / disconnected** | Nothing (imported by no hook) |

Always edit `features/seller/plans/lib/api.ts` for admin plans API changes. `planesAdminApi.ts` has broken endpoints (`/admin/pagos`, `/admin/vendedores/stats`) and is not in use — do not import from it until it is audited and connected.

#### Admin Plans hook — response shape
`usePlanesAdmin.ts` calls the Laravel API directly via `apiGet`/`apiPost` from `lib/api.ts`. The backend wraps plans in `{data: [...]}` with **no** `success` field — always check `Array.isArray(response.data)`, never `response.success`.

### State Management

Zustand stores in two locations:

| File | Scope |
|------|-------|
| `src/store/carritoStore.ts` | Shopping cart items |
| `src/store/checkoutStore.ts` | Checkout flow state |
| `src/store/uiStore.ts` | Global UI flags (modals, drawers) |
| `src/features/cart/stores/` | Cart data, filter, and UI slices (feature-level) |
| `src/shared/hooks/useAuthstore.ts` | Auth state (user, token, role) |

### Feature Modules (`src/features/`)

Organized by role, each feature folder contains hooks, types, and sometimes mock data:

```
admin/      — analytics, finance, helpdesk, inventory, operations, planes, sellers, treasury
seller/     — agenda, chat, finance, help, invoices, logistics, orders, plans, profile, sales, services, store
customer/   — chat, invoices, lirios, payment-methods, support
logistics/  — chat, helpdesk, shipments
cart/       — hooks, stores, types
auth/       — hooks, types
chatbot/    — AI chatbot (Gemini/OpenAI backed); components + hooks; visible to authenticated users
public/     — carrito, checkout, libroreclamaciones, nosotros, politicasdeprivacidad
```

**Lirios wallet** — `src/features/customer/lirios/LiriosWalletPageClient.tsx` + `src/shared/lib/api/liriosRepository.ts`. Used in checkout (`useCheckoutSubmit.ts`) to apply Lirios balance. Balance and eligibility come from `GET /lirios/balance` and `GET /lirios/checkout-eligibility`.

### Shared Code

- `src/components/ui/` — **Base component library**: `BaseButton`, `BaseInputField`, `BaseSelectField`, `BaseModal`, `BaseDrawer`, `BaseLoading`, `BaseSkeleton`, `BaseStatCard`, `BaseStatusBadge`, `DataTable`, `OptimizedImage`, `Icon`. Prefer these over raw HTML or bare Radix primitives. `OptimizedImage` wraps `next/image` with the project's `unoptimized: true` config and the `/storage/` rewrite.
- `src/components/` — Role-scoped and feature UI components grouped by function (admin, charts, home, layout, login, products, search, store, ui)
- `src/modules/` — cross-role modules: `cart/`, `chat/`, `helpdesk/`
- `src/shared/` — hooks, lib utilities, types, context providers (preferred location for new shared code)
- `src/lib/types/` — TypeScript types (older location; duplicated in `src/shared/types/` — prefer `src/shared/types/` for new type definitions)
- `tsconfig.json` path alias: `@/*` maps to `./src/*`. There are no other aliases (`@shared/*`, `@features/*`, etc.) — use `@/shared/...`, `@/features/...`
- `src/shared/lib/constants/routes.ts` — centralized route path constants; use these instead of hardcoded strings
- `src/shared/lib/auth/permissions.ts` — permission helpers for role-based UI visibility
- `src/shared/lib/schemas/` — Zod v4 schemas; currently only `product.schema.ts` exists. `src/shared/lib/validation.ts` handles other reusable validation helpers. Most form validation is still inline in feature components
- `src/shared/lib/firebase/` — Firebase/FCM setup; push notifications received via service worker (`public/firebase-messaging-sw.js`)

### Static Mock Data (not API-connected)

- `src/data/` — static data files (`homeData.ts`, `menuData.ts`, `peruLocations.ts`)
- **Bioblog** (`/bioblog`) and **Bioforo** (`/bioforo`) pages render from `src/data/` files and the Next.js API routes `api/blog/` and `api/forum/` — **not wired to the Laravel backend**. Do not add backend API calls here without first creating the corresponding Laravel endpoints.
- WooCommerce integration (`src/app/api/woocommerce/`, `src/app/api/webhooks/woocommerce/`) — scaffolded but not production-ready.

### Type Duplication Warning

`src/lib/types/` and `src/shared/types/` both contain entity type definitions (e.g., `entities.ts`, `auth.ts`). This is an ongoing migration. When editing types, check both locations and update the one that is actually imported by the file you're working on. Do not create a third copy.

### Real-time

Laravel Echo React (`@laravel/echo-react`) + Pusher JS connect to Laravel Reverb (`NEXT_PUBLIC_REVERB_*` env vars). Seller plans module also uses a legacy SSE connection via `features/seller/plans/hooks/useSSE.ts`.

SSE usage pattern (for plans module):
```ts
useSSE('admin', '', handlers)        // admin panel (no userId needed)
useSSE('store', storeId, handlers)   // seller panel
```
The `useSSE` hook builds URL: `${API}/events?channel={canal}&user_id={userId}`. For the admin channel, `userId` is empty string.

### Image / Media

`next.config.ts` rewrites use `127.0.0.1` (not `localhost`) — if backend media is not loading, verify the rewrite destination matches where Laravel is actually listening. Backend media is served via the `/storage/*` rewrite. Always use the rewrite path (e.g., `/storage/products/image.jpg`) rather than direct backend URLs.

## Environment

Key vars in `.env.local`:
- `NEXT_PUBLIC_LARAVEL_API_URL` — Laravel API base (default `http://localhost:8000/api`)
- `NEXT_PUBLIC_LARAVEL_STORAGE_URL` — base for `/backend` and `/storage` rewrites
- `NEXT_PUBLIC_REVERB_*` — WebSocket connection (points to Railway in production)
- `NEXT_PUBLIC_FIREBASE_*` — FCM push notifications
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth
- `NEXT_PUBLIC_IZIPAY_*` — Izipay payment gateway (plan subscriptions)
