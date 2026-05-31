## Goal  
- Connect the Lyrium frontend seller panel (Servicios/Especialistas CRUD) to the real Laravel backend API.

## Constraints & Preferences  
- Do NOT modify any backend code.  
- Frontend at `src/`.  
- Backend at `/home/juan/Backend-Lyrium`.  
- `laravel_token` cookie is HttpOnly — cannot be read via `document.cookie` on client.

## Progress  

### Done  
- Analyzed full backend structure for Servicios (ServiceController, ServiceService, ServiceSchedule, StoreServiceRequest) and Especialistas (SpecialistController, StoreSpecialistRequest, UpdateSpecialistRequest).  
- Analyzed frontend seller services module: `ServicesPageClient`, `useSellerServices` hook, `ServicoReposit.ts`, `serviceAdapter.ts`, and all components.  
- Fixed `ServicoReposit.ts`: routes `/services/me` → `/seler/services`, auth via `/api/auth-token`, corrected reschedule endpoint, added missing methods.  
- Fixed `serviceAdapter.ts`:  
  - `day_of_week` mapping now accepts both numeric (0–6) and string keys (`monday`–`sunday`) via `BACKEND_DAY_MAP`.  
  - `LaravelSchedule` interface includes `specialist_id`.  
   - `adaptServiceToFrontend`: merge de schedules por día (días únicos) con bloques combinados, deduplicando por hora. Construye `especialistaHorarios` vía `blockLookup` de (día+hora) a índice de bloque.  
   - `adaptServiceToBackend`: genera `schedules` desde `especialistaHorarios` con `find` por día + `bloques[blockIndex]`.  
   - `orden_bloque` usa 1-based index (`blockIndex + 1`).
  - Category mapping via static `CATEGORY_NAME_TO_ID` map and `extractCategoryId()`.  
  - Corrected `adaptSpecialistToFrontend`/`Backend` mappings.  
- Rewrote `useSellerServices.ts`: imports from `ServicoReposit.ts`; accepts SSR `initialData` props; all queries/mutations call real API; `onError` shows toast.  
- Updated `ServicesPageClient.tsx` to accept `initialServices`, `initialSpecialists`, `initialAppointments` props.  
- Fixed `ServiceConfigModal.tsx`:  
  - `assignableSpecialists` filter: when no category selected, returns empty array.  
  - `assignableSpecialists` category matching: uses `endsWith` as fallback for edit case.  
  - Category population on edit: searches `CATEGORY_TREE` by leaf name.  
  - Time inputs: replaced `<input type="time">` with `<select>` for hours (00–23) and minutes (00/30).  
  - `addBlock` also adds new block index to all currently assigned specialists' `especialistasAsignados`.  
  - Fixed duplicate day keys: `` `${dayEntry.dia}-${idx}` `` and `` `${dayEntry.dia}-${ddx}` ``.  
- Fixed `ServiceDetailModal.tsx`: duplicate-day key changed to `` `${dayObj.dia}-${idx}` ``; `buildScheduleSubtitle` and day display now deduplicate days via `Set`.  
- Fixed `ServiceCalendar.tsx`: `handleDayClick` handles undefined `especialistaHorarios`.  
- Fixed `ServicesPageClient.tsx`:  
  - `saveServiceAndSyncSpecialists` removed `handleSaveSpecialist` loop.  
  - `handlePublish` sends only `{ id, estado }`.  

### In Progress  
- (none — all known bugs addressed)

### Blocked  
- (none)

## Key Decisions  
- Use `ServicoReposit.ts` as primary repository.  
- Strip `email`/`document_number`/`document_type` from specialist update payload.  
- Static category name→ID map from DB dump.  
- 1:1 mapping of schedule → AttendanceDay (no merge) to avoid block index corruption.  
- `especialistaHorarios` stores indices into `diasAtencion` array (not per-day block indices).  
- `addBlock` auto-assigns new blocks to all assigned specialists.  
- Replace native `<input type="time">` with `<select>` hour/minute pickers.  

## Known Issues  
- Backend GET `/api/seler/services` always returns `"specialists": []`; adapter extracts IDs from `schedule[].specialist_id`.  

## Relevant Files  
- `src/features/seller/services/utils/serviceAdapter.ts`: Central adapter with 1:1 mapping, `especialistaHorarios` building, category mapping, 1-based `orden_bloque`.  
- `src/features/seller/services/components/ServiceConfigModal.tsx`: Create/edit form with select-based time pickers, `addBlock` updating specialist assignments, category tree lookup on edit.  
- `src/features/seller/services/components/ServiceCalendar.tsx`: Calendar with specialist filter.  
- `src/features/seller/services/components/ServiceDetailModal.tsx`: Detail view with deduplicated days.  
- `src/features/seller/services/ServicesPageClient.tsx`: Client component with fixed save/publish.  
- `src/features/seller/services/hooks/useSellerServices.ts`: Hook using real API.  
- `src/shared/lib/api/ServicoReposit.ts`: Active repository with corrected auth/routes/CRUD.  
- `src/features/seller/services/types.ts`: Core types.  
- `src/shared/lib/actions/services.ts`: Server actions for SSR data fetching.  
