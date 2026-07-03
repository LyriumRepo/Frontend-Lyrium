Arregla los problemas responsive de las páginas públicas de Lyrium Biomarketplace.

Lee primero `RESPONSIVE-AUDIT.md` para ver los 20 hallazgos (5 críticos, 5 altos, 5 medios, 5 bajos).

**Reglas:**
1. No modifiques Desktop — solo mobile (320-480px) y tablet (768-1024px)
2. Sin hacks (margins negativos, translateX arbitrarios, width fijos, media queries innecesarias)
3. Prefiere clases Tailwind responsive (`sm:`, `md:`, `lg:`) sobre CSS manual
4. Usa `aspect-*`, `flex-wrap`, `grid-cols-*`, `scroll-snap-*` en vez de px fijos
5. No edites `planesAdminApi.ts` ni archivos fuera de `src/app/(public)/` y `src/components/home/`

**Orden de prioridad:** 🔴 C1→C5 → 🟠 H1→H5 → 🟡 M1→M5 → 🟢 L1→L5

**Ruta del audit:** `RESPONSIVE-AUDIT.md`

Cuando termines cada fix, borra el emoji correspondiente del checklist en el audit para llevar tracking.
