# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Frontend Lyrium** — Next.js 16 (React 19 + TypeScript) multi-role marketplace portal. Talks to a Laravel 12 API at `http://localhost:8000`.

## Commands

```bash
npm run dev       # Dev server on port 3000 (forces --webpack)
npm run build     # Production build
npm run lint      # ESLint
docker-compose up # Hot-reload dev environment (recommended on Windows)
```

E2E tests use Playwright (`@playwright/test`). No separate test script in `package.json` — run via `npx playwright test`.

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

`src/proxy.ts` **is the Next.js middleware** (file named `proxy.ts`, not `middleware.ts`). It:
1. Reads the `auth_token` cookie (httpOnly JWT issued by Laravel Sanctum).
2. Decodes the JWT payload client-side to extract `roles[0]`.
3. Redirects to `/login` if no token or wrong role for the requested path segment (`/admin`, `/seller`, `/logistics`).
4. Forwards the resolved role as `x-user-role` request header.

The token is stored in two places for different consumers:
- `auth_token` cookie → read by `proxy.ts` (middleware, no JS access)
- `laravel_token` localStorage → read by `src/lib/api/apiClient.ts` for fetch calls

### API Layer

Two API client approaches coexist:

- **`src/lib/api/apiClient.ts`** — thin fetch wrapper, reads token from localStorage, used by server-side feature modules.
- **Axios** (`src/lib/…` or inline) + **TanStack React Query v5** — used for client-side data fetching and caching in feature hooks.

**Next.js API routes** (`src/app/api/`) act as a BFF/adapter layer for:
- `api/auth-token/` — exchanges credentials, sets the httpOnly cookie
- `api/broadcasting/auth/` — proxies Reverb channel auth to Laravel
- `api/blog/`, `api/forum/` — wraps static data files in `src/data/`
- `api/webhooks/woocommerce/`, `api/woocommerce/` — WooCommerce integration (in progress)

### State Management

Zustand stores in two locations:

| File | Scope |
|------|-------|
| `src/store/carritoStore.ts` | Shopping cart items |
| `src/store/checkoutStore.ts` | Checkout flow state |
| `src/store/uiStore.ts` | Global UI flags (modals, drawers) |
| `src/features/cart/stores/` | Cart data, filter, and UI slices (feature-level) |

### Feature Modules (`src/features/`)

Organized by role, each feature folder contains hooks, types, and sometimes mock data:

```
admin/      — analytics, finance, helpdesk, inventory, operations, planes, sellers, treasury
seller/     — agenda, chat, finance, help, invoices, logistics, orders, plans, profile, sales, services, store
logistics/  — chat, helpdesk, shipments
cart/       — hooks, stores, types
auth/       — hooks, types
public/     — carrito, checkout, libroreclamaciones, nosotros, politicasdeprivacidad
```

### Shared Code

- `src/components/` — UI components grouped by function (layout, login, store)
- `src/modules/` — cross-role modules: `cart/`, `chat/`, `helpdesk/`
- `src/shared/` — hooks, lib utilities, types, context providers
- `src/lib/types/` — TypeScript types (admin, auth, entities, logistics, notifications)
- `src/data/` — static mock data for blog and bioforo (not yet wired to real API)

### Real-time

Laravel Echo React (`@laravel/echo-react`) + Pusher JS connect to Laravel Reverb (`NEXT_PUBLIC_REVERB_*` env vars). Seller plans module also uses a legacy SSE connection via `features/seller/plans/hooks/useSSE.ts`.

### Image / Media

`next.config.ts` sets `images.unoptimized: true` during development. Backend media is served via the `/storage/*` rewrite. Always use the rewrite path (e.g., `/storage/products/image.jpg`) rather than direct backend URLs.

## Environment

Key vars in `.env.local`:
- `NEXT_PUBLIC_LARAVEL_API_URL` — Laravel API base (default `http://localhost:8000/api`)
- `NEXT_PUBLIC_LARAVEL_STORAGE_URL` — base for `/backend` and `/storage` rewrites
- `NEXT_PUBLIC_REVERB_*` — WebSocket connection (points to Railway in production)
- `NEXT_PUBLIC_FIREBASE_*` — FCM push notifications
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth
- `NEXT_PUBLIC_IZIPAY_*` — Izipay payment gateway (plan subscriptions)
