---
name: frontend-design
description: Premium frontend design standard for Lyrium BioMarketplace — distinctive UX/UI direction (Apple/Stripe/Linear/Vercel-grade), motion stack (Framer Motion + GSAP + optional R3F/Drei), accessibility, dark/light mode, responsive layout, and reusable component architecture. Use for any new UI, page, or visual redesign in Frontend-Lyrium/frontapp.
license: Extends the frontend-design plugin skill (claude-plugins-official) with project-specific standards.
---

# Frontend Design — Lyrium Standard

This project-scoped skill overrides the global `frontend-design` plugin skill whenever you work inside `Frontend-Lyrium/frontapp`. It keeps the plugin's design-thinking process (ground it in the subject, brainstorm → critique → build) and layers on a concrete, professional-grade standard: aesthetic direction, motion stack, accessibility, theming, and component architecture tailored to this codebase (Next.js 16, React 19, TypeScript, Tailwind v4 + shadcn tokens, `next-themes`, `framer-motion`).

Treat this as the house style guide of a product design team that ships interfaces at the level of Apple, Stripe, Linear, and Vercel: restrained, precise, confident, never generic, never over-animated.

**Standing mandate (2026-07-30, user-directed — applies to every view built from now on, not just redesigns):** every screen must read as premium, modern, and immersive — Apple/Linear/Stripe/Vercel-grade with Lyrium's own identity, never a generic template. Each section should combine microinteractions, fluid animation, parallax, reveals, and scroll-synced effects in balance — not every effect on every view, but the toolset below always available and always deliberate. Build mobile-first with impeccable desktop adaptation. Use the shared motion foundation in `src/shared/lib/motion/` (see section 2) instead of re-deriving variants or GSAP setup per page.

## 1. Aesthetic direction

- **Premium, not decorated.** Quality reads through spacing, alignment, type rhythm, and restraint — not through gradients, glassmorphism piled on, or gratuitous shadows. When in doubt, remove an element rather than add one (Chanel rule from the base skill still applies).
- **Grounded in the subject.** Lyrium sells bio/organic products and services in Peru across four roles (customer, seller, administrator, logistics). Design decisions should read as belonging to *this* marketplace — its categories, its trust signals (SUNAT invoicing, plan tiers, Lirios wallet) — not as a generic SaaS template reskinned.
- **One considered risk per view.** Pick a single signature moment per page (a hero interaction, a data visualization, a transition) and execute it with precision. Keep everything around it quiet.
- **Respect existing brand tokens.** Use the CSS custom properties already defined in `src/app/globals.css` (`--pd-*`, `--bg-*`, `--text-*`, `--brand-sky*`, shadcn `--color-*` aliases) instead of inventing new hard-coded hex values. If a new token is genuinely needed, add it to `:root` and its `.dark` counterpart in `globals.css`, never inline a color that bypasses the theme system.
- **Typography** already uses a defined scale — check `globals.css` and existing layout components before introducing a new font. Any new display/body pairing must be deliberate and justified by the page's role, not just "looks nice."

## 2. Motion stack — pick the right tool, never stack all three by default

`gsap` is now an installed dependency (added 2026-07-30) alongside `framer-motion`. Both are standard tools for every new view, used for their respective job — never redundantly for the same effect.

| Need | Tool | Notes |
|---|---|---|
| UI micro-interactions: hover/tap states, modals, toasts, list reordering, layout transitions, page/route transitions, enter/exit | **Framer Motion** (`framer-motion`) | Default choice for anything React-state-driven. Use `AnimatePresence` for mount/unmount, `layout` prop for reflow animations, `useReducedMotion()` to respect OS preference. Pull shared variants from `src/shared/lib/motion/variants.ts` (`fadeUp`, `staggerContainer`, `cardItem`, `wordUp`) instead of redefining them per file. |
| Scroll-driven storytelling, parallax, timeline sequencing, pinning, clip-path/mask reveals, complex staggered/orchestrated sequences beyond what Framer Motion's `useScroll`/`useTransform` comfortably expresses | **GSAP** + `ScrollTrigger` | Use the shared setup in `src/shared/lib/gsap.ts` (registers the plugin once, exports `prefersReducedMotion()`) and the reusable hooks in `src/shared/hooks/useGsapScroll.ts` (`useScrollParallax`, `useScrollReveal`, `useScrollProgressLine`) rather than writing a fresh `gsap.context()` block in every page. Every hook already cleans up via `gsap.context().revert()` and kills its `ScrollTrigger`s on unmount. |
| 3D or spatial elements | **React Three Fiber + Drei** | Only when a 3D object/scene adds real product value to the narrative (e.g. an interactive product model, a data globe) — never as decoration, and never as a default reach. When 3D isn't justified, default to a sophisticated 2D treatment: depth via layered gradients, lighting via soft glows/highlights, blur, glassmorphism, shadows, and composition — not flat, generic cards. Not yet a dependency; install (`@react-three/fiber`, `@react-three/drei`, `three`) only for that specific view, lazy-load the canvas with `next/dynamic` (`ssr: false`), and keep an accessible non-3D fallback for reduced-motion / low-end devices. |

Rules that apply across all three:
- Always honor `prefers-reduced-motion`. In Framer Motion use `useReducedMotion`; in GSAP, gate every hook/timeline behind `prefersReducedMotion()` from `src/shared/lib/gsap.ts`; 3D scenes must degrade to a static image/poster.
- Animate `transform`/`opacity` only where possible — never animate `width`/`height`/`top`/`left` for performance-sensitive UI.
- Every animation must have a purpose: clarify hierarchy, continuity (what moved from where to where), or causality (what triggered this change). If you can't explain what a specific animation communicates, cut it — no motion for motion's sake, no repetitive effects copy-pasted across unrelated sections.
- Balance across a view: combine 2–3 techniques deliberately per page (e.g. hero parallax + one scroll reveal + hover microinteractions), not every technique on every section. One orchestrated moment beats several scattered ones.
- Reusable architecture over inline one-offs: shared GSAP hooks live in `src/shared/hooks/useGsapScroll.ts`, shared Framer Motion variants in `src/shared/lib/motion/variants.ts`. Extend these when a new pattern is needed by 2+ views; don't fork a near-identical `gsap.context()` block per page.

## 3. Responsive, accessible, dark/light by default

- **Responsive**: mobile-first Tailwind breakpoints (`sm md lg xl 2xl`), test at minimum 375px, 768px, 1280px, 1536px. No horizontal scroll, no fixed pixel widths on containers. Follow the existing card/table pattern used across the codebase (see `SellerList.tsx` and its breakpoint conventions) instead of inventing a new responsive pattern per page.
- **Accessible (WCAG 2.1 AA floor)**: visible keyboard focus rings (do not remove `:focus-visible` styles), semantic HTML and ARIA roles on custom components, color contrast checked against both the light and dark token sets, all interactive elements reachable and operable by keyboard, form fields with associated labels and error messages announced via `aria-live` where relevant.
- **Dark/light mode**: every new component must render correctly in both themes via the existing `next-themes` + `.dark` variant setup — never hardcode a color that only works in one theme. Verify with the theme toggle (`ThemeToggle.tsx`) before considering a view done.
- **Performance**: lazy-load heavy visual/motion modules (GSAP timelines, R3F canvases, large chart libraries) with `next/dynamic`; keep bundle-affecting animation libraries out of the initial route chunk when the view doesn't need them; prefer CSS transitions over JS animation for simple state toggles.

## 4. Component architecture

- Reuse before creating: check `src/components/ui/` (shadcn primitives) and `src/shared/components/` before writing a new primitive. Compose from these rather than duplicating a button/card/modal implementation.
- New shared, cross-feature UI goes in `src/components/ui/` (primitives) or `src/shared/components/` (composed, still cross-feature). Feature-specific UI stays inside that feature's folder under `src/features/<feature>/components/`, matching the existing `features/*` structure.
- Keep components small and composable: one component, one responsibility. Extract a sub-component instead of growing a prop-switch god-component.
- Co-locate animation logic (motion variants, GSAP timeline setup) next to the component that uses it, or in a small shared hook (e.g. `useScrollReveal`) if reused across 3+ places — don't inline the same Framer Motion variant object in ten files.
- Type everything (TypeScript strict); no `any` on component props.

## 5. Process (inherited from the base plugin skill, still required)

1. **Ground it**: confirm the concrete subject, audience, and the view's single job before designing.
2. **Brainstorm token system**: color (from existing tokens), type (existing scale unless a new pairing is justified), layout concept (prose + ASCII wireframe), and the one signature element.
3. **Self-critique against genericness**: would this plan look identical for any other marketplace? If yes, revise until it's specific to Lyrium's subject matter (bio/organic products, Peru, the four roles, Lirios, plan tiers).
4. **Build**, following section 1–4 above.
5. **Critique again**: screenshot both themes and at least two breakpoints, check reduced-motion behavior, check keyboard nav, remove one accessory (Chanel rule).

## 6. Writing / copy

Same standard as the base plugin skill: words are design material. Write from the end user's side of the screen (name things by what people control, not by internal system names), use active voice, keep button label and resulting toast/state consistent ("Publicar" → "Publicado"), treat empty and error states as moments for clear direction rather than mood, and match register to the audience for each role (customer-facing copy in plain conversational Spanish/local tone; admin/seller tooling can be more operational/dense).
