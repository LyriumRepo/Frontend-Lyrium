# Tareas de Responsive Móvil — Lyrium Frontend

Lista de observaciones de **vista móvil** para corregir. Las correcciones las hará otro
miembro del equipo; aquí está el problema, el resultado esperado y los archivos exactos.

> **Instrucciones para el agente que ejecutará estas tareas**
> - Lee cada tarea completa (archivo, líneas, contexto y referencias) antes de modificar.
> - **NO uses el navegador ni DevTools para verificar.** La revisión visual en móvil
>   (y en modo día/noche) la hace quien te pasó este archivo. Trabaja solo con el código
>   y razona sobre las clases CSS.
> - **Meta visual:** textos legibles y proporcionados en pantalla de teléfono, nada
>   sobredimensionado, cortado ni desalineado; coherencia con las referencias citadas
>   (cabeceras del seller, botones de Configuración).
> - No toques lógica de negocio, estado (Zustand) ni backend (Laravel).

> **Reglas generales para quien corrija**
> - Solo afecta **vista móvil** (ancho hasta `sm`/`md` según el caso). **NO** cambiar el diseño desktop.
> - Usar breakpoints ya existentes (`min-[360px]:`, `sm:`, `md:`) para que el cambio solo aplique en móvil.
> - Preservar **modo día y modo noche** (clase `.dark` en `<html>`, gestionada por `next-themes`; variables `var(--bg-*)`, `var(--text-*)`, etc.).
> - Al terminar, correr `npm run lint` y `npx tsc --noEmit` en `Frontend-Lyrium/frontapp`.
> - Los valores citados vienen de inspección del código fuente; la verificación visual en browser queda fuera del alcance del agente.

---

## 1. Home — `http://localhost:3000/`

### 1.1 “Nuestras marcas” — fondo azul en modo noche (debe ser verde)

**Problema:** la franja del carrusel de marcas muestra un fondo gris azulado en modo
noche en vez del verde oscuro del resto de la página. En modo día se ve bien.

**Esperado:** que el fondo del carrusel en modo noche use el mismo verde del tema
(`var(--bg-card)` = `#1e3028`), como el resto de tarjetas de la home.

**Archivos / líneas:**
- `src/components/home/BrandsCarousel.tsx`
  - Línea 84: `... bg-white dark:bg-gray-900` (contenedor del carrusel).
  - Línea 104: `... bg-white dark:bg-gray-900 w-full` (celda de cada marca).

**Contexto:** `dark:bg-gray-900` es `#111827` (gris con tinte azul) y por eso se ve
“azul”. Cambiar a `dark:bg-[var(--bg-card)]` (o el verde del tema) en las dos líneas.
Verificar que en modo día siga blanco (`bg-white`) y que el divisor de columnas
(`divide-gray-800 dark:divide-gray-200`, línea 91) se mantenga legible.

---

### 1.2 Precios de “Las mejores ofertas de servicios / productos” y “Productos nuevos” — color

**Problema:** el precio de las tarjetas de ofertas sale celeste en ambos modos.
- Modo día: `rgb(105,190,235)` = `#69beeb` (`--celeste-500`).
- Modo noche: `rgb(90,175,230)` = `#5aafe6` (`--azulCeleste-500`).

**Esperado:**
- Modo día → texto **negro**.
- Modo noche → texto **blanco**.

**Archivos / líneas:**
- `src/components/home/OffersSection.tsx`
  - Línea 124 (componente `OfferCard`, usado por los 3 bloques de ofertas):
    `text-[12px] min-[360px]:text-[13px] sm:text-[17px] font-extrabold text-[var(--celeste-500)] dark:text-[var(--azulCeleste-500)]`

**Contexto:** cambiar las clases de color del `<p>` del precio:
`text-slate-900 dark:text-white` (como el título, línea 123) o un equivalente.
Aplicar solo a este elemento; **no** cambiar el `text-[var(--celeste-500)]` del badge
de tag (línea 58) ni la barra de acciones (línea 70), que sí usan celeste a propósito.

---

### 1.3 Tarjetas de “Digestión saludable / Belleza / Servicios médicos / Medicina natural” — línea/indicador morado

**Problema:** esas 4 secciones (componente `MarketplaceSection`) tienen un indicador de
paginación **morado** (`#4a3aff`) y el borde de las tarjetas no coincide con las tarjetas
superiores de la home.

**Esperado:** unificar con el estilo de las tarjetas superiores (celeste/sky, sin morado)
en modo día y noche.

**Archivos / líneas:**
- `src/components/home/DigestionSaludableSection.tsx`
  - Línea 133: punto activo de paginación `bg-[#4a3aff]` (morado) → usar `var(--celeste-500)` (o sky) coherente con la home.
  - Línea 89: borde de tarjeta `border border-[var(--turquesa-100)] dark:border-transparent` → alinear con `ServicesGrid.tsx` línea 123 (`border border-[var(--turquesa-100)] dark:border-[var(--border-subtle)]`).
  - Líneas 186–211: instancias de `<MarketplaceSection>` (Digestión, Belleza, Servicios médicos, Medicina natural).

**Contexto:** comparar contra `src/components/home/ServicesGrid.tsx` (las “tarjetas
superiores”) que usan `bg-white dark:bg-[var(--bg-card)]` + `border-[var(--turquesa-100)] dark:border-[var(--border-subtle)]`. El fondo oscuro `dark:bg-[#1E3028]` de estas tarjetas ya es el verde correcto; solo falta el indicador/borde.

---

## 2. Login / “Registrar tu tienda” — `http://localhost:3000/login` y `?mode=vendor`

### 2.1 Banner con flor de arriba no encaja bien en móvil

**Problema:** en móvil el banner/intro de la portada de login y registro (imagen con
flor) no se ve bien; no calza igual que en `/contactanos`.

**Esperado:** que se vea tan bien como el intro de `http://localhost:3000/contactanos`
(usar ese layout como referencia).

**Archivos / líneas:**
- `src/features/auth/components/AuthContainer.tsx`
  - Líneas 92–104: `IntroCover` de login/registro (fondo `/img/intro/contactanos.jpg`).
  - Líneas 113–130: “Mobile Header” con la flor (`/img/intro/Flor6.png` posicionada `-bottom-10 -right-20 w-[300px]`).
  - Línea 139: flor del panel izquierdo desktop (no tocar si desktop se ve bien).
- `src/components/ui/IntroCover.tsx` (overlay compartido, líneas 51–97: título `text-4xl`, subtítulo `text-lg`, paddings `px-6`, `max-w-lg`).
- `src/app/(public)/contactanos/page.tsx` (líneas 72–85: uso de referencia del mismo `IntroCover`).
- `src/app/(public)/login/page.tsx` (solo `reason`, el `?mode=vendor` lo lee `UserTypeToggle.tsx` líneas 11–15).

**Contexto:** ambos usan el mismo `IntroCover`; revisar en viewport chico (~320–390px)
si el título/subtítulo se desbordan o el fondo se recorta mal. Ajustes **mobile-only**
de tipografía (`text-2xl/3xl` en móvil), padding y posición de la flor. No romper el
desktop.

---

## 3. Páginas legales / manual (negritas y títulos muy grandes en móvil)

El contenido se renderiza con `dangerouslySetInnerHTML` desde constantes de
`src/shared/lib/constants/` (HTML con `<strong>`, `<h4 class="text-lg font-bold …">`,
`<p class="font-bold …">`). `sanitizeHtml` (`src/shared/lib/sanitize.ts`) conserva
h1–h6, `<strong>` y **no** elimina clases, así que los tamaños vienen de las clases
dentro del HTML de cada archivo de constantes.

### 3.1 Políticas de privacidad

**Problema:** párrafos y negritas del contenido salen a **18px** (`text-lg`) en móvil.

**Esperado:** tipografía más pequeña en móvil (p. ej. `text-sm`/`text-base`), igual de
legible, sin cambiar desktop.

**Archivos / líneas:**
- `src/app/(public)/politicasdeprivacidad/page.tsx`
  - Línea 153: `<p className="text-justify text-gray-600 text-lg …">` (párrafos del cuerpo).
  - Línea 91: párrafo introductorio `text-lg`.
  - Líneas 142 / 161: encabezados `text-2xl`/`font-bold` (revisar en móvil).

**Evidencia (390px):** párrafo introductorio `18px`, `<strong>` `18px`, primer párrafo
del cuerpo `18px`.

### 3.2 Términos y condiciones (Cliente y Vendedor)

**Problema:** las negritas del contenido salen demasiado grandes en móvil (heredan
16px `text-[16px]` del contenedor, en `font-bold`).

**Esperado:** reducir el tamaño de negritas/títulos del contenido solo en móvil.

**Archivos / líneas:**
- `src/app/(public)/terminoscondiciones/page.tsx`
  - Línea 254: contenedor del contenido `text-justify text-gray-600 text-[16px] … terms-content` (con `dangerouslySetInnerHTML`).
- `src/shared/lib/constants/termsData.ts` — 72 `<strong>` dentro del HTML (los `<strong>` heredan el tamaño del contenedor).

**Contexto:** opción 1: bajar el tamaño del contenedor en móvil (ej. `text-sm` hasta `sm:`). Opción 2: agregar regla CSS mobile-only para `.terms-content strong` (p. ej. dentro del `<style>` ya existente en la página, líneas 117–148, o en `globals.css`). Respetar el modo vendedor (`#vendedor`) igual que el de cliente.

**Evidencia (390px):** contenedor `.terms-content` = `16px`; los `<strong>` heredan 16px en `font-bold`.

### 3.3 Manual de empaquetado

**Problema:** los títulos `h4` del contenido salen a **18px** (`text-lg`) y las negritas a 16px en móvil.

**Esperado:** reducir en móvil (títulos y negritas), sin tocar desktop.

**Archivos / líneas:**
- `src/app/(public)/manual-empaquetado/page.tsx`
  - Línea 234: contenedor `text-justify text-gray-600 text-[16px] … terms-content`.
- `src/shared/lib/constants/manualData.ts`
  - Líneas 8, 11, 13: `<h4 class="text-lg font-bold text-[#333333] mb-2">` → en móvil conviene `text-sm`/`text-base`.
  - Otras decenas de `<h4 class="text-base font-bold …">` y `<p class="font-bold …">`.

**Contexto:** el HTML está en el archivo de constantes; si se edita ahí, el cambio aplica
a desktop también. Preferir **CSS mobile-only** (regla para `.terms-content h4` / `strong`
bajo `@media (max-width: 640px)` en `globals.css` o en el `<style>` de la página) para no
alterar el desktop. Verificar tablas (`overflow-x-auto`) siguen scrolleando bien.

**Evidencia (390px):** `<h4>` del contenido = `18px` (`class="text-lg font-bold text-[#333333] mb-2"`), contenedor = `16px`.

---

## 4. Checkout — `http://localhost:3000/checkout` (labels/cajas muy grandes en móvil)

**Problema:** títulos, labels y cajas del flujo de compra se ven sobredimensionados en
móvil (header “Carrito de compras”, “Revisa tus productos”, “Cálculo de Cajas”, “Resumen”,
“Método de pago”, etc.).

**Esperado:** tamaños proporcionados para pantalla de teléfono (tipografía y paddings
más compactos **solo en móvil**); desktop sin cambios.

**Archivos / líneas:**
- `src/features/public/checkout/components/CheckoutHeader.tsx`
  - Línea 36: `<h3 className="text-xl md:text-2xl font-black …">` (título del paso, hoy 20px en móvil).
  - Línea 39: descripción `text-[10px] md:text-xs …` (revisar jerarquía).
  - Líneas 6–12: textos “Carrito de compras / Revisa tus productos”, “Empaque / Revisa el empaque calculado”, etc.
- `src/features/public/checkout/components/CheckoutStepBar.tsx`
  - Línea 104: círculos `w-9 h-9 text-sm sm:w-14 sm:h-14 sm:text-lg` (revisar compactación móvil, hoy ya usa tamaño menor en móvil — verificar visual).
- `src/features/public/checkout/components/step1/CartSummary.tsx`
  - Línea 74: título “Resumen” `font-bold … flex items-center gap-2`.
  - Línea 108: “Total estimado” `font-bold text-base`; línea 110 total `text-lg`.
- `src/features/public/checkout/components/step1/CartItemList.tsx`
  - Líneas 133–227: filas de producto `p-4`, imagen `w-20 h-20`, precio `text-base` (línea 182). Revisar compactación en móvil.
- `src/features/public/checkout/components/step2/BoxCalculatorStep.tsx`
  - Línea 242: `<h2 className="text-lg font-black …">📦 Cálculo de Cajas</h2>`.
  - Línea 262: cifras grandes de la tarjeta (`font-black text-xl`).
  - Líneas 239–266: tarjeta de resumen `p-5` y grid `grid-cols-3` (revisar que no se apriete).
- `src/features/public/checkout/components/step2/PackagingSummary.tsx`
  - Línea 97: subtotal total `font-black text-lg`.
  - Línea 36–39: cabecera “Resumen de empaque”.
- `src/features/public/checkout/components/step3/BillingInfo.tsx`
  - Línea 19: `<h2>Método de pago` (`font-bold`, badge `w-7 h-7`).
  - Línea 49: `grid grid-cols-2 gap-2` de métodos (revisar textos `text-xs` legibles).
- `src/features/public/checkout/components/CheckoutPage.tsx` (líneas 118–181: contenedores `max-w-6xl`, padding `px-4 pt-6 pb-8`).

**Evidencia (390px):** header del paso 1: título “Carrito de compras” = `20px`, descripción
= `10px`.

**Contexto:** no cambiar la lógica de pasos ni el estado (`useCheckoutStore`). El carrito
viene de la API (repo `cartRepository`/`serviRepository`); no tocar. Los ajustes deben ser
solo de clases (tipografía/padding/márgenes) con prefijo `sm:`/`md:` para dejar desktop
intacto. Revisar también en modo noche.

---

## 5. Panel de Cliente — `http://localhost:3000/customer/*`

Ajustes **solo en vista móvil** (hasta `sm`/`md`). No cambiar desktop ni lógica de negocio.

> **Referencias de diseño (verificadas en el código, no en browser):**
> - **Altura de cabeceras:** perfil del vendedor `src/features/seller/profile/ProfilePageClient.tsx` línea 239
>   `cardHeaderCls = "bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-4 sm:p-6 flex items-center justify-between relative"`,
>   con ícono `w-10 h-10 sm:w-12 sm:h-12`, título `text-base sm:text-xl` (líneas 277–296).
>   Esa altura es la **perfecta** para replicar en Mi Perfil, Seguridad y Confirmaciones.
> - **Botones:** el "Guardar Cambios" de `src/app/customer/settings/page.tsx` (líneas 94–116):
>   contenedor `flex flex-col sm:flex-row gap-3 w-full sm:w-auto mx-auto md:mx-0 md:ml-auto sm:justify-end`
>   + `<BaseButton fullWidth className="sm:w-auto">`. En móvil va **de punta a punta**, en desktop auto-ajustado a la derecha.
>   Ese estilo es el preferido para Direcciones, Envío y Mi Perfil.
> - Respetar modo día/noche (clases `dark:*` y variables `var(--bg-*)`, `var(--text-*)`).
> - Los valores citados vienen de inspección del código fuente; el agente debe verificarlos en el browser (390×844, día y noche) antes de cerrar cada tarea.

---

### 5.1 Mi Perfil — `src/app/customer/profile/page.tsx`

**Problema:** el botón "Editar Información" sale muy grande en móvil y el banner de
cabecera de la card (con los datos del usuario) ocupa demasiada altura en pantalla chica.

**Esperado:** botón con el patrón de Configuración (de punta a punta en móvil, auto a la
derecha en desktop) y cabecera con la altura del seller (`p-4 sm:p-6`).

**Archivos / líneas:**
- Botón "Editar Información":
  - Línea 504: `<div className="flex justify-center md:justify-end">` → reemplazar por el contenedor
    de Settings: `flex flex-col sm:flex-row gap-3 w-full sm:w-auto mx-auto md:mx-0 md:ml-auto sm:justify-end`.
  - Líneas 505–513: `<BaseButton size="md" …>` → agregar `fullWidth` y `className="sm:w-auto"`
    (tamaño a convenir, `lg` como en Settings, o conservar `md` pero con `fullWidth` en móvil).
- Cabecera "Información Personal" (banner azul):
  - Línea 518: `p-8` → `p-4 sm:p-6 md:p-8`.
  - Línea 520: ícono `w-12 h-12` → `w-10 h-10 sm:w-12 sm:h-12` (y `w-6 h-6` → `w-5 h-5 sm:w-6 sm:h-6`).
  - Línea 524: título `text-2xl` → `text-base sm:text-xl md:text-2xl` (mantener `font-black tracking-tighter`).
- Cabecera "Foto de Perfil" (mismo patrón):
  - Línea 745: `p-8` → `p-4 sm:p-6 md:p-8`.
  - Líneas 747 / 751: ícono y título con los mismos ajustes móviles.

**Contexto:** ambas cabeceras (líneas 518 y 745) son visualmente idénticas al patrón del
seller; replicar `cardHeaderCls` en móvil. No tocar la lógica del formulario ni
`inputClassName` (línea 454), ni el progreso "Perfil completo" (línea 475).

---

### 5.2 Mis Pedidos — negrita de "Filtros de Búsqueda" — `src/app/customer/orders/page.tsx`

**Problema:** el título "Filtros de Búsqueda" usa `font-black`, demasiado fuerte en móvil.

**Esperado:** reducir la tonalidad del peso (no el tamaño): `font-bold` en móvil, `font-black`
solo en desktop.

**Archivos / líneas:**
- Línea 1064: `<h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">Filtros de Búsqueda</h3>`
  → `text-xl font-bold md:font-black …` (dejar `text-xl` igual; solo cambiar el peso).

**Contexto:** no tocar la card de filtros (líneas 1058–1134), los selects ni el botón
"Leyenda" (línea 1072). Solo el `<h3>`. (La cabecera "Mis Pedidos" del listado, línea 1144,
es texto blanco sobre gradiente y no es parte de esta observación.)

---

### 5.3 Seguridad — cabeceras muy altas — `src/app/customer/security/page.tsx`

**Problema:** la cabecera de la card principal ("Protección de Cuenta" / "Centro de
Seguridad Avanzada") sale demasiado alta en móvil.

**Esperado:** altura igual a la del seller (`p-4 sm:p-6`), ícono y tipografía
proporcionados en móvil.

**Archivos / líneas:**
- Línea 44: `p-8` → `p-4 sm:p-6 md:p-8`.
- Línea 47: ícono `w-12 h-12` → `w-10 h-10 sm:w-12 sm:h-12` (y `w-6 h-6` → `w-5 h-5 sm:w-6 sm:h-6`).
- Línea 51: `<h3 className="text-2xl font-black tracking-tighter">` → `text-base sm:text-xl md:text-2xl …`.
- (Opcional, por consistencia) cabecera "Consejos de Seguridad" (líneas 82–94): mismo ajuste
  si se ve grande en móvil.

**Contexto:** el formulario es el componente `ChangePasswordForm` (`src/features/auth/change-password`),
compartido con otros roles → no tocarlo. Solo las cabeceras de esta página. La sección
"Gestión de Contraseña" (líneas 62–69) tiene `p-6`: reducir a `p-4 sm:p-6` si se ve alta.

---

### 5.4 Confirmaciones de Pago — solo bajar negrita — `src/features/customer/invoices/InvoicesPageClient.tsx`

**Problema:** el título "Filtrar por fecha" sale con `font-black`, demasiado fuerte en móvil.

**Esperado:** reducir el peso de negrita (no el tamaño). **Mantener el filtro por fecha** tal cual.

**Archivos / líneas:**
- Línea 118: `<h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">Filtrar por fecha</h3>`
  → `text-xl font-bold md:font-black …`.
- Opcional, si se ve pesado en móvil: el resto de `font-black` de la lista
  (línea 159 "N confirmaciones", línea 231 `orderNumber` móvil, línea 239 total móvil)
  → `font-bold md:font-black`.

**Contexto:** NO eliminar el bloque "Filtrar por fecha" (líneas 112–137) ni los dos
`BaseDatePicker` (líneas 123–134). Solo ajustar peso de tipografía.

---

### 5.5 Direcciones — botón demasiado ancho/estirado — `src/app/customer/addresses/page.tsx`

**Problema:** el botón "Agregar Dirección" se ve demasiado ancho/estirado en móvil.

**Esperado:** patrón de Configuración — de punta a punta en móvil y auto-ajustado a la
derecha en desktop.

**Archivos / líneas:**
- Línea 180: `<div className="flex justify-center md:justify-end">` → contenedor de Settings
  `flex flex-col sm:flex-row gap-3 w-full sm:w-auto mx-auto md:mx-0 md:ml-auto sm:justify-end`.
- Líneas 181–188: `<BaseButton … size="md">` → agregar `fullWidth` + `className="sm:w-auto"`.

**Contexto:** no tocar el grid de tarjetas (línea 198), el botón dashed "Nueva Dirección"
(líneas 270–283) ni el modal (líneas 286–491). Solo el botón de acción superior.

---

### 5.6 Chats con Vendedores — membrete en blanco en móvil — `src/components/layout/customer/CustomerModuleHeader.tsx`

**Problema:** en móvil el header del chat ("Chat con Vendedores") se ve blanco; el color
del gradiente no aparece.

**Causa raíz (por código):** `CustomerModuleHeader` divide el header en dos bloques en
móvil: Bloque 1 blanco full-width con el título (líneas 61–94) y Bloque 2 con el gradiente
solo si hay `actions`/`children` (líneas 100–115, `hasActions`). El Chat
(`src/features/customer/chat/ChatPageClient.tsx`, líneas 350–354 y 364–368) no pasa
`actions` ni `children`, así que el bloque del gradiente nunca se renderiza y el bloque
blanco (en modo día) cubre todo → el membrete se ve blanco.

**Esperado:** en móvil, cuando **no hay acciones**, el título debe verse sobre el gradiente
(como el `ModuleHeader` compartido de Mi Perfil/Pedidos): el bloque blanco no debe cubrir
todo el ancho.

**Archivos / líneas:**
- `src/components/layout/customer/CustomerModuleHeader.tsx`, líneas 61–70: el bloque blanco
  usa `w-full md:w-fit md:flex-none`. Cambiar a algo como
  `${hasActions ? 'w-full' : 'w-fit max-w-[70%]'} md:w-fit md:flex-none`
  (mirror del `ModuleHeader` compartido, que usa `w-fit max-w-[70%]` en su bloque izquierdo).
  Con eso el gradiente del outer queda visible a la derecha del título en móvil.
- Verificar que en desktop (≥ md) el layout siga idéntico y que el `shrink-0` del outer
  (líneas 43–50) se conserve (evita el corte en el layout `h-[calc(100dvh-108px)]` del chat).

**Contexto:** NO cambiar `ChatPageClient.tsx` ni el `CustomerChatLayout`. El fix es
exclusivamente del componente de header. Probar con un chat abierto y sin seleccionar,
en móvil, modo día y noche (en noche ya se ve verde por `dark:bg-[var(--bg-card)]`, pero
verificar igual). Si al dejar el bloque `w-fit` el corte blanco se ve "plano" por la
ausencia de `lateral-gradient-mask` en móvil, aplicar también `lateral-gradient-mask` en
móvil cuando no haya acciones (mismo tratamiento que en `md:` de la línea 64).

---

## 6. Panel de Vendedor — `http://localhost:3000/seller/*`

Ajustes **solo en vista móvil** (hasta `sm`/`md`). No cambiar desktop ni lógica de negocio.

> **Referencias de diseño (verificadas en el código, no en browser):**
> - **Botones (punta a punta en móvil):** patrón de `src/app/customer/settings/page.tsx` líneas 94–116:
>   contenedor `flex flex-col sm:flex-row gap-3 w-full sm:w-auto mx-auto md:mx-0 md:ml-auto sm:justify-end`
>   + `<BaseButton fullWidth className="sm:w-auto">`. En móvil va **de punta a punta**, en desktop auto-ajustado a la derecha.
> - **Altura de cabeceras:** perfil del vendedor `src/features/seller/profile/ProfilePageClient.tsx` línea 239
>   `cardHeaderCls = "bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-4 sm:p-6 …"`,
>   con ícono `w-10 h-10 sm:w-12 sm:h-12` y título `text-base sm:text-xl` (líneas 277–296). Esa es la altura **perfecta** a replicar.
> - Respetar modo día/noche (clases `dark:*` y variables `var(--bg-*)`, `var(--text-*)`).
> - Los valores citados vienen de inspección del código fuente; el agente debe verificarlos en el browser (390×844, día y noche) antes de cerrar cada tarea.

---

### 6.1 Mi Perfil — botón "Editar Información" y negrita de las 3 cards — `src/features/seller/profile/ProfilePageClient.tsx`

**Problema:** el botón "Editar Información" sale muy grande en móvil (no usa la distribución
de Configuración: punta a punta). Los títulos de las 3 cards ("Datos Empresariales", "Admin
del Panel", "Finanzas") usan `font-black`, demasiado fuerte en móvil.

**Esperado:** botón con el patrón de Configuración (punta a punta en móvil, auto a la derecha
en desktop) y títulos de las 3 cards en `font-bold` (solo el peso, no el tamaño).

**Archivos / líneas:**
- Botón (reutilizado móvil + desktop, `editBtn`):
  - Líneas 220–230: `<BaseButton variant="action" size="md" …>Editar Información</BaseButton>`
    → agregar `fullWidth` + `className="sm:w-auto"` (tamaño `lg` como Settings o conservar `md` con `fullWidth`).
  - Línea 268: `<div className="flex justify-center sm:justify-end">{editBtn}</div>` → contenedor de Settings
    `flex flex-col sm:flex-row gap-3 w-full sm:w-auto mx-auto md:mx-0 md:ml-auto sm:justify-end`.
- Títulos de cards (`font-black` → `font-bold md:font-black`):
  - Línea 283–284: `<h3 className="text-base sm:text-xl font-black …">Datos Empresariales</h3>`.
  - Línea 486: `<h3 className="text-base sm:text-lg font-black …">Admin del Panel</h3>`.
  - Línea 588: `<h3 className="text-base sm:text-xl font-black …">Finanzas</h3>`.

**Contexto:** las cabeceras de las 3 cards ya usan `cardHeaderCls` (`p-4 sm:p-6`, líneas 237–239),
esa altura es la correcta — NO tocar. Solo el botón (línea 268) y los `font-black` de los títulos.
No tocar el formulario (línea 272+), `fieldCls` (línea 210) ni los avisos de `profileRequest` (líneas 252–266).

---

### 6.2 Seguridad — cabecera "Protección de Cuenta" muy alta — `src/app/seller/security/page.tsx`

**Problema:** la cabecera de la card principal sale demasiado alta/grande en móvil
(`p-8`, título `text-2xl`).

**Esperado:** altura y tipografía iguales a "Mis datos" del perfil (`p-4 sm:p-6`,
título `text-base sm:text-xl`, ícono proporcionado).

**Archivos / líneas:**
- Línea 45: header gradiente `p-8` → `p-4 sm:p-6 md:p-8`.
- Línea 48: ícono `w-12 h-12` → `w-10 h-10 sm:w-12 sm:h-12` (y su ícono interno `w-6 h-6` → `w-5 h-5 sm:w-6 sm:h-6`).
- Línea 52: `<h3 className="text-2xl font-black tracking-tighter">Protección de Cuenta</h3>`
  → `text-base sm:text-xl md:text-2xl …` (mantener `font-black tracking-tighter`).

**Contexto:** mismo patrón que la tarea 5.3 (Seguridad del cliente). El formulario es
`ChangePasswordForm` (`src/features/auth/change-password`), compartido con otros roles → NO tocar.
La franja "Gestión de Contraseña" (líneas 62–69) tiene `p-6`: reducir a `p-4 sm:p-6` si se ve alta.

---

### 6.3 Mi Tienda — botón "Guardar Cambios" y títulos de secciones — `src/features/seller/store/StorePageClient.tsx` + `components/`

**Problema:** el botón "Guardar Cambios" sale muy grande en móvil (no usa el patrón punta a punta)
y los títulos de varias secciones usan `font-black text-xl sm:text-2xl`, demasiado fuerte en móvil.

**Esperado:** botón con patrón de Configuración; títulos en `font-bold` en móvil (peso, no tamaño).

**Archivos / líneas:**
- Botón "Guardar Cambios":
  - `StorePageClient.tsx` líneas 92–102 (`saveButton`, `size="lg"`) → agregar `fullWidth` + `className="sm:w-auto"`.
  - Líneas 111–113: `<div className="flex justify-center sm:justify-end">{saveButton}</div>` → contenedor de Settings.
- Títulos a bajar de `font-black` → `font-bold md:font-black` (todas usan `h3 text-xl sm:text-2xl font-black tracking-tighter leading-none`):
  - `components/BranchManagement.tsx:79` — "Sucursales" (+ subtítulo línea 81 "Gestión de tus locales físicos y puntos de venta").
  - `components/StoreIdentity.tsx:25` — "Sobre Nosotros".
  - `components/LayoutSelector.tsx:257` — "Personalización Visual".
  - `components/VisualIdentity.tsx:302` — "Estudio de Identidad".
  - `components/Policies.tsx:121` — "Políticas y Términos".
  - `components/StoreAwards.tsx:66` — "Estatus de Socio Lyrium".
- "Información de Contacto" (`components/ContactSocial.tsx:37`) está **bien** → NO tocar.

**Contexto:** no tocar la lógica de guardado (`handleSave`, líneas 88–101), los modales
(`BranchModal.tsx` etc.) ni los componentes de identidad. Solo peso de tipografía y el botón.

---

### 6.4 Servicios — botones "Nuevo Servicio" y "Especialista" muy grandes — `src/features/seller/services/ServicesPageClient.tsx`

**Problema:** los dos botones de acción del header salen grandes en móvil y aprietan el layout.

**Esperado:** botones más compactos en móvil (`size="sm"` o padding reducido), título visible.

**Archivos / líneas:**
- Líneas 162–191 (`primaryActions`):
  - Línea 163: contenedor `grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-center sm:justify-end`.
  - Líneas 164–176: `<BaseButton variant="action" size="md" …>Nuevo Servicio</BaseButton>`.
  - Líneas 177–189: `<BaseButton variant="action" size="md" …>Especialista</BaseButton>`.
  → cambiar `size="md"` → `size="sm"` (o clase que reduzca el padding solo en móvil).

**Contexto:** los estados de límite (`atServiceLimit`/`atSpecialistLimit`) y los modales
(`ServiceConfigModal`, `SpecialistModal`) NO se tocan. Solo el tamaño de los botones.

---

### 6.5 Reservas — header y negritas de "Filtros de Reservas" — `src/app/seller/reservas/page.tsx`

**Problema:** la card de filtros tiene header grande (ícono `w-12 h-12`, título `text-xl font-black`)
y varias negritas fuertes en las cards móviles.

**Esperado:** header compacto (`p-4 sm:p-6 md:p-8`, título `text-lg font-bold` en móvil) y
distribución de bold más suave en móvil.

**Archivos / líneas:**
- Línea 276: contenedor de filtros `p-6 sm:p-8` → `p-4 sm:p-6 md:p-8`.
- Línea 281: ícono `w-12 h-12` → `w-10 h-10 sm:w-12 sm:h-12`.
- Líneas 284–286: `<h3 className="text-xl font-black …">Filtros de Reservas</h3>`
  → `text-lg font-bold md:text-xl md:font-black …`.
- Botón "Limpiar" (líneas 288–295): revisar padding en móvil (`px-4 py-2`, texto "Limpiar" oculto en móvil — verificar que quede bien).
- Cards móviles (líneas 459–528): bajar `font-black` → `font-bold` donde aplique (p. ej. línea 514 botón "Ver").

**Contexto:** la tabla desktop (`hidden md:table`, línea 343) y la lista móvil (`block md:hidden`, línea 459)
ya existen; solo ajustar pesos/paddings. No tocar el estado de filtros (`searchQuery`, `statusFilter`)
ni `LyriumSelect` (líneas 315–327).

---

### 6.6 Finanzas — "Últimos comprobantes" distorsionados en móvil — `src/features/seller/finance/components/ComprobantesSection.tsx`

**Problema:** cada fila es `flex items-center justify-between` con el monto + badge de estado en
el lado derecho (líneas 87–93); en móvil se aprietan y la tarjeta se distorsiona.

**Esperado:** adaptar a tipo card en móvil: apilar o hacer wrap del bloque (monto + badge) para
que no se corte; desktop igual.

**Archivos / líneas:**
- Línea 72: `flex items-center justify-between p-4 …` → en móvil `flex-col items-start` con `sm:flex-row sm:items-center sm:justify-between` (o permitir wrap).
- Líneas 87–93: bloque derecho `flex items-center gap-4 flex-shrink-0` → en móvil `mt-2 w-full justify-between sm:mt-0 sm:w-auto sm:justify-end`.
- Línea 38: contenedor `p-8` → `p-4 sm:p-6 md:p-8` para que las filas respiren en móvil.

**Contexto:** solo clases del item y del contenedor. Los datos (`RecentInvoice`) y los colores/labels
de estado (`statusColors` líneas 12–18, `statusLabels` líneas 28–34) NO cambian.

---

### 6.7 Blog y Foro — botones "Nuevo …" / "Crear Tema" muy grandes — `src/features/seller/blog/*` y `src/features/seller/forum/ForumClient.tsx`

**Problema:** los botones de acción del header (`Nuevo Artículo`, `Nuevo Podcast`, `Nuevo Video`,
`Nuevo Short`, `Crear Tema`) salen grandes en móvil y el título del módulo se pierde.

**Esperado:** botones más compactos en móvil (`size="sm"` o padding reducido) para que el título
quede visible. Aplica a las 4 pestañas de blog + foro.

**Archivos / líneas:**
- `src/features/seller/blog/BlogArticlesClient.tsx:173` — `Nuevo Artículo`.
- `src/features/seller/blog/BlogPodcastsClient.tsx:183` — `Nuevo Podcast`.
- `src/features/seller/blog/BlogVideosClient.tsx:173` — `Nuevo Video`.
- `src/features/seller/blog/BlogShortsClient.tsx:166` — `Nuevo Short`.
- `src/features/seller/forum/ForumClient.tsx:191` — `Crear Tema`.
- Todos: `<BaseButton variant="action" leftIcon="Plus" size="md">` → `size="sm"`.

**Contexto:** las pestañas (Dashboard/Artículos/Podcasts/Vídeos/Shorts, `BLOG_TABS` en
`BlogDashboardClient.tsx`) y la lógica de creación NO se tocan; solo el `size` del botón dentro
de `ModuleHeader actions`. `ModuleHeader` (`src/components/layout/shared/ModuleHeader.tsx`) es
compartido → NO cambiar el componente.

---

### 6.8 Facturas — indicadores en 2×2 en móvil y tarjetas de tabla — `src/features/seller/invoices/components/InvoiceKPIs.tsx` y `InvoiceTable.tsx`

**Problema:** los 4 indicadores salen en 1 columna en móvil (desperdician espacio vertical) y las
tarjetas móviles de la tabla se ven apretadas.

**Esperado:** indicadores en **2×2** en móvil (2 columnas desde `mobile`), y mejor distribución de
la card móvil de la tabla.

**Archivos / líneas:**
- `InvoiceKPIs.tsx:50`: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
  → `grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4` (2 columnas desde móvil).
  Revisar que `BaseStatCard` (`src/components/ui/BaseStatCard.tsx`) quepa en ~180px (si la cifra
  no cabe, reducir tipografía de `value` solo en móvil).
- `InvoiceTable.tsx` (vista móvil de tarjeta, líneas ~70–160): bajar `font-black` → `font-bold`
  en móvil (series/monto/comisión: líneas 76, 97, 138, 146) y revisar wrap del bloque "Tienda"
  (líneas 114–117).

**Contexto:** los datos vienen de los KPIs (tipos `InvoiceKPIs` de `types`); no cambiar. El drawer
(`InvoiceDrawer.tsx`) no es parte de esta observación salvo que se vea mal en móvil.

---

## 7. Panel de Administrador — `http://localhost:3000/admin/*`

Ajustes **solo en vista móvil** (hasta `sm`/`md`). No cambiar desktop ni lógica de negocio.

> **Contexto transversal (leer primero):** la mayoría de los módulos admin muestran sus
> indicadores con el componente compartido `AdminIndicatorGrid`
> (`src/components/admin/AdminIndicatorGrid.tsx`). Su grid base es
> `grid grid-cols-1 sm:grid-cols-2 …` (líneas 38 y 47), así que en pantalla de teléfono
> los indicadores van en **1 sola columna**. El fix más eficiente es cambiar la base a
> **2 columnas desde móvil**: `grid grid-cols-2 sm:grid-cols-2 ${colsClass}` en esas dos
> líneas, **respetando `columns={1}`** (p. ej. BioForo) para que un único indicador siga a
> ancho completo: `columns === 1 ? 'grid-cols-1' : 'grid-cols-2'`.
> Ajustar también `BaseStatCard` (`src/components/ui/BaseStatCard.tsx`) para que el `value`
> y el label quepan en ~170px (reducir tipografía del valor solo en móvil si se corta).
> Con ese fix compartido se resuelven 7.1, 7.2, 7.4, 7.5, 7.8, 7.9 (BioBlog) y 7.10.
> Rapifac (7.6) y Finanzas (7.3) tienen grids propios y se documentan aparte.

---

### 7.1 Sellers — indicadores en 2×2 en móvil — `src/features/admin/sellers/SellersPageClient.tsx` + `src/components/admin/contracts/ContractsModule.tsx`

**Problema:** los 4 indicadores (Vendedores / Activos / En Espera / Alertas) salen en 1 columna en móvil.

**Esperado:** 2×2 en móvil.

**Archivos / líneas:**
- `src/features/admin/sellers/SellersPageClient.tsx:437-442` — `<AdminIndicatorGrid … />` (4 indicadores, sin `columns` → 4 por defecto).
- `src/components/admin/contracts/ContractsModule.tsx:74-82` — `AdminIndicatorGrid` de la sección Contratos (`columns={4}`).

**Contexto:** aplicar el fix compartido de `AdminIndicatorGrid`. No tocar `SellerList`, `ProductModeration` ni la lógica de cambio de status.

---

### 7.2 Solicitudes — indicadores en 2×2 en móvil — `src/features/admin/sellers/SellersSolicitudes.tsx`

**Problema:** los 4 indicadores (Total / Aceptados / En revisión / Rechazados) salen en 1 columna en móvil.

**Esperado:** 2×2 en móvil.

**Archivos / líneas:**
- `src/features/admin/sellers/SellersSolicitudes.tsx:155-160` — `<AdminIndicatorGrid … />`.

**Contexto:** fix compartido de `AdminIndicatorGrid`. No tocar el listado (línea 168+), el toolbar ni los filtros.

---

### 7.3 Finanzas — header "Últimos Comprobantes" y desglose financiero anivelado — `src/features/admin/finance/*`

**Problema (dos cosas):**
1. La cabecera "Últimos Comprobantes / Facturación electrónica / Ver Todos" no se distribuye bien en móvil: el título y el botón "Ver Todos" van en un `flex justify-between` y se aprietan en pantalla chica.
2. En el **desglose financiero** los 4 valores no están al mismo nivel: "IGV (18%)" queda más arriba que "Importe Venta (con IGV)", "Comisión Lyrium" y "Neto Vendedor", porque los labels envuelven a distinta altura y arrastran el valor a distinta posición.

**Esperado:** cabecera bien distribuida en móvil (que apile/haga wrap sin cortarse) y los 4 valores del desglose **alineados verticalmente al mismo nivel**.

**Archivos / líneas:**
- `src/features/admin/finance/components/ComprobantesSection.tsx`
  - Línea 39: `<div className="flex items-center justify-between mb-6">` → en móvil apilar o hacer wrap: `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3` (o `flex-wrap` con `gap-3`). El botón "Ver Todos" (líneas 49-55) debe quedar accesible sin romper el título.
  - (Las filas de comprobantes ya son `flex items-center justify-between` en línea 72; si se ven bien en 390px, no tocarlas.)
- `src/features/admin/finance/components/FinancialBreakdownCard.tsx`
  - Línea 38: `grid grid-cols-2 md:grid-cols-4 gap-4` (ya es 2×2 en móvil — correcto).
  - Línea 40: cada box `bg-[var(--bg-secondary)] p-5 rounded-2xl space-y-2`.
  - Línea 41: fila del label `flex items-center gap-2` con `text-[9px]` — el label "Importe Venta (con IGV)" envuelve a 2 líneas y baja el valor (línea 45, `text-xl`). **Fix:** dar altura mínima fija a la fila del label (p. ej. `min-h-[28px]` con `items-start leading-tight`), o hacer el box `flex flex-col` con el valor anclado abajo (`mt-auto`), de modo que los 4 valores queden al mismo nivel.

**Contexto:** los datos vienen de `FinancialBreakdown` (types) — no cambiar. Los grids `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` de `FinancePageClient.tsx` (líneas 263, 361, 391, 440, 462, 527, 549, 580) ya pasan a 2 columnas en `sm:`; si en teléfono se ven bien, NO tocarlos (algunas secciones tienen 1 sola tarjeta y no deben ir a 2 columnas). El header de "Protección de Cuenta" no existe en este módulo (es de 7.7).

---

### 7.4 Operaciones — indicadores en 2×2 en móvil — `src/features/admin/operations/OperationsPageClient.tsx`

**Problema:** los 4 indicadores (Total invertido / Pagado / Pendiente / Facturas) salen en 1 columna en móvil.

**Esperado:** 2×2 en móvil.

**Archivos / líneas:**
- `src/features/admin/operations/OperationsPageClient.tsx:601-609` — `<AdminIndicatorGrid … columns={4} />`.

**Contexto:** fix compartido. No tocar los tabs (línea 612+), ni la card de filtros (línea 625+) ni la tabla.

---

### 7.5 Pagos — indicadores en 2×2 en móvil — `src/features/admin/payments/PagosPageClient.tsx`

**Problema:** los indicadores (KPI Cards, 4) y la "Distribución por método de pago" (3) salen en 1 columna en móvil y las tarjetas se ven grandes.

**Esperado:** 2×2 en móvil (para 4 → 2 filas de 2; para 3 → el tercero queda a la izquierda) y tarjetas más compactas.

**Archivos / líneas:**
- `src/features/admin/payments/PagosPageClient.tsx:209-219` — `AdminIndicatorGrid … columns={4}` (KPI Cards).
- `src/features/admin/payments/PagosPageClient.tsx:227-235` — `AdminIndicatorGrid … columns={3}` (Distribución por método).

**Contexto:** fix compartido + compactar `BaseStatCard` en móvil (tipografía del `value`, padding) para que 2 columnas se vean proporcionadas. La card de Filtros (línea 239+) y el `AdminTable` NO se tocan.

---

### 7.6 Rapifac (Facturación Rápida) — KPIs en 2×2 y campos del desplegable ordenados — `src/features/admin/invoices/*`

**Problema (dos cosas):**
1. Los 4 KPIs (Facturado mes actual / mes anterior / Crecimiento / Monto promedio) salen en 1 columna en móvil (grid propio, no usa `AdminIndicatorGrid`).
2. En la vista móvil (acordeón expandible, `expanded`) los campos no están ordenados/alineados de forma consistente: mezcla una fila label-izquierda (Tienda) con un grid 2-col (Pedido | Emisión) y filas label-izquierda (Monto, Comisión).

**Esperado:** KPIs en 2×2 desde móvil; campos del desplegable en orden uniforme **Tienda → Pedido → Emisión → Monto → Comisión**, todos con el mismo patrón (label a la izquierda, valor a la derecha) y buena alineación.

**Archivos / líneas:**
- `src/features/admin/invoices/components/AdminInvoiceKPIs.tsx:62`
  - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6` → `grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4` (2×2 desde móvil; compactar `BaseStatCard` si el monto con formato no cabe en ~170px).
- `src/features/admin/invoices/components/AdminInvoiceTable.tsx` — `MobileInvoiceCard` (líneas 33-129):
  - Línea 79-85: fila "Tienda" (label izq / valor der).
  - Línea 87-100: grid `Pedido | Emisión` (labels arriba, valores abajo).
  - Línea 102-107: fila "Monto".
  - Línea 109-114: fila "Comisión".
  → Unificar a filas label-izquierda / valor-derecha en el orden Tienda, Pedido, Emisión, Monto, Comisión (usando los mismos `text-[9px]` de label y valores `text-xs`/`text-sm`).
- `src/features/admin/invoices/components/PlanInvoiceTable.tsx` — `MobilePlanCard` (líneas 42-127): mismo tratamiento (Tienda, Plan, Emisión, Total).

**Contexto:** los datos (`AdminInvoiceRow` / `PlanInvoiceRow`) no cambian. "Monto" es como se llama hoy el campo en la UI (no existe un campo "mundo"). El estado `expanded` de cada card se conserva. Los drawers (`AdminInvoiceDrawer.tsx`, `AdminPlanInvoiceDrawer.tsx`) no son parte de esta observación salvo que se vean mal en móvil.

---

### 7.7 Seguridad — membrete/banner perdido en móvil + cabecera "Protección de Cuenta" muy alta — `src/app/admin/security/page.tsx`

**Problema (dos cosas):**
1. El encabezado es un `<h1>` plano (líneas 62-69) sin el **membrete** (banner gradiente `ModuleHeader`) que sí tienen los demás módulos admin (p. ej. `src/app/admin/planes/page.tsx:138`); en móvil el banner se pierde por completo.
2. La cabecera de la card "Protección de Cuenta" sale muy alta en móvil (`p-8`, ícono `w-12 h-12`, título `text-2xl`).

**Esperado:** reemplazar el header plano por el `ModuleHeader` compartido (título "Seguridad", subtítulo "Protege tu cuenta y gestiona tu contraseña", icono `ShieldCheck`) para que el banner aparezca igual en desktop y móvil; y reducir la cabecera de la card al patrón `p-4 sm:p-6 md:p-8` (igual que 5.3 y 6.2).

**Archivos / líneas:**
- `src/app/admin/security/page.tsx`
  - Líneas 62-69: reemplazar el `<div>` con `<h1>Seguridad</h1>` + `<p>` por:
    `<ModuleHeader title="Seguridad" subtitle="Protege tu cuenta y gestiona tu contraseña" icon="ShieldCheck" />`
    (agregar `import ModuleHeader from '@/components/layout/shared/ModuleHeader';`).
  - Línea 76: `p-8` → `p-4 sm:p-6 md:p-8`.
  - Línea 79: ícono `w-12 h-12` → `w-10 h-10 sm:w-12 sm:h-12`.
  - Línea 80: ícono interno `w-6 h-6` → `w-5 h-5 sm:w-6 sm:h-6`.
  - Línea 83: `<h3 className="text-2xl font-black tracking-tighter">Protección de Cuenta</h3>` → `text-base sm:text-xl md:text-2xl …`.

**Contexto:** el formulario es `ChangePasswordForm` (`src/features/auth/change-password`), compartido con otros roles → NO tocar. La franja "Gestión de Contraseña" (líneas 94-101, `p-6`) y la columna "Consejos de Seguridad" (líneas 112-168: header `w-12 h-12` en 115, título `text-xl` en 119) pueden compactarse igual si se ven grandes en móvil. La página es `'use client'` y el nombre del componente (`CustomerSecurityPage`) es copy-paste del panel de cliente — NO cambiar el nombre.

---

### 7.8 Categorías — indicadores en 2×2 en móvil — `src/features/admin/categories/CategoriesPageClient.tsx`

**Problema:** los 4 indicadores (Total / Nivel 1 / Nivel 2 / Nivel 3) salen en 1 columna en móvil.

**Esperado:** 2×2 en móvil.

**Archivos / líneas:**
- `src/features/admin/categories/CategoriesPageClient.tsx:93-98` — `<AdminIndicatorGrid … />`.

**Contexto:** fix compartido. No tocar el form "Nueva Categoría" (línea 109+) ni la lista de categorías.

---

### 7.9 BioBlog y BioForo — botón "Actualizar" compacto + indicadores 2×2 (solo BioBlog) — `src/features/admin/bioblog/BioBlogApprovalClient.tsx` y `src/features/admin/bioforo/BioForoApprovalClient.tsx`

**Problema (dos cosas):**
1. El botón "Actualizar" del membrete (`ModuleHeader actions`) sale grande en móvil (`BaseButton` con `size` por defecto `md`) y aprieta el título del módulo.
2. Los indicadores de BioBlog (4: Artículos / Podcasts / Videos / Shorts) salen en 1 columna en móvil. (BioForo tiene 1 solo indicador → debe quedar a ancho completo.)

**Esperado:** botón "Actualizar" compacto en móvil (`size="sm"` o padding reducido); indicadores de BioBlog en 2×2; el indicador único de BioForo a ancho completo.

**Archivos / líneas:**
- `src/features/admin/bioblog/BioBlogApprovalClient.tsx`
  - Líneas 106-116: `<BaseButton variant="action" … leftIcon="RefreshCw" …>Actualizar</BaseButton>` → agregar `size="sm"`.
  - Línea 149: `AdminIndicatorGrid … columns={4}` → fix compartido (2×2).
- `src/features/admin/bioforo/BioForoApprovalClient.tsx`
  - Líneas 96-107: mismo botón → `size="sm"`.
  - Línea 139: `AdminIndicatorGrid … columns={1}` → debe seguir en 1 columna (a ancho completo); el fix compartido debe respetar `columns={1}`.

**Contexto:** `ModuleHeader` es compartido → NO cambiar el componente (misma regla que 6.7/6.8). Solo el `size` del botón dentro de `actions` y el grid de indicadores. La lógica de aprobación (`load`, aprobar/rechazar) NO se toca.

---

### 7.10 Planes — sección Pagos: indicadores en 2×2 en móvil — `src/features/admin/planes/components/PaymentPanel.tsx`

**Problema:** los 4 indicadores (Total recaudado / Pagos exitosos / Pagos fallidos / Pendientes) salen en 1 columna en móvil.

**Esperado:** 2×2 en móvil.

**Archivos / líneas:**
- `src/features/admin/planes/components/PaymentPanel.tsx:48-56` — `AdminIndicatorGrid … columns={4}`.

**Contexto:** fix compartido. La card `VendorRow` (líneas 13-36, `flex-wrap`) y el `AdminTable` NO se tocan. El modal `PaymentDetailModal.tsx` no es parte de esta observación salvo que se vea mal en móvil.

---

## Comandos útiles para verificar

```
cd Frontend-Lyrium/frontapp
npm run dev          # servidor en http://localhost:3000
npm run lint         # ESLint (correr antes de entregar)
npx tsc --noEmit     # type check (correr antes de entregar)
```

Flujo de prueba rápido: entrar a cada URL indicada arriba, abrir DevTools → modo
dispositivo (390×844), revisar modo día y modo noche (`prefers-color-scheme`), y
comprobar que los cambios no afectan la vista de escritorio (≥ 1024px).
