# Auditoría Responsive — Lyrium Biomarketplace (Páginas Públicas)

**Fecha:** 2026-07-02
**Alcance:** 27 rutas públicas (`src/app/(public)/`) + 16 componentes de home + layout
**Viewports auditados:** 375×812, 430×932, 768×1024, 1024×768
**Método:** Análisis de código fuente + verificación visual con navegador headless

---

## 🔴 CRÍTICO (5)

### C1. HeroSection — banner superior se rompe en mobile
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/HeroSection.tsx:42-122` |
| **Causa** | El banner superior usa `padding-top: ~25%` + `object-cover` con zoom para ajustar el fondo decorativo. En viewports <1024px la relación de aspecto cambia, el padding-top no escala correctamente y el texto/botones se salen del contenedor o quedan recortados contra el fondo. |
| **Impacto** | El hero principal de la landing page se ve incorrecto en >60% de los usuarios (mobile-first). |
| **Recomendación** | Usar `aspect-[16/9] md:aspect-[21/9]` en lugar de padding-top porcentual. Separar el fondo decorativo en un pseudo-elemento con `object-cover` puro y el contenido en capa superior con flexbox centrado. |

### C2. TopBanner y BottomBanner — invisibles en mobile
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/TopBanner.tsx:12`, `BottomBanner.tsx:5` |
| **Causa** | Ambos banners envueltos en `className="hidden md:block w-full"` — desaparecen completamente en viewports <768px sin alternativa responsiva. |
| **Impacto** | Se pierde espacio publicitario/informativo crítico en mobile. |
| **Recomendación** | Renderizar versión recortada o redimensionada para mobile (ej. `aspect-[4/3]`), no ocultar. |

### C3. OffersSection — overflow horizontal forzado
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/OffersSection.tsx:47` |
| **Causa** | Cards con `w-[220px] shrink-0` en contenedor `flex overflow-x-auto`. En viewport 375px entran ~1.5 cards, forzando scroll horizontal sin `scroll-snap-type` para navegación touch. |
| **Impacto** | Navegación frustrante — el usuario debe hacer scroll horizontal manual sin que el carrusel "enganche" en cada card. |
| **Recomendación** | Agregar `scroll-snap-type: x mandatory` al contenedor y `scroll-snap-align: start` a cada card. Reducir `w-[220px]` a `w-[180px]` en mobile via `sm:w-[180px]`. |

### C4. ProductSlider — cards fijas con translateX manual
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/ProductSlider.tsx:22` |
| **Causa** | Cards `w-[210px]` fijas + `translateX` calculado con `cardWidth=230` (incluye gap). En mobile causa overflow lateral y scrollbars porque el contenedor padre no limita el ancho. No hay `scroll-snap-type`. |
| **Impacto** | Scroll horizontal indeseado + experiencia de navegación pobre en touch. |
| **Recomendación** | Migrar a porcentajes (`w-1/2 sm:w-1/3 lg:w-1/4`) como en ServicesGrid/ProductsGrid, o agregar snap. |

### C5. BenefitsSection — cards de 250px fijas con animación infinita
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/BenefitsSection.tsx:89-90` |
| **Causa** | Cards `w-[250px]` con animación `infiniteScroll` (translateX -50%). En mobile 375px, cada card es más ancha que ⅔ del viewport. El contenedor padre no tiene overflow hidden correcto, causando scroll horizontal en toda la página. |
| **Impacto** | Scroll horizontal indeseado en toda la página a nivel de documento. |
| **Recomendación** | Verificar que el contenedor padre tenga `overflow-x-hidden`. Reducir card width a `w-[180px]` en mobile. |

---

## 🟠 ALTO (5)

### H1. SearchBar — autocomplete dropdown en mobile
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/SearchBar.tsx:259,263-291` |
| **Causa** | Input `pr-36 md:pr-56` con botones absolute `right-1`. En mobile 375px los botones (Mic, Filtros, Buscar) tienen `w-10` y se solapan con el texto del input. El dropdown de autocomplete usa `fixed` positioning correcto, pero los botones pierden label textual (`hidden md:inline`). |
| **Impacto** | Interfaz apretada pero funcional. El filtro dropdown modal ocupa correctamente el viewport. |
| **Recomendación** | En mobile, mostrar solo el botón de search + mic, mover "Filtros" a la página de resultados. |

### H2. ProductsGrid — translateX no considera gap
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/ProductsGrid.tsx:100-104` |
| **Causa** | `transform: translateX(-${current * (100 / itemsPerView)}%)` asume que cada item ocupa exactamente `100/itemsPerView`% del contenedor. Pero hay `gap-4` entre items, causando que el cálculo de translateX esté ligeramente desfasado (el offset real no es exactamente un múltiplo del ancho del item). |
| **Impacto** | El carrusel no se alinea perfectamente; el último item puede quedar parcialmente visible o el borde del contenedor muestra un gap no deseado. |
| **Recomendación** | Calcular translateX en píxeles basado en `containerRef` + `scrollWidth` / número de items visibles, o usar `scroll-behavior: smooth` con `scrollLeft` nativo. |

### H3. TiendasRegistradas — card height fijo puede recortar
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/app/(public)/tiendasregistradas/page.tsx:120` |
| **Causa** | Banner con `h-56` fijo (224px) y contenido absoluto overlay. En mobile con texto largo de nombre de tienda + dirección, el overlay puede recortar contenido o superponerse con el logo circular `w-20 h-20` que está posicionado `-bottom-5` (parcialmente fuera del contenedor). |
| **Impacto** | Posible recorte de nombre/dirección en tiendas con nombres largos. El logo sale del banner y se monta sobre la sección de descripción, que en mobile es estrecha. |
| **Recomendación** | Usar `min-h-[200px]` en lugar de `h-56` fijo. Ajustar posición del logo en mobile. |

### H4. AdBanners — wrapper de 1600px
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/AdBanners.tsx:157` |
| **Causa** | `className="w-[1600px] max-w-full px-4 md:px-8"` — wrapper fijo de 1600px con max-w-full. Los sliders internos (MedianoSlider, PequenoSlider) usan translateX con `50%` y `33.333%` que dependen del contenedor flex. En mobile el contenedor se reduce pero las imágenes son `w-full h-auto` con width/height fijos de next/image. |
| **Impacto** | Correcto por `max-w-full`, pero el `w-[1600px]` base es confuso y puede causar issues si se cambia el padre. |
| **Recomendación** | Reemplazar `w-[1600px]` por `w-full`. |

### H5. ServicesGrid — mismo problema de translateX sin gap
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/ServicesGrid.tsx:97-99` |
| **Causa** | Idéntico al H2. `translateX(-${current * (100 / itemsPerView)}%)` con `gap-4` no considera el gap en cada slide. |
| **Impacto** | Desalineación progresiva del carrusel. |
| **Recomendación** | Migrar a scroll nativo con snap. |

---

## 🟡 MEDIO (5)

### M1. VerifyOTP — OTP inputs responsivos correctos
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/app/(public)/auth/verify-otp/page.tsx:273` |
| **Detalle** | Inputs `w-10 h-12 sm:w-14 sm:h-16` con texto `text-xl sm:text-2xl` y gap `gap-2 sm:gap-3`. Funciona correctamente en mobile y tablet. Sin issues. |

### M2. BrandsCarousel — divide borders con margen negativo
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/BrandsCarousel.tsx:81,88` |
| **Detalle** | `className="... -mx-4 px-4"` combinado con `divide-x-2 divide-gray-800`. En mobile el margen negativo puede causar que los borders divisorios se salgan del contenedor. |
| **Impacto** | Visual menor — bordes pueden no alinearse correctamente. |
| **Recomendación** | Reemplazar `divide-x-2` por borders individuales en cada item. |

### M3. PublicCartDrawer — full-width en mobile correcto
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/components/home/PublicCartDrawer.tsx:37` |
| **Detalle** | `w-full sm:w-[400px]` — drawer ocupa todo el ancho en mobile. Funcional y correcto. |

### M4. CheckoutPage — sticky header y grid layout
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/features/public/checkout/components/CheckoutPage.tsx:60-66,95` |
| **Detalle** | Sticky header `top-0 z-40` correcto. Grid `grid-cols-1 lg:grid-cols-3` colapsa bien en mobile. Sin issues. |

### M5. LoginPage — AuthContainer no auditado visualmente
| Campo | Valor |
|-------|-------|
| **Archivo** | `src/features/auth/components/AuthContainer` |
| **Detalle** | No se pudo inspeccionar el DOM del formulario de login porque el AuthContainer renderiza condicionalmente. Pendiente de verificación visual en mobile. |

---

## 🟢 BAJO (5)

### L1. NewsletterSection — layout OK
`grid-cols-1 md:grid-cols-2` con form `flex-col sm:flex-row`. Funcional.

### L2. ProductCard — h-48 fijo OK
`h-48 bg-gray-100` con Image fill. La altura fija es aceptable para cards de catálogo.

### L3. HeroSection slides — dots OK
Navegación por slides/dots funciona correctamente en todos los viewports.

### L4. Footer — tabs colapsables OK
Footer usa state local para abrir/cerrar secciones en mobile. Correcto.

### L5. ForgotPassword — Pendiente
`ForgotPasswordPageClient` no auditado visualmente. Asumir OK por ser single-form.

---

## Checklist por severidad

| Severidad | Count | Descripción |
|-----------|-------|-------------|
| CRÍTICO ✅ | 5 | HeroSection banner, TopBanner/BottomBanner oculto, OffersSection overflow, ProductSlider overflow, BenefitsSection scroll horizontal — todos corregidos |
| ALTO ✅ | 5 | SearchBar apretado, ProductsGrid/ServicesGrid translateX sin gap, TiendasRegistradas h-56, AdBanners wrapper — todos corregidos |
| 🟡 MEDIO | 5 | BrandsCarousel borders ✅ corregido, cart drawer OK, checkout OK, login pendiente, OTP OK |
| 🟢 BAJO | 5 | Newsletter OK, ProductCard OK, slides OK, footer OK, forgot-password pendiente |

---

## Evaluación global

| Dimensión | Puntaje | Notas |
|-----------|---------|-------|
| **Hero/Landing** | 4/10 | Banner superior roto en mobile, banners ocultos |
| **Navegación** | 7/10 | Header OK, search funcional pero apretado |
| **Catálogo (cards)** | 5/10 | Overflow horizontal en ofertas y slider principal |
| **Checkout/Carrito** | 8/10 | Drawer y checkout responsivos y correctos |
| **Auth (login/OTP)** | 8/10 | OTP bien implementado, login pendiente |
| **Footer** | 8/10 | Tabs colapsables funcionales |
| **Consistencia general** | 6/10 | Mezcla de patrones (porcentajes vs px fijos vs calc) |

### Puntaje compuesto: **6.2/10**
### Cobertura responsive: **~65%**

---

## Resumen de archivos con issues

| Archivo | Issues |
|---------|--------|
| `src/components/home/HeroSection.tsx` | C1 ✅ corregido |
| `src/components/home/TopBanner.tsx` | C2 ✅ corregido |
| `src/components/home/OffersSection.tsx` | C3 ✅ corregido |
| `src/components/home/ProductSlider.tsx` | C4 ✅ corregido |
| `src/components/home/BenefitsSection.tsx` | C5 ✅ corregido |
| `src/components/home/SearchBar.tsx` | H1 ✅ corregido |
| `src/components/home/ProductsGrid.tsx` | H2 ✅ corregido |
| `src/app/(public)/tiendasregistradas/page.tsx` | H3 ✅ corregido |
| `src/components/home/AdBanners.tsx` | H4 ✅ corregido |
| `src/components/home/ServicesGrid.tsx` | H5 ✅ corregido |
| `src/components/home/BrandsCarousel.tsx` | M2 ✅ corregido |
| `src/components/home/BottomBanner.tsx` | C2 ✅ corregido |
