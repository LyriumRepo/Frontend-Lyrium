# Tarea: Fix scroll listener en LyriumSelect + posicionamiento

## Problema

El dropdown de `LyriumSelect` se cierra solo al mover el cursor desde el botón trigger hacia la lista de opciones cuando está dentro de un modal con scroll (`overflow-y-auto`). Afecta a BranchModal, AddCityModal, SpecialistModal, ServiceConfigModal y todos los selects en modales del seller/customer/admin.

## Causa raíz

Dos bugs en `src/components/ui/LyriumSelect.tsx`:

**Bug 1 — Scroll listener (líneas 135-144)**: `window.addEventListener('scroll', close, true)` con `capture: true` captura eventos `scroll` de **cualquier elemento** del documento, incluyendo scroll containers internos como el `overflow-y-auto` del modal. Cuando el dropdown se abre, se forza un re-layout (via `getBoundingClientRect`) que puede emitir un scroll espurio, cerrando el dropdown.

**Bug 2 — Doble updatePosition (líneas 103-128)**: `updatePosition()` se ejecuta 1 vez síncrono + 1 vez en `requestAnimationFrame`. La primera ejecución usa `dropdownHeight=0` porque el dropdown aún no está pintado, lo que puede decidir incorrectamente si abrir hacia arriba o abajo. Luego en el RAF se corrige, pero el salto visual es antiestético.

## Fix (solo 1 archivo: `src/components/ui/LyriumSelect.tsx`)

### Fix 1: Scroll listener (líneas 135-144)

**ANTES:**
```tsx
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
```

**DESPUÉS:**
```tsx
  useEffect(() => {
    if (!open) return;
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      if (window.scrollY !== lastScrollY) {
        setOpen(false);
        setSearch('');
      }
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

**Qué cambia**: Ahora solo cierra el dropdown cuando el `window.scrollY` cambia (scroll real del viewport). Scrolls de contenedores internos (modales con overflow-y-auto, paneles con scrollbars internos, etc.) no cambian `window.scrollY` y por tanto ya no cierran el dropdown falsamente.

### Fix 2: Posicionamiento (líneas 103-128)

**ANTES:**
```tsx
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
```

**DESPUÉS:**
```tsx
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

**Qué cambia**: Se elimina `updatePosition()` síncrono y solo se ejecuta en RAF, una vez que el dropdown ya está pintado con su altura real. La decisión de `flip` ahora se toma con el `offsetHeight` real, no con 0. Se evita un re-layout forzado innecesario.

## Verificación

```bash
npm run build
npm run lint
```

**Prueba manual**: Abrir BranchModal → click en "Departamento" dropdown → mover cursor hacia las opciones → debe permanecer abierto y permitir seleccionar. Repetir con AddCityModal, SpecialistModal.

**Regresión**: Verificar que en filtros inline (reservas, inventario, chat sidebar) el dropdown sigue funcionando y se cierra si se hace scroll real de página.

## Notas

- No rompe diseño porque solo se cambia lógica de eventos y timing, no estilos ni markup.
- No rompe superposiciones (z-index) porque no se toca el portal, el `position: fixed`, ni el z-index.
- No tocar ningún otro archivo. Solo este fix resuelve el bug para TODOS los selects del proyecto.
