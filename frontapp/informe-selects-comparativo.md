# Informe Comparativo: Selects/Dropdowns — Vendedor vs Cliente

## 1. Conclusión principal

**Ambos apartados usan el 100% `LyriumSelect`** (`src/components/ui/LyriumSelect.tsx`). No hay selects nativos, `CustomSelect` ni `BaseSelectField` en ninguna de las dos secciones. El componente es compartido y centralizado. Cualquier bug en `LyriumSelect` afecta a **ambos apartados por igual**.

---

## 2. Inventario completo

### Apartado Vendedor — 30 selects

| # | Archivo | Línea | Label | searchable | disabled | Contexto | ¿Scroll container? |
|---|---------|-------|-------|------------|----------|----------|-------------------|
| V1 | `reservas/page.tsx` | 315 | "Estado" | — | — | Filtro inline | No |
| V2 | `InventoryFiltersBar.tsx` | 89 | "Categoría" | — | — | Filtro inline | No |
| V3 | `BlogArticlesClient.tsx` | 215 | — | — | — | Filtro inline | No |
| V4 | `ServicesPageClient.tsx` | 286 | "Estado" | — | — | Filtro inline | No |
| V5 | `ChatPageClient.tsx` | 52 | "Tu Tienda" | — | ✅ | Formulario inline | **Sí** (`overflow-y-auto`) |
| V6 | `ChatPageClient.tsx` | 63 | "Cliente" | ✅ | ✅ | Formulario inline | **Sí** |
| V7 | `ChatPageClient.tsx` | 75 | "Categoría" | — | — | Formulario inline | **Sí** |
| V8 | `ChatPageClient.tsx` | 265 | (filtro) | — | — | Filtro sidebar | No |
| V9 | `HelpPageClient.tsx` | 153 | (filtro) | — | — | Filtro sidebar | No |
| V10 | `HelpPageClient.tsx` | 282 | "Categoría" | — | — | Formulario inline | No |
| V11 | `ProfilePageClient.tsx` | 370 | "Condición Tributaria" | — | ✅ | Formulario inline | No |
| V12 | `StoreIdentity.tsx` | 57 | "Categoría *" | — | — | Formulario inline | No |
| V13 | `ProductFormClient.tsx` | 421 | "Categoría *" | — | — | Formulario inline | No |
| V14 | **BranchModal.tsx** | 140 | "Dpto." | ✅ | — | **Modal** | **Sí** (`overflow-y-auto`) |
| V15 | **BranchModal.tsx** | 154 | "Prov." | ✅ | ✅ | **Modal** | **Sí** |
| V16 | **BranchModal.tsx** | 167 | "Dist." | ✅ | ✅ | **Modal** | **Sí** |
| V17 | **AddCityModal.tsx** | 45 | "Departamento Originario" | ✅ | — | **Modal** | **Sí** |
| V18 | **AddCityModal.tsx** | 58 | "Ciudad / Distrito Destino" | ✅ | ✅ | **Modal** | **Sí** |
| V19 | **SpecialistModal.tsx** | 430 | (placeholder) | — | — | **Modal** | **Sí** (`max-h-[72vh] overflow-y-auto`) |
| V20 | **SpecialistModal.tsx** | 459 | (placeholder) | — | — | **Modal** | **Sí** |
| V21 | **SpecialistModal.tsx** | 508 | "Años de experiencia" | — | — | **Modal** | **Sí** |
| V22 | **ServiceConfigModal.tsx** | 1214 | (placeholder) | — | — | **Modal** | **Sí** |
| V23 | **ServiceConfigModal.tsx** | 1237 | (placeholder) | — | — | **Modal** | **Sí** |
| V24 | **ServiceConfigModal.tsx** | 1262 | (placeholder) | — | — | **Modal** | **Sí** |
| V25 | **BlogVideosClient.tsx** | 282 | "Plataforma" | — | — | **Modal** | **Sí** |
| V26 | **BlogShortsClient.tsx** | 275 | "Plataforma" | — | — | **Modal** | **Sí** |
| V27 | **BlogPodcastsClient.tsx** | 298 | "Tipo" | — | — | **Modal** | **Sí** |
| V28 | **BlogPodcastsClient.tsx** | 309 | "Plataforma" | — | — | **Modal** | **Sí** |
| V29 | **ForumClient.tsx** | 348 | "Categoría" | — | — | **Modal** | **Sí** |
| V30 | **ForumClient.tsx** / **ForumClient.tsx** | 401 / 423 | "Categoría" / "Estado" | — | — | **Modal** | **Sí** |

### Apartado Cliente — 14 selects

| # | Archivo | Línea | Label | searchable | disabled | Contexto | ¿Scroll container? |
|---|---------|-------|-------|------------|----------|----------|-------------------|
| C1 | **addresses/page.tsx** | 316 | "Etiqueta de ubicación" | — | — | **Modal** | **Sí** (`overflow-y-auto`) |
| C2 | **addresses/page.tsx** | 349 | "Departamento" | ✅ | — | **Modal** | **Sí** |
| C3 | **addresses/page.tsx** | 385 | "Ciudad / Provincia" | ✅ | ✅ | **Modal** | **Sí** |
| C4 | **addresses/page.tsx** | 402 | "Urbanización / Distrito" | ✅ | ✅ | **Modal** | **Sí** |
| C5 | profile/page.tsx | 693 | "Tipo de Documento" | — | ✅ | Formulario inline | No |
| C6 | support/SupportPageClient.tsx | 94 | "Categoría" | — | — | Formulario inline | No |
| C7 | support/SupportPageClient.tsx | 329 | (filtro) | — | — | Filtro sidebar | No |
| C8 | chat/ChatPageClient.tsx | 51 | "Vendedor" | ✅ | — | Formulario inline | **Sí** (`overflow-y-auto`) |
| C9 | chat/ChatPageClient.tsx | 61 | "Categoría" | — | — | Formulario inline | **Sí** |
| C10 | chat/ChatPageClient.tsx | 262 | (filtro) | — | — | Filtro sidebar | No |
| C11 | orders/page.tsx | 1068 | "Tienda" | ✅ | — | Filtro inline | No |
| C12 | orders/page.tsx | 1095 | "Tipo de envío" | — | — | Filtro inline | No |
| C13 | orders/page.tsx | 1111 | "Estado" | — | ✅ | Filtro inline | No |
| C14 | orders/page.tsx | 1142 | (categoría) | — | — | Filtro inline | No |

---

## 3. Comparativa

| Aspecto | Vendedor | Cliente |
|---------|----------|---------|
| Total selects | **30** | **14** |
| Componente usado | `LyriumSelect` (100%) | `LyriumSelect` (100%) |
| En modales | **8** (BranchModal, AddCityModal, SpecialistModal, ServiceConfigModal, Blog*Modal, ForumModal) | **4** (addresses modal) |
| En scroll containers | 11 (8 modales + 3 chat inline) | 6 (4 modal + 2 chat inline) |
| Con `searchable` | **6** (BranchModal×3, AddCityModal×2, Chat×1) | **4** (AddressesModal×3, Chat×1, Orders×1) |
| Con `disabled` | **6** | **5** |
| Con `error` | **0** | **1** (profile) |
| Con label como `<p>` externo (inconsistencia) | **2** (SpecialistModal, ServiceConfigModal) | **0** |

---

## 4. Problemas detectados

### P1 — Bug del scroll listener (CRÍTICO, compartido)

| | Vendedor | Cliente |
|---|---|---|
| **Selects afectados** | **11** (V5-V7, V14-V30) | **6** (C1-C4, C8-C9) |
| **Archivo con el bug** | `src/components/ui/LyriumSelect.tsx:135-144` | Mismo archivo |
| **Síntoma** | Dropdown se cierra al mover cursor hacia opciones dentro de modales/scroll containers | Mismo síntoma |
| **Es el mismo bug** | **Sí** — idéntico. Mismo componente, mismo listener, misma causa | **Sí** |

**Causa raíz**: `window.addEventListener('scroll', close, true)` con `capture: true` captura eventos `scroll` de CUALQUIER elemento del documento, incluyendo scroll containers internos de modales.

**Evidencia directa**: El modal de direcciones del cliente (`addresses/page.tsx:287-290`) es casi idéntico al BranchModal del vendedor — ambos son modales con `overflow-y-auto` en el contenido y `LyriumSelect` con `searchable` dentro. El bug se reproduce en ambos.

### P2 — Posicionamiento con doble RAF (MEDIO, compartido)

| | Vendedor | Cliente |
|---|---|---|
| **Selects afectados** | Todos (30) | Todos (14) |
| **Archivo** | `LyriumSelect.tsx:123-126` | Mismo |

`updatePosition()` se ejecuta 1 vez síncrono (con `dropdownHeight=0`) y otra en `requestAnimationFrame`. El primer cálculo puede decidir `flip` incorrectamente, causando que el dropdown aparezca en posición equivocada y se reubique 1 frame después.

### P3 — `fixed` positioning + modal scroll (ALTO, compartido)

| | Vendedor | Cliente |
|---|---|---|
| **Selects afectados** | 11 (en modales) | 6 (en modales/scroll) |
| **Archivo** | `LyriumSelect.tsx:276-278` / modal containers | Mismo |

El dropdown usa `position: fixed` fuera del flujo del modal. Si el usuario scrollea el contenido del modal, el trigger se mueve pero el dropdown no. El scroll listener (P1) lo cierra como "solución", pero la desalineación visual existe.

### P4 — Inconsistencias exclusivas de cada apartado

| Problema | Vendedor | Cliente |
|----------|----------|---------|
| Error state como `<p>` externo (no usa `error` prop) | SpecialistModal, ServiceConfigModal | No aplica |
| `searchable` sin placeholder personalizado | BranchModal (placeholder default "Seleccionar...") | AddressesModal (personalizado "Departamento") |
| Label con JSX (asterisco `*`) | StoreIdentity.tsx:57, ProductFormClient.tsx:421 | No aplica |

---

## 5. Plan de implementación

El fix es **un solo archivo**: `src/components/ui/LyriumSelect.tsx`. No hay cambios por sección.

### F1: Scroll listener (líneas 135-144)

**Problema**: Captura scroll de contenedores internos.

**Fix**: Comparar `window.scrollY` antes/después del evento. Si no cambió, no cerrar.

**Código exacto** (`src/components/ui/LyriumSelect.tsx`):

```tsx
  // ANTES (bug):
  useEffect(() => {
    if (!open) return;
    const close = () => { setOpen(false); setSearch(''); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  // DESPUÉS (fix):
  useEffect(() => {
    if (!open) return;
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      if (window.scrollY !== lastScrollY) {
        setOpen(false);
        setSearch('');
      }
      lastScrollY = window.scrollY;
    };
    const onResize = () => { setOpen(false); setSearch(''); };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);
```

### F2: Posicionamiento (líneas 103-128)

**Problema**: Doble cálculo (1 síncrono con altura 0 + 1 RAF).

**Fix**: Solo RAF, una vez que el dropdown está pintado con altura real.

```tsx
  // ANTES (doble cálculo):
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = containerRef.current;
    if (!trigger) return;
    const updatePosition = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current?.offsetHeight ?? 0;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const flip = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      setOpenUpward(flip);
      setCoords({
        top: flip ? triggerRect.top - dropdownHeight - 6 : triggerRect.bottom + 6,
        left: triggerRect.left,
        width: triggerRect.width,
      });
    };
    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(raf);
  }, [open, filteredOptions.length, searchable]);

  // DESPUÉS (solo RAF):
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = containerRef.current;
    if (!trigger) return;
    const raf = requestAnimationFrame(() => {
      const triggerRect = trigger.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current?.offsetHeight ?? 0;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const flip = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      setOpenUpward(flip);
      setCoords({
        top: flip ? triggerRect.top - dropdownHeight - 6 : triggerRect.bottom + 6,
        left: triggerRect.left,
        width: triggerRect.width,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [open, filteredOptions.length, searchable]);
```

### Verificación

```bash
cd Frontend-Lyrium/frontapp
npm run build
npm run lint
```

**Prueba manual**:
1. Vendedor: Abrir BranchModal → "Departamento" dropdown → mover cursor a opciones → debe quedarse abierto
2. Cliente: Abrir modal "Nueva Dirección" → "Departamento" dropdown → mover cursor a opciones → debe quedarse abierto
3. Chat: Abrir "Nuevo Chat" en vendedor y cliente → dropdown Vendedor → debe quedarse abierto
4. Filtros inline: Scroll de página real → dropdown debe cerrarse (regresión controlada)

---

## 6. Resumen

| Métrica | Vendedor | Cliente |
|---------|----------|---------|
| Componente | `LyriumSelect` | `LyriumSelect` |
| Total selects | 30 | 14 |
| En modales (ALTO RIESGO) | 8 selects / 7 modales | 4 selects / 1 modal |
| En scroll container (ALTO RIESGO) | 3 (chat inline) | 2 (chat inline) |
| Sin riesgo (filtros/formularios inline) | 19 | 8 |
| **Afectados por el bug P1** | **11** | **6** |
| **Archivo a modificar** | **`src/components/ui/LyriumSelect.tsx`** | **Mismo** |
| Archivos por sección a tocar | **0** | **0** |

El fix es transversal: modificar `LyriumSelect.tsx` con los dos cambios quirúrgicos descritos arriba. No se necesita tocar ningún archivo de ninguna sección. El bug existe y se manifiesta igual en ambas secciones porque comparten el mismo componente.
