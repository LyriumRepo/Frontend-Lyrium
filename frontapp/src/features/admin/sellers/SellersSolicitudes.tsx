"use client";

import React, { useState } from "react";
import { useSellers, type Solicitud, type FiltroEstado } from "./hooks/useSellers";
import ModuleHeader from "@/components/layout/shared/ModuleHeader";
import Icon from "@/components/ui/Icon";
import { SunatDataModal } from "./components/SunatDataModal";

// ─── Utilidades ──────────────────────────────────────────────────────────────

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
  }) + " · " + d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

// ─── Badges ──────────────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  ACEPTADO: { bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/20", dot: "bg-emerald-400", label: "Aceptado" },
  REVISION: { bg: "bg-amber-500/10", text: "text-amber-400", ring: "ring-amber-500/20", dot: "bg-amber-400", label: "Revisión" },
  RECHAZADO: { bg: "bg-rose-500/10", text: "text-rose-400", ring: "ring-rose-500/20", dot: "bg-rose-400", label: "Rechazado" },
};

const RIESGO_CONFIG = {
  BAJO: { text: "text-emerald-400", label: "Bajo" },
  MEDIO: { text: "text-amber-400", label: "Medio" },
  ALTO: { text: "text-rose-400", label: "Alto" },
};

// Badge para solicitudes que entraron por fallback (sin evaluación RPA)
// Se identifican porque tienen etapa === 0
function FallbackBadge() {
  return (
    <span
      title="Esta solicitud no fue evaluada por el RPA automáticamente. Requiere revisión manual."
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25 cursor-help"
    >
      ⚠ Sin RPA
    </span>
  );
}

function EstadoBadge({ estado }: { estado: Solicitud["estado"] }) {
  const c = ESTADO_CONFIG[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${c.bg} ${c.text} ${c.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

const ESTADOS_DISPONIBLES: Solicitud["estado"][] = ["ACEPTADO", "REVISION", "RECHAZADO"];

const CATEGORIAS = [
  { value: "", label: "Todas las categorías" },
  { value: "alimentos_saludables", label: "Alimentos saludables / orgánicos" },
  { value: "atencion_medica", label: "Atención médica" },
  { value: "fitness_bienestar", label: "Fitness y bienestar físico" },
  { value: "mascotas", label: "Mascotas" },
  { value: "medicina_natural", label: "Medicina natural, suplementos y vitaminas" },
  { value: "productos_ecologicos", label: "Productos ecológicos" },
  { value: "tecnologia_medica", label: "Tecnología médica" },
];

function EstadoSelector({
  estado, disabled, onChange,
}: {
  estado: Solicitud["estado"];
  disabled: boolean;
  onChange: (nuevo: Solicitud["estado"]) => void;
}) {
  return (
    <select
      value={estado}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as Solicitud["estado"])}
      onClick={(e) => e.stopPropagation()}
      className="text-[10px] font-black uppercase tracking-wide rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] px-2 py-1.5 focus:outline-none focus:border-sky-500/50 dark:focus:border-[var(--icons-green)]/50 disabled:opacity-50 cursor-pointer"
    >
      {ESTADOS_DISPONIBLES.map((e) => (
        <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
      ))}
    </select>
  );
}

function RiesgoBadge({ riesgo }: { riesgo: Solicitud["riesgo"] }) {
  const c = RIESGO_CONFIG[riesgo];
  return <span className={`text-xs font-semibold tracking-wide ${c.text}`}>{c.label}</span>;
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-emerald-500"
      : score >= 50 ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm font-bold text-[var(--text-primary)] w-6 shrink-0">{score}</span>
      <div className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, accent,
}: {
  label: string; value: number; accent: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] font-medium">{label}</span>
      <span className={`text-3xl font-bold tabular-nums ${accent}`}>{value}</span>
    </div>
  );
}

// ─── Filtros ─────────────────────────────────────────────────────────────────

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "ACEPTADO", label: "Aceptados" },
  { value: "REVISION", label: "Revisión" },
  { value: "RECHAZADO", label: "Rechazados" },
];

// ─── Diagnóstico expandido ────────────────────────────────────────────────────

function FilaDiagnostico({
  diagnostico, colSpan, onVerSunat,
}: {
  diagnostico: string[]; colSpan: number; onVerSunat: () => void;
}) {
  return (
    <tr className="bg-[var(--bg-card)]">
      <td colSpan={colSpan} className="px-6 pb-4 pt-0">
        <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] font-semibold">
              Diagnóstico del RPA
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); onVerSunat(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 dark:bg-[var(--icons-green)]/15 text-sky-400 dark:text-[var(--icons-green)] border border-sky-500/20 dark:border-[var(--icons-green)]/20 text-[10px] font-black uppercase tracking-wide hover:bg-sky-500/20 dark:hover:bg-[var(--icons-green)]/25 transition-colors"
            >
              <Icon name="FileSearch" className="w-3.5 h-3.5" />
              Ver datos SUNAT
            </button>
          </div>
          <ul className="space-y-1.5">
            {diagnostico.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--border-subtle)] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </td>
    </tr>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SellersSolicitudes() {
  const {
    datos, buscar, setBuscar,
    filtroEstado, setFiltroEstado,
    expandido, toggleExpandido,
    pagina, totalPaginas, cambiarPagina,
    resumen, totalFiltrado,
    cambiarEstado, cambiandoEstado, errorEstado,
  } = useSellers();

  const [modalSunat, setModalSunat] = useState<Solicitud | null>(null);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">

      {/* ── Header ── */}
      <ModuleHeader
        title="Solicitudes de Registro"
        subtitle="Evaluación automática por RPA · Marketplace Bienestar & Salud"
        icon="Users"
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={resumen.total} accent="text-[var(--text-primary)]" />
        <StatCard label="Aceptados" value={resumen.aceptados} accent="text-emerald-400" />
        <StatCard label="En revisión" value={resumen.revision} accent="text-amber-400" />
        <StatCard label="Rechazados" value={resumen.rechazados} accent="text-rose-400" />
      </div>

      {/* ── Tabla ── */}
      <div className="space-y-4">

        {/* Barra superior */}
        <div className="flex items-center justify-between px-1">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-500/10 dark:bg-[var(--icons-green)]/15 rounded-xl flex items-center justify-center border border-sky-500/20 dark:border-[var(--icons-green)]/20 text-sky-400 dark:text-[var(--icons-green)]">
              <Icon name="Users" className="w-4 h-4 stroke-[2.5px]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                Solicitudes Registradas
              </h2>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                {totalFiltrado} resultado{totalFiltrado !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Buscador */}
            <div className="relative">
              <Icon name="Search" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)] pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por RUC, empresa, correo…"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[11px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500/50 dark:focus:border-[var(--icons-green)]/50 transition-colors w-52"
              />
            </div>

            {/* Filtros de estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
              className="text-[10px] font-black uppercase tracking-wide rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] px-3 py-1.5 focus:outline-none focus:border-sky-500/50 dark:focus:border-[var(--icons-green)]/50 cursor-pointer"
            >
              {FILTROS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  {["Empresa", "DNI", "Correo", "Score", "Estado", "Registro", ""].map((h, i, arr) => (
                    <th
                      key={h || `col-${i}`}
                      className={`px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap
                        ${i === 0 ? "rounded-tl-2xl" : ""}
                        ${i === arr.length - 1 ? "rounded-tr-2xl" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {datos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-[var(--text-secondary)] text-sm">
                      Sin resultados para los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  datos.map((s) => (
                    <React.Fragment key={s.id}>
                      <tr
                        onClick={() => toggleExpandido(s.id)}

                        className={`border-b border-[var(--border-subtle)] cursor-pointer transition-colors
                          ${expandido === s.id ? "bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]"}`}
                      >

                        {/* Empresa */}
                        <td className="px-4 py-4 min-w-[200px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-[var(--text-primary)] leading-tight">{s.nombreComercial}</p>
                            {s.etapa === 0 && <FallbackBadge />}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-tight">
                            {s.etapa === 0 ? (s.ruc || '—') : s.razonSocial}
                          </p>
                        </td>

                        {/* DNI */}
                        <td className="px-4 py-4 font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
                          {s.dni}
                        </td>

                        {/* Correo */}
                        <td className="px-4 py-4 text-[var(--text-secondary)] text-xs whitespace-nowrap">
                          {s.correo}
                        </td>

                        {/* Score */}
                        <td className="px-4 py-4 min-w-[110px]">
                          <ScoreBar score={s.score} />
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EstadoSelector
                            estado={s.estado}
                            disabled={cambiandoEstado === s.id}
                            onChange={(nuevo) => {
                              if (nuevo === s.estado) return;
                              const confirmar = window.confirm(
                                `¿Cambiar el estado de "${s.nombreComercial}" de ${ESTADO_CONFIG[s.estado].label} a ${ESTADO_CONFIG[nuevo].label}?` +
                                (nuevo === "ACEPTADO" ? "\n\nEsto creará la tienda en el marketplace si aún no existe." : "")
                              );
                              if (confirmar) cambiarEstado(s.id, nuevo);
                            }}
                          />
                        </td>

                        {/* Fecha */}
                        <td className="px-4 py-4 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                          {formatFecha(s.fechaRegistro)}
                        </td>

                        {/* Expand icon */}
                        <td className="px-4 py-4">
                          <Icon
                            name="ChevronDown"
                            className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${expandido === s.id ? "rotate-180" : ""
                              }`}
                          />
                        </td>
                      </tr>

                      {/* Diagnóstico expandible */}
                      {expandido === s.id && (
                        <FilaDiagnostico
                          diagnostico={s.diagnostico}
                          colSpan={9}
                          onVerSunat={() => setModalSunat(s)}
                        />
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Paginación ── */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                Página {pagina} de {totalPaginas} · {totalFiltrado} resultado{totalFiltrado !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => cambiarPagina(pagina - 1)}
                  disabled={pagina === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => cambiarPagina(n)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors
                      ${n === pagina
                        ? "bg-sky-500/20 dark:bg-[var(--icons-green)]/20 text-sky-400 dark:text-[var(--icons-green)] border border-sky-500/30 dark:border-[var(--icons-green)]/30"
                        : "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                  >
                    {n}
                  </button>
                ))}

                <button
                  onClick={() => cambiarPagina(pagina + 1)}
                  disabled={pagina === totalPaginas}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-center text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
          Haz clic en cualquier fila para ver el diagnóstico completo del RPA
        </p>

        {errorEstado && (
          <p className="text-center text-xs font-bold text-rose-400">
            {errorEstado}
          </p>
        )}
      </div>

      {modalSunat && (
        <SunatDataModal solicitud={modalSunat} onClose={() => setModalSunat(null)} />
      )}

    </div>
  );
}