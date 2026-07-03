# Auditoría de Páginas Públicas — Frontend Lyrium

> Reporte para Claude Code: hardcodeados, bugs y problemas responsive.
> Severidad: 🔴 bloqueante | 🟡 molesto | ⚪ cosmético

---

## HOME (`src/app/(public)/page.tsx`)

### HeroSection (`src/components/home/HeroSection.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 1 | 🔴 Hardcodeado | `HeroSection.tsx:17-22` | 6 slides fijos con `src="/img/hero/hero-1.png"` ignorando API. No hay fallback si las imágenes no existen. | 🔴 |
| 2 | ⚪ Hardcodeado | `HeroSection.tsx:6-16` | Textos de banner, CTA labels, links hardcodeados. Nunca lee datos dinámicos. | ⚪ |
| 3 | 🟡 Responsive | `HeroSection.tsx` | No hay media queries en el contenedor del slider. En mobile < 360px los textos se superponen. | 🟡 |

### BrandsCarousel (`src/components/home/BrandsCarousel.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 4 | 🟡 Responsive | `BrandsCarousel.tsx` | `itemsPerView` dinámico pero sin breakpoint para < 480px. En móvil muy pequeño muestra 2 logos que se aplastan. | 🟡 |
| 5 | ⚪ Hardcodeado | `BrandsCarousel.tsx` | Logos de marcas son array estático local, no vienen de API. | ⚪ |

### AdBanners (`src/components/home/AdBanners.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 6 | ⚪ Hardcodeado | `AdBanners.tsx` | Banners son datos locales mock, no endpoint real. | ⚪ |
| 7 | 🟡 Bug | `AdBanners.tsx` | `slideWidth = 50%` (paso de 2 slides). En mobile el scroll salta 2 cards pudiendo dejar una a medio mostrar. | 🟡 |

### ProductSlider (`src/components/home/ProductSlider.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 8 | 🟡 Bug | `ProductSlider.tsx` | Category cards con navegación a `/categoria/...` que no existe (ruta correcta es `/productos/...`). | 🟡 |

---

## CATÁLOGO — Laravel (`src/app/(public)/productos/[...categoria]/CategoryPageClient.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 9 | 🔴 Bug | `CategoryPageClient.tsx` | `filteredProducts` filtra por `product.category_id` pero `LaravelProduct.category_id` es `number` y `category` de la URL es `string` — conversión implícita puede fallar. | 🔴 |
| 10 | 🟡 Responsive | `CategoryPageClient.tsx` | Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`. Sin breakpoint intermedio para tablets (768-1024px). | 🟡 |
| 11 | 🟡 Responsive | `CategoryPageClient.tsx` | Sidebar de filtros es `hidden lg:block`. En mobile no hay alternativa (sin drawer de filtros). | 🟡 |

---

## CATÁLOGO — WooCommerce legacy (`src/app/(public)/productos/[categoria]/CategoryPageClient.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 12 | 🔴 Bug | `CategoryPageClient.tsx` | Misma ruta `/productos/[categoria]` compite con `[...categoria]`. Next.js elige la más específica, pero puede haber conflicto. | 🔴 |
| 13 | 🟡 Responsive | `CategoryPageClient.tsx` | Sin responsive filters drawer en mobile. | 🟡 |

### ProductCard (`src/components/products/ProductCard.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 14 | 🟡 Responsive | `ProductCard.tsx` | `h-48` fijo para imagen. En cards muy angostas la imagen se distorsiona o recorta mal. | 🟡 |
| 15 | ⚪ Bug | `ProductCard.tsx` | No hay `alt` text descriptivo en `<Image>` — usa `alt={product.name}` cuando existe, si no, alt vacío. | ⚪ |
| 16 | 🟡 Bug | `ProductCard.tsx` | `onError` de imagen asigna fallback pero no notifica al usuario que la imagen falló. | 🟡 |

---

## DETALLE DE PRODUCTO (`src/app/(public)/producto/[slug]/ProductDetailPageClient.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 17 | 🟡 Responsive | `PDP.tsx:~50` | Layout 2 columnas `grid-cols-1 lg:grid-cols-2`. En mobile la galería ocupa todo el ancho y los thumbnails laterales desaparecen (solo dots). | 🟡 |
| 18 | 🟡 Bug | `PDP.tsx` | Tabs de información (Descripción, Especificaciones, Reviews). No hay estado de "no reviews" — muestra spinner infinito si el array está vacío. | 🟡 |
| 19 | 🔴 Bug | `PDP.tsx` | `relatedProducts` slider no tiene manejo de error — si la API falla, el carrusel se rompe. | 🔴 |
| 20 | 🟡 Responsive | `PDP.tsx` | Botón "Agregar al carrito" no tiene variante `w-full` en mobile — puede quedar muy angosto. | 🟡 |
| 21 | 🟡 Bug | `PDP.tsx` | `stock` display — si stock es 0, muestra "Sin stock" pero el botón de comprar sigue habilitado. | 🟡 |
| 22 | ⚪ Bug | `PDP.tsx:~1800` | Carrusel de productos relacionados con `itemsPerView` dinámico, pero sin `drag` habilitado en mobile. | ⚪ |

---

## CARRITO (`src/app/(public)/carrito/page.tsx` → `features/public/carrito/components/`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 23 | 🟡 Responsive | `CarritoPage.tsx` | Layout 2 columnas `grid-cols-1 lg:grid-cols-3`. Resumen de orden ocupa todo el ancho en mobile sin padding extra. | 🟡 |
| 24 | ⚪ Bug | `CarritoPage.tsx` | Si el carrito está vacío, muestra mensaje pero el botón "Seguir comprando" no aparece hasta que se renderiza el estado vacío. | ⚪ |
| 25 | 🟡 Responsive | `CartDrawer.tsx` | Drawer lateral `w-[90vw] max-w-[420px]`. En mobile < 360px, `90vw` = 324px, ok. Pero `CartLineItem` no colapsa texto largo. | 🟡 |

### CartDrawer (`src/features/public/carrito/components/drawer/CartDrawer.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 26 | 🟡 Bug | `CartDrawer.tsx` | Drawer no se cierra al hacer clic fuera del drawer (falta `onClickOutside` o backdrop click handler robusto). | 🟡 |
| 27 | 🟡 Bug | `CartDrawer.tsx` | Item quantity input no tiene validación — puede mandar cantidad 0 o negativa a la store. | 🟡 |

---

## CHECKOUT (`src/app/(public)/checkout/page.tsx` → `features/public/checkout/components/`)

### CheckoutStepBar (`src/features/public/checkout/components/CheckoutStepBar.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 28 | 🔴 Bug | `CheckoutStepBar.tsx:43` | Steps horizontales con círculos de 56px + conectores. En mobile < 400px los steps se comprimen sin scroll horizontal y se solapan. | 🔴 |
| 29 | 🟡 Responsive | `CheckoutStepBar.tsx` | `max-w-2xl` para los steps, sin breakpoint para mobile. Los labels de los pasos ("Dirección", "Envío", "Pago", "Resumen", "Confirmación") se cortan. | 🟡 |
| 30 | 🟡 Bug | `CheckoutStepBar.tsx` | `connectorFill()` usa porcentaje pero el conector es un div hijo. Si el step actual es el primero, el conector se renderiza pero no debería. | 🟡 |

### CheckoutPage (`src/features/public/checkout/components/CheckoutPage.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 31 | 🟡 Responsive | `CheckoutPage.tsx` | Formularios de dirección con `grid-cols-1 md:grid-cols-2`. Inputs se stackean bien, pero labels largos se cortan en mobile. | 🟡 |
| 32 | ⚪ Bug | `CheckoutPage.tsx` | No hay indicador de progreso (loading) entre steps — el usuario no sabe que está procesando. | ⚪ |

---

## LOGIN / REGISTRO (`src/app/(public)/login/page.tsx`)

### AuthContainer (`src/features/auth/components/AuthContainer.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 33 | 🟡 Responsive | `AuthContainer.tsx` | Panel de login/register está en columna única `flex-col lg:flex-row`. En mobile el intro panel (imagen decorativa) se oculta o se ve mal. | 🟡 |
| 34 | 🟡 Bug | `AuthContainer.tsx` | Error al cambiar entre "cliente" y "vendedor": el formulario se reinicia pero los campos con datos se pierden sin advertencia. | 🟡 |

### LoginPanel (`src/features/auth/components/LoginPanel.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 35 | ⚪ Bug | `LoginPanel.tsx:62` | `w-[90%] mx-auto` en el contenedor de login. En pantallas grandes se ve angosto (max 90% de 50% = 45% del viewport). | ⚪ |
| 36 | ⚪ Bug | `LoginPanel.tsx:103` | Input de username tiene `autoComplete="username"` incluso para `cliente` donde es un email — debería ser `email` para activar autofill correcto. | ⚪ |

### RegisterPanel (`src/features/auth/components/RegisterPanel.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 37 | 🔴 Bug | `RegisterPanel.tsx` | Formulario extenso (14+ campos) sin `fieldset` ni `aria-describedby`. Sin scroll-to-first-error en validación. | 🔴 |
| 38 | 🟡 Responsive | `RegisterPanel.tsx` | Select de categoría y tipo evidencia no tienen `max-width` en mobile — se desbordan del contenedor. | 🟡 |
| 39 | 🟡 Bug | `RegisterPanel.tsx` | File input para PDF no especifica `accept=".pdf"` — permite cualquier tipo de archivo. | 🟡 |
| 40 | ⚪ Bug | `RegisterPanel.tsx:90-95` | Validación de phone/ruc/dni permite solo dígitos pero no valida longitud mínima. | ⚪ |

---

## VERIFICACIÓN OTP (`src/app/(public)/auth/verify-otp/page.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 41 | 🔴 Bug | `verify-otp/page.tsx` | 6 inputs de OTP individuales con `autoFocus` en el primero pero sin `onPaste` handler — el usuario no puede pegar el código. | 🔴 |
| 42 | 🟡 Bug | `verify-otp/page.tsx` | Cooldown countdown no persiste al refrescar — se pierde el timer restante. | 🟡 |
| 43 | 🟡 Bug | `verify-otp/page.tsx` | Inputs OTP son `type="text"` en vez de `type="number"` o `inputMode="numeric"` — teclado numérico no aparece en mobile. | 🟡 |
| 44 | ⚪ Bug | `verify-otp/page.tsx` | No hay feedback háptico/visual al autofill del código. | ⚪ |

---

## RECUPERACIÓN CONTRASEÑA (`src/app/(public)/forgot-password/page.tsx` → `ForgotPasswordPageClient`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 45 | 🟡 Bug | `ForgotPasswordPageClient.tsx` | Stepper de 3 pasos (Email → OTP → Password). Al hacer "back" del paso 2 al paso 1, el OTP enviado no se invalida. | 🟡 |
| 46 | 🟡 Bug | `ForgotPasswordPageClient.tsx` | Step 3 (nueva contraseña): no hay validación de fortaleza (mín. 8 chars, mayúscula, número, etc). | 🟡 |
| 47 | ⚪ Responsive | `ForgotPasswordPageClient.tsx` | Stepper horizontal mismo problema que checkout — se comprime en mobile. | ⚪ |

---

## TIENDA PÚBLICA (`src/app/(public)/tienda/[slug]/page.tsx`)

### StoreHeader (`src/components/store/StoreHeader.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 48 | 🟡 Responsive | `StoreHeader.tsx:45` | `flex-wrap` en el contenedor de logo+nombre+badges+buscador. En mobile < 400px los badges se stackean desordenadamente. | 🟡 |
| 49 | 🟡 Bug | `StoreHeader.tsx:52` | `store.logo` — `onError` asigna fallback pero no hay skeleton mientras carga la imagen. | 🟡 |
| 50 | 🟡 Responsive | `StoreHeader.tsx` | Buscador interno de la tienda: en mobile `w-full` pero el botón de búsqueda se superpone al input en ciertos tamaños. | 🟡 |
| 51 | ⚪ Bug | `StoreHeader.tsx` | `addressShort = store.address?.split(',')[0] || 'Sin ubicación'` — si address es string vacío, muestra "Sin ubicación" pero no hay tooltip con dirección completa. | ⚪ |

---

## DIRECTORIO DE TIENDAS (`src/app/(public)/tiendasregistradas/page.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 52 | 🟡 Responsive | `tiendasregistradas/page.tsx` | Grid de tiendas: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`. Sin breakpoint para 1024-1280px (tablet landscape). | 🟡 |
| 53 | ⚪ Bug | `tiendasregistradas/page.tsx` | Sin search/filter por categoría — el usuario no puede filtrar tiendas. | ⚪ |

---

## BIOBLOG (`src/app/(public)/bioblog/page.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 54 | 🔴 Bug | `bioblog/page.tsx:17` | Server component que renderiza 6 carrousels hijos. Datos vienen de `src/data/` — no conectados a API. Si los archivos de data no existen, página en blanco. | 🔴 |
| 55 | 🟡 Responsive | `bioblog/page.tsx` | Múltiples carrousels anidados sin `will-change` ni `contain` — performance pobre en mobile. | 🟡 |
| 56 | ⚪ Bug | `bioblog/page.tsx` | Todos los componentes carrusel (`HeroCarousel`, `PostGridCarousel`, etc.) envueltos en `<Suspense>` sin fallback visible. | ⚪ |
| 57 | 🟡 Bug | `bioblog/page.tsx:52-58` | `CommentsSection` se renderiza en server component pero Comments son interactivos — debería ser cliente. | 🟡 |

---

## BIOFORO (`src/app/(public)/bioforo/page.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 58 | 🟡 Bug | `bioforo/page.tsx:19-28` | `loadData` se llama en useEffect con `selectedForum` como dependencia. En init, `selectedForum = null`, pide todos los topics — bien. Pero al seleccionar categoría, el filtro podría no funcionar si el endpoint espera `forum_id` vs `forum`. | 🟡 |
| 59 | 🟡 Bug | `bioforo/page.tsx:31-38` | `handleClickOutside` usa `document.addEventListener` sin cleanup en unmount (sí lo tiene, línea 38 — ok). Pero el dropdown de filtros tiene z-index que puede solaparse con header. | 🟡 |
| 60 | ⚪ Bug | `bioforo/page.tsx` | Sin estado vacío para topics — si no hay topics, muestra spinner eterno. | ⚪ |
| 61 | 🟡 Bug | `bioforo/page.tsx` | `forumApi.getTopics()` y `forumApi.getCategories()` vienen de `src/shared/lib/api/forum` que lee de `src/data/` — no persistente. | 🟡 |

---

## SERVICIOS (`src/app/(public)/servicio/[slug]/ServiceDetailPageClient.tsx`)

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 62 | 🟡 Bug | `ServiceDetailPageClient.tsx` | Componente de calendario para agendar servicio. Sin validación de fecha mínima (puede seleccionar fecha pasada). | 🟡 |
| 63 | 🟡 Responsive | `ServiceDetailPageClient.tsx` | Layout 2 columnas en desktop; en mobile el calendario ocupa todo el ancho y los botones de acción se stackean sin espaciado. | 🟡 |
| 64 | ⚪ Bug | `ServiceDetailPageClient.tsx` | Sin manejo de error si el slug no existe (muestra pantalla en blanco). | ⚪ |

---

## HEADER PÚBLICO — COMPONENTES COMPARTIDOS

### PublicHeader / MobileMenu

| # | Tipo | Archivo:línea | Descripción | Sev |
|---|------|--------------|-------------|-----|
| 65 | 🟡 Bug | `MobileMenu.tsx` | Menú hamburguesa con 4 niveles de navegación. En iOS Safari el scroll dentro del menú no funciona si `-webkit-overflow-scrolling` no está definido. | 🟡 |
| 66 | 🟡 Bug | `MobileMenu.tsx` | Al cerrar el menú, el foco no regresa al botón hamburguesa (accesibilidad). | 🟡 |
| 67 | ⚪ Bug | `PublicHeader.tsx` | TopBanner con texto promocional hardcodeado — no lee de API ni de sanity/CMS. | ⚪ |
| 68 | 🟡 Responsive | `PublicHeader.tsx` | `DesktopNav` tiene dropdowns que no son touch-friendly — en iPad el hover no funciona y no hay fallback a click. | 🟡 |

---

## RESUMEN: TOP 10 MÁS URGENTES

| Prioridad | # | Descripción | Impacto |
|-----------|---|-------------|---------|
| 1 | 28 | CheckoutStepBar se solapa en mobile < 400px | 🔴 Bloquea checkout en móvil |
| 2 | 9 | Filtro de categoría falla por type mismatch (number vs string) | 🔴 Productos no se filtran |
| 3 | 37 | RegisterPanel sin validación accesible (14+ campos) | 🔴 UX de registro rota |
| 4 | 41 | OTP sin `onPaste` ni `inputMode="numeric"` | 🟡 No se puede pegar código |
| 5 | 19 | relatedProducts slider sin manejo de error | 🔴 Carrusel roto si API falla |
| 6 | 54 | Bioblog datos estáticos — si archivos faltan, página en blanco | 🔴 Página entera caída |
| 7 | 11 | Sidebar filtros invisible en mobile sin drawer alternativo | 🟡 Catálogo sin filtrar en mobile |
| 8 | 45 | ForgotPassword: OTP no se invalida al hacer back | 🟡 Security UX issue |
| 9 | 68 | DesktopNav dropdowns no touch-friendly | 🟡 Navegación rota en iPad |
| 10 | 26 | CartDrawer no cierra al hacer clic fuera | 🟡 Drawer se traba |

---

## NOTAS PARA CLAUDE CODE

- **No modificar archivos en `src/data/`** — son mock estáticos, la corrección real es conectar a API Laravel.
- **Reverb WebSocket** usa `private-store.{id}` — los componentes que escuchan broadcast deben estar en cliente.
- **Dual API admin planes**: No tocar `features/admin/planes/api/planesAdminApi.ts` — usar `features/seller/plans/lib/api.ts`.
- **Bioblog y Bioforo**: Reemplazar datos mock por API real requiere crear endpoints Laravel primero.
- **Severidad**: 🔴 = arreglar primero (rompe funcionalidad), 🟡 = arreglar después (UX deficiente), ⚪ = nice-to-have.

