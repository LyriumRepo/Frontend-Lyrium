# Plan: Correcciones visuales Panel Admin — Light Mode + Helpdesk + Tablas

## Contexto de lo avanzado

Ya se crearon 3 componentes reutilizables (`AdminIndicatorGrid`, `AdminTable`, `AdminModal` en `src/components/admin/`) y se migraron los indicadores de Vendedores, Categorías y Solicitudes a `AdminIndicatorGrid`. También se corrigió `font-black` → `font-bold` en Facturación Rápida y se reemplazaron todos los `text-gray-*`, `bg-white`, `bg-gray-*`, `border-gray-*` por variables CSS en los 6 archivos del módulo Planes (`PlansGrid`, `PaymentPanel`, `VendedoresPanel`, `RequestsPanel`, `TimelineEditor`, `UISettingsPanel`). Light mode del módulo Planes está listo.

## Pendiente

### 1. Migrar tablas a AdminTable
- `SellerList` → `AdminTable` (Control Vendedores)
- `TrainingsList` → `AdminTable` (Capacitaciones)
- `PaymentPanel` / `VendedoresPanel` → `AdminTable` (Planes)

### 2. Migrar modales a AdminModal
- `TrainingEditorModal` → `AdminModal` (Capacitaciones)
- Modales de Planes → `AdminModal`

### 3. Helpdesk — corregir layout del toggle Vendedores/Clientes
Revisar espaciado y alineación del toggle en el módulo helpdesk.

### 4. Verificación final
- `npx tsc --noEmit` — sin errores
- `npm run lint` — sin errores
- Verificar visualmente que light mode funciona en Planes y el resto de módulos admin

## Reglas
- No modificar lógica funcional existente
- Priorizar componentes compartidos sobre código inline
- `AdminIndicatorGrid` usa `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N`
- `AdminTable` soporta `mobileCardRender`, columnas `hideMobile`, alineación por columna
- `BaseStatCard` ya tiene mapping de colores: `lima`, `verde`, `turquesa`, `turquesaClaro`, `celeste`, `azulCeleste`, `sky`, `emerald`, `amber`, `rose`, `violet`
- Archivos relevantes en `src/features/admin/` y `src/components/admin/`
