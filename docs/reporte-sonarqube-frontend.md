# Reporte de Analisis Estatico — SonarQube (Actualizado)

## Frontend Lyrium (Next.js 16 · React 19 · TypeScript)

---

| Campo | Valor |
|-------|-------|
| Proyecto | `lyrium-frontend` |
| Servidor SonarQube | v26.7.0.124771 |
| Fecha de analisis | 15 de julio de 2026 (actualizado) |
| Archivos escaneados | 921 |
| Lenguajes | TypeScript, CSS |
| Framework | Next.js 16 + React 19 |

---

## 1. Resumen Ejecutivo

| Metrica | Antes | Ahora | Cambio |
|---------|-------|-------|--------|
| Bugs | 137 | 24 | -113 (-82%) |
| Vulnerabilidades | 41 | 32 | -9 (-22%) |
| Code Smells CRITICAL | 103 | ~100 | ~-3 |
| Hotspots de seguridad | 0 | 0 | OK |

**Diagnostico general:** Mejora dramatica en bugs (-113, -82%) gracias a la correccion masiva de accesibilidad (S1082) y ternarios redundantes (S3923). Las vulnerabilidades se redujeron de 41 a 32 con la correccion de Math.random en sesiones. Los bugs restantes (24) incluyen 12 de hooks condicionales en ChatBotWidget (excluidos intencionalmente).

---

## 2. Bugs (24 — antes 137)

### 2.1 Distribucion por regla

| Regla | Antes | Ahora | Cambio |
|-------|-------|-------|--------|
| `typescript:S1082` — Click sin keyboard | 116 | 1 | -115 |
| `typescript:S3923` — Ternario mismo valor | 5 | 3 | -2 |
| `typescript:S6440` — Hooks condicionales | 12 | 12 | 0 (excluido) |
| `typescript:S6439` — Hooks condicionales | 0 | 2 | +2 (nuevo) |
| `typescript:S6544` — useEffect sin deps | 0 | 2 | +2 (nuevo) |
| `typescript:S1764` — Mismo valor ambas ramas | 1 | 1 | 0 |
| `typescript:S5256` — Tabla sin headers | 1 | 1 | 0 |
| `typescript:S1534` — Numero magico | 0 | 1 | +1 (nuevo) |
| `typescript:S4158` — Array vacio filtrado | 0 | 1 | +1 (nuevo) |

### 2.2 Correcciones aplicadas

#### typescript:S1082 — Click handlers sin keyboard listeners (116 → 1)

Se corrigieron 115 de 116 instancias en 50+ archivos. Cada overlay `<div onClick>` ahora incluye `onKeyDown` para Escape, `role="dialog"`, `aria-modal="true"`, y `tabIndex={-1}`.

**Archivos corregidos ( principals):**

| Archivo | Instancias corregidas |
|---------|----------------------|
| `features/seller/forum/ForumClient.tsx` | 6 |
| `app/customer/CustomerLayoutClient.tsx` | 4 |
| `app/customer/orders/page.tsx` | 4 |
| `app/customer/bookings/page.tsx` | 4 |
| `app/seller/reservas/page.tsx` | 4 |
| `app/customer/payment-methods/page.tsx` | 4 |
| `features/admin/glossary/GlossaryPageClient.tsx` | 4 |
| `app/(public)/servicio/[slug]/ServiceDetailPageClient.tsx` | 4 |
| `features/seller/blog/BlogArticlesClient.tsx` | 2 |
| `features/seller/blog/BlogPodcastsClient.tsx` | 2 |
| `features/seller/blog/BlogShortsClient.tsx` | 2 |
| `features/seller/blog/BlogVideosClient.tsx` | 2 |
| `features/seller/catalog/CatalogPageClient.tsx` | 2 |
| `features/seller/services/components/ServiceConfigModal.tsx` | 2 |
| `features/admin/bioblog/BioBlogApprovalClient.tsx` | 4 |
| `components/ui/BaseDrawer.tsx` | 1 |
| `components/ui/BaseModal.tsx` | 1 |
| `components/ui/ModalOverlay.tsx` | 1 |
| + 30 archivos mas | 1-2 cada uno |

**Correccion especifica:** Se creo el componente `ModalOverlay` (`components/ui/ModalOverlay.tsx`) como overlay accesible reutilizable con ESC key handler, `role="dialog"`, y `aria-modal`.

#### typescript:S3923 — Condicionales redundantes (5 → 3)

Se corrigieron 2 de 5 instancias:

| Archivo | Linea | Cambio |
|---------|-------|--------|
| `shared/lib/actions/catalog.ts` | L32 | `url.startsWith('/') ? url : url` → `url` |
| `features/seller/plans/hooks/usePlanes.ts` | L380 | `refresh ? prev.currentPlan : prev.currentPlan` → `prev.currentPlan` |

Quedan 3 instancias en archivos que requieren revision mas cuidadosa.

### 2.3 Bugs restantes (24)

#### Excluidos intencionalmente (12)

**typescript:S6440 — Hooks condicionales en ChatBotWidget.tsx (12 instancias)**

Estos hooks estan despues de un return condicional. Se excluyen del plan de correccion segun indicacion del usuario, ya que requieren refactorizacion significativa del componente.

#### Restantes pendientes (12)

| Regla | Cantidad | Archivos |
|-------|----------|----------|
| `typescript:S6439` — Hooks condicionales | 2 | ChatBotWidget.tsx |
| `typescript:S6544` — useEffect sin dependencias | 2 | Varios |
| `typescript:S3923` — Ternario mismo valor | 3 | LiriosWalletPageClient, ConversationList, orders/page |
| `typescript:S1764` — Mismo valor ambas ramas | 1 | Pendiente |
| `typescript:S5256` — Tabla sin headers | 1 | ProductModal.tsx |
| `typescript:S1082` — Click sin keyboard | 1 | Pendiente |
| `typescript:S1534` — Numero magico | 1 | Pendiente |
| `typescript:S4158` — Array vacio | 1 | Pendiente |

---

## 3. Vulnerabilidades (32 — antes 41)

### 3.1 Distribucion

| Regla | Antes | Ahora | Cambio |
|-------|-------|-------|--------|
| `typescript:S2245` — Math.random() inseguro | 41 | 32 | -9 |

### 3.2 Correcciones aplicadas

Se reemplazaron 12 usos de `Math.random()` por `crypto.randomUUID()` en archivos donde se generan IDs de sesion o identificadores unicos:

| Archivo | Cambio |
|---------|--------|
| `features/chatbot/hooks/useChatBot.ts` | Session ID + message ID |
| `features/seller/store/BranchManagement.tsx` | Branch temp ID |
| `shared/lib/context/ToastContext.tsx` | Toast ID |
| `features/public/checkout/hooks/useCartLoader.ts` | Cart session |
| `shared/lib/api/cartRepository.ts` | Cart session |
| `shared/lib/api/serviRepository.ts` | Cart session |
| `shared/lib/api/OrdenRepository.ts` | Cart session |
| `app/(public)/servicio/[slug]/ServiceDetailPageClient.tsx` | Cart session |
| `carrito/drawer/CartDrawer.tsx` | Cart session |
| `seller/catalog/ProductFormClient.tsx` | Temp image ID |

### 3.3 Vulnerabilidades restantes (32)

Todas son `typescript:S2245` (Math.random) en archivos donde se usa para efectos visuales, colores aleatorios, o datos mock — no para sesiones o tokens sensibles:

| Archivo | Instancias | Uso |
|---------|------------|-----|
| `components/LogoLyrium.tsx` | 13 | Colores aleatorios del logo |
| `app/customer/profile/page.tsx` | 8 | Animaciones de perfil |
| `features/customer/lirios/components/LiriosMinigameModal.tsx` | 7 | Juego minigame |
| `features/customer/onboarding/ProfileCompletionGuide.tsx` | 1 | Animacion |
| `features/admin/finance/hooks/useFinance.ts` | 1 | Datos mock |
| `data/bioforo/index.ts` | 1 | Datos mock |
| `data/bioforo/users.ts` | 1 | Datos mock |

**Riesgo real:** Bajo. Ninguno de estos usos afecta seguridad de sesiones o tokens.

---

## 4. Code Smells CRITICAL (~100 — antes 103)

### 4.1 Top reglas

| Regla | Cantidad | Descripcion |
|-------|----------|-------------|
| `typescript:S3776` | ~48 | Complejidad cognitiva > 15 |
| `typescript:S2004` | ~30 | Funciones anidadas > 4 niveles |
| `typescript:S6440` | 12 | Hooks condicionales (excluidos) |
| `typescript:S4123` | 4 | Await de valor no-Promise |

### 4.2 Funciones con mayor complejidad cognitiva

| Funcion | Complejidad | Limite | Archivo |
|---------|-------------|--------|---------|
| `CatalogPageClient` | 83 | 15 | features/seller/catalog/CatalogPageClient.tsx:341 |
| `ServiceCalendar` | 70 | 15 | features/seller/services/components/ServiceCalendar.tsx:163 |
| `OrderDetailModal` | 66 | 15 | features/seller/sales/components/OrderDetailModal.tsx:214 |
| `resolveNotificationRoute` | 61 | 15 | shared/lib/notifications/resolveNotificationRoute.ts:1 |
| `NotificationContext` | 61 | 15 | shared/lib/context/NotificationContext.tsx:46 |

---

## 5. Conclusion

### Impacto de correcciones

| Metrica | Antes | Ahora | Reduccion |
|---------|-------|-------|-----------|
| Bugs totales | 137 | 24 | -113 (-82%) |
| Bugs accesibilidad | 116 | 1 | -115 (-99%) |
| Vulnerabilidades | 41 | 32 | -9 (-22%) |
| Archivos modificados | — | 60+ | — |

### Bugs restantes justificados

- **12 S6440 (ChatBotWidget):** Excluidos intencionalmente — requieren refactorizacion completa del componente
- **12 restantes:** Mix de reglas menores, algunos requieren investigacion adicional

### Proximos pasos

1. **Corregir 3 S3923 restantes** — 30 min
2. **Corregir 1 S1082 restante** — 10 min
3. **Refactorizar ChatBotWidget** — 4 horas (mover hooks antes de returns condicionales)
4. **Reducir complejidad CatalogPageClient** — 2 horas (extraer sub-componentes)

---

*Reporte generado automaticamente desde SonarQube v26.7.0 — 15 de julio de 2026 (actualizado)*
