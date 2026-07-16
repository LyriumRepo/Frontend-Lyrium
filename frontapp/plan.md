# Plan: Sidebar Icon SVG Stroke Animations

## Goal
Replace generic scale/rotate/reveal sidebar icon animations with SVG stroke-based "drawing" effect on mount, plus per-icon hover personality. Keep active glow as-is.

## Approach

### Layer 1 — Mount: SVG stroke-draw (one-time, on page load)
- Add `animate` prop to `Icon.tsx` that applies `.icon-stroke-mount` class to the `<svg>` element
- CSS rule: `.icon-stroke-mount path, .icon-stroke-mount circle, ...` sets `stroke-dasharray: 500; stroke-dashoffset: 500` and animates `stroke-dashoffset` to `0` over 1.5s with staggered `animation-delay` per icon
- After animation completes (`forwards` fill), stroke stays visible
- SmartSidebar passes `animate` to Icon

### Layer 2 — Hover: color transition + per-icon effects
- `.group:hover .icon-stroke-mount path { transition: stroke 0.3s }` — smooth color change on hover
- `getIconEffectClass()` maps icon names to CSS classes (`icon-wobble`, `icon-tilt`, `icon-slide-in`, etc.)
- Each class targets `.icon-wobble svg` with a delayed animation (350ms after mount)

### Layer 3 — Active: keep existing breathing glow
- `sidebarIconGlow` stays on container div, box-shadow only (no transform conflict)

## Files to modify

| File | Change |
|------|--------|
| `Icon.tsx` | Add `animate` prop, apply `icon-stroke-mount` class to `<svg>` |
| `globals.css` | Add `.icon-stroke-mount` rules + keyframes + per-icon effects |
| `SmartSidebar.tsx` | Pass `animate` to Icon, add `getIconEffectClass()`, add per-icon classes to container |

## Verification
- `npx tsc --noEmit` — no new TS errors
- Visual: icons draw their strokes on page load (staggered), hover changes color + triggers per-icon effect, active glows
